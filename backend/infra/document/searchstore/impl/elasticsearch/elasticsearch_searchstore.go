/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package elasticsearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"

	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/es"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type esSearchStore struct {
	config    *ManagerConfig
	indexName string
}

func (e *esSearchStore) Store(ctx context.Context, docs []*schema.Document, opts ...indexer.Option) (ids []string, err error) {
	implSpecOptions := indexer.GetImplSpecificOptions(&searchstore.IndexerOptions{}, opts...)
	defer func() {
		if err != nil {
			if implSpecOptions.ProgressBar != nil {
				implSpecOptions.ProgressBar.ReportError(err)
			}
		}
	}()
	cli := e.config.Client
	index := e.indexName
	bi, err := cli.NewBulkIndexer(index)
	if err != nil {
		return nil, err
	}
	ids = make([]string, 0, len(docs))
	for _, doc := range docs {
		fieldMapping, err := e.fromDocument(doc)
		if err != nil {
			return nil, err
		}
		body, err := json.Marshal(fieldMapping)
		if err != nil {
			return nil, err
		}

		if err = bi.Add(ctx, es.BulkIndexerItem{
			Index:      e.indexName,
			Action:     "index",
			DocumentID: doc.ID,
			Body:       bytes.NewReader(body),
		}); err != nil {
			return nil, err
		}
		ids = append(ids, doc.ID)
		if implSpecOptions.ProgressBar != nil {
			if err = implSpecOptions.ProgressBar.AddN(1); err != nil {
				return nil, err
			}
		}
	}

	if err = bi.Close(ctx); err != nil {
		return nil, err
	}

	return ids, nil
}

func (e *esSearchStore) Retrieve(ctx context.Context, query string, opts ...retriever.Option) ([]*schema.Document, error) {
	var (
		cli   = e.config.Client
		index = e.indexName

		options         = retriever.GetCommonOptions(&retriever.Options{TopK: ptr.Of(topK)}, opts...)
		implSpecOptions = retriever.GetImplSpecificOptions(&searchstore.RetrieverOptions{}, opts...)
		req             = &es.Request{
			Query: &es.Query{
				Bool: &es.BoolQuery{},
			},
			Size: options.TopK,
		}
	)

	if implSpecOptions.MultiMatch == nil {
		req.Query.Bool.Must = append(req.Query.Bool.Must,
			es.NewMatchQuery(searchstore.FieldTextContent, query))
	} else {
		req.Query.Bool.Must = append(req.Query.Bool.Must,
			es.NewMultiMatchQuery(implSpecOptions.MultiMatch.Fields, query,
				"best_fields", es.Or))
	}

	dsl, err := searchstore.LoadDSL(options.DSLInfo)
	if err != nil {
		return nil, err
	}

	if err = e.travDSL(req.Query, dsl); err != nil {
		return nil, err
	}

	if options.ScoreThreshold != nil {
		req.MinScore = options.ScoreThreshold
	}

	resp, err := cli.Search(ctx, index, req)
	if err != nil {
		return nil, err
	}

	docs, err := e.parseSearchResult(resp)
	if err != nil {
		return nil, err
	}

	return docs, nil
}

func (e *esSearchStore) Delete(ctx context.Context, ids []string) error {
	bi, err := e.config.Client.NewBulkIndexer(e.indexName)
	if err != nil {
		return err
	}

	for _, id := range ids {
		if err = bi.Add(ctx, es.BulkIndexerItem{
			Index:      e.indexName,
			Action:     "delete",
			DocumentID: id,
		}); err != nil {
			return err
		}
	}

	return bi.Close(ctx)
}

func (e *esSearchStore) travDSL(query *es.Query, dsl *searchstore.DSL) error {
	if dsl == nil {
		return nil
	}

	switch dsl.Op {
	case searchstore.OpEq, searchstore.OpNe:
		arr := stringifyValue(dsl.Value)
		v := dsl.Value
		if len(arr) > 0 {
			v = arr[0]
		}

		if dsl.Op == searchstore.OpEq {
			query.Bool.Must = append(query.Bool.Must,
				es.NewEqualQuery(dsl.Field, v))
		} else {
			query.Bool.MustNot = append(query.Bool.MustNot,
				es.NewEqualQuery(dsl.Field, v))
		}
	case searchstore.OpLike:
		s, ok := dsl.Value.(string)
		if !ok {
			return fmt.Errorf("[travDSL] OpLike value should be string, but got %v", dsl.Value)
		}
		query.Bool.Must = append(query.Bool.Must, es.NewMatchQuery(dsl.Field, s))

	case searchstore.OpIn:
		query.Bool.Must = append(query.Bool.Must,
			es.NewInQuery(dsl.Field, stringifyValue(dsl.Value)))

	case searchstore.OpAnd, searchstore.OpOr:
		conds, ok := dsl.Value.([]*searchstore.DSL)
		if !ok {
			return fmt.Errorf("[travDSL] value type assertion failed for or")
		}

		for _, cond := range conds {
			sub := &es.Query{}
			if err := e.travDSL(sub, cond); err != nil {
				return err
			}
			if dsl.Op == searchstore.OpOr {
				query.Bool.Should = append(query.Bool.Should, *sub)
			} else {
				query.Bool.Must = append(query.Bool.Must, *sub)
			}
		}

	default:
		return fmt.Errorf("[trav] unknown op %s", dsl.Op)
	}

	return nil
}

func (e *esSearchStore) parseSearchResult(resp *es.Response) (docs []*schema.Document, err error) {
	docs = make([]*schema.Document, 0, len(resp.Hits.Hits))
	firstScore := 0.0
	for i, hit := range resp.Hits.Hits {
		var src map[string]any
		d := json.NewDecoder(bytes.NewReader(hit.Source_))
		d.UseNumber()
		if err = d.Decode(&src); err != nil {
			return nil, err
		}

		ext := make(map[string]any)
		doc := &schema.Document{MetaData: map[string]any{document.MetaDataKeyExternalStorage: ext}}

		for field, val := range src {
			ok := true
			switch field {
			case searchstore.FieldTextContent:
				doc.Content, ok = val.(string)
			case searchstore.FieldCreatorID:
				var jn json.Number
				jn, ok = val.(json.Number)
				if ok {
					doc.MetaData[document.MetaDataKeyCreatorID], ok = assertJSONNumber(jn).(int64)
				}
			default:
				if jn, jok := val.(json.Number); jok {
					ext[field] = assertJSONNumber(jn)
				} else {
					ext[field] = val
				}
			}
			if !ok {
				return nil, fmt.Errorf("[parseSearchResult] type assertion failed, field=%s, val=%v", field, val)
			}
		}
		if hit.Id_ != nil {
			doc.ID = *hit.Id_
		}
		if hit.Score_ == nil { // unexpected
			return nil, fmt.Errorf("[parseSearchResult] es retrieve score not found")
		}
		score := float64(ptr.From(hit.Score_))
		if i == 0 {
			firstScore = score
		}
		doc.WithScore(score / firstScore)

		docs = append(docs, doc)
	}

	return docs, nil
}

func (e *esSearchStore) fromDocument(doc *schema.Document) (map[string]any, error) {
	if doc.MetaData == nil {
		return nil, fmt.Errorf("[fromDocument] es document meta data is nil")
	}

	creatorID, ok := doc.MetaData[searchstore.FieldCreatorID].(int64)
	if !ok {
		return nil, fmt.Errorf("[fromDocument] creator id not found or type invalid")
	}

	fieldMapping := map[string]any{
		searchstore.FieldTextContent: doc.Content,
		searchstore.FieldCreatorID:   creatorID,
	}

	if ext, ok := doc.MetaData[document.MetaDataKeyExternalStorage].(map[string]any); ok {
		for k, v := range ext {
			fieldMapping[k] = v
		}
	}

	return fieldMapping, nil
}

func stringifyValue(dslValue any) []any {
	value := reflect.ValueOf(dslValue)
	switch value.Kind() {
	case reflect.Slice, reflect.Array:
		length := value.Len()
		slice := make([]any, 0, length)
		for i := 0; i < length; i++ {
			elem := value.Index(i)
			switch elem.Kind() {
			case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
				slice = append(slice, strconv.FormatInt(elem.Int(), 10))
			case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
				slice = append(slice, strconv.FormatUint(elem.Uint(), 10))
			case reflect.Float32, reflect.Float64:
				slice = append(slice, strconv.FormatFloat(elem.Float(), 'f', -1, 64))
			case reflect.String:
				slice = append(slice, elem.String())
			default:
				slice = append(slice, elem) // do nothing
			}
		}
		return slice
	default:
		return []any{fmt.Sprintf("%v", value)}
	}
}

func assertJSONNumber(f json.Number) any {
	if i64, err := f.Int64(); err == nil {
		return i64
	}
	if f64, err := f.Float64(); err == nil {
		return f64
	}
	return f.String()
}
