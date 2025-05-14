package elasticsearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"
	"github.com/cloudwego/eino/schema"
	"github.com/elastic/go-elasticsearch/v8/esutil"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/search"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types/enums/operator"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types/enums/textquerytype"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type esSearchStore struct {
	config    *ManagerConfig
	indexName string
}

func (e *esSearchStore) Store(ctx context.Context, docs []*schema.Document, opts ...indexer.Option) (ids []string, err error) {
	cli := e.config.Client
	index := e.indexName
	bi, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Client: cli,
		Index:  index,
	})
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

		if err = bi.Add(ctx, esutil.BulkIndexerItem{
			Index:      e.indexName,
			Action:     "index",
			DocumentID: doc.ID,
			Body:       bytes.NewReader(body),
		}); err != nil {
			return nil, err
		}
		ids = append(ids, doc.ID)
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
	)

	var q *types.Query
	if implSpecOptions.MultiMatch == nil {
		q = &types.Query{
			Bool: &types.BoolQuery{
				Must: []types.Query{
					{
						Match: map[string]types.MatchQuery{
							searchstore.FieldTextContent: {Query: query},
						},
					},
				},
			},
		}
	} else {

		q = &types.Query{
			Bool: &types.BoolQuery{
				Must: []types.Query{
					{
						MultiMatch: &types.MultiMatchQuery{
							Fields:   implSpecOptions.MultiMatch.Fields,
							Operator: &operator.Or,
							Query:    query,
							Type:     &textquerytype.Bestfields,
						},
					},
				},
			},
		}
	}

	dsl, err := searchstore.LoadDSL(options.DSLInfo)
	if err != nil {
		return nil, err
	}

	if err = e.travDSL(q, dsl); err != nil {
		return nil, err
	}

	req := &search.Request{
		Query: q,
		Size:  options.TopK,
	}

	if options.ScoreThreshold != nil {
		req.MinScore = (*types.Float64)(options.ScoreThreshold)
	}

	resp, err := search.NewSearchFunc(cli)().Index(index).Request(req).Do(ctx)
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
	bi, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Client: e.config.Client,
		Index:  e.indexName,
	})
	if err != nil {
		return err
	}

	for _, id := range ids {
		if err = bi.Add(ctx, esutil.BulkIndexerItem{
			Index:      e.indexName,
			Action:     "delete",
			DocumentID: id,
		}); err != nil {
			return err
		}
	}

	return bi.Close(ctx)
}

func (e *esSearchStore) travDSL(query *types.Query, dsl *searchstore.DSL) error {
	if dsl == nil {
		return nil
	}

	switch dsl.Op {
	case searchstore.OpEq:
		query.Bool.Must = append(query.Bool.Must, types.Query{
			Term: map[string]types.TermQuery{
				dsl.Field: {Value: dsl.Value},
			},
		})
	case searchstore.OpNe:
		query.Bool.MustNot = append(query.Bool.MustNot, types.Query{
			Term: map[string]types.TermQuery{
				dsl.Field: {Value: dsl.Value},
			},
		})
	case searchstore.OpLike:
		s, ok := dsl.Value.(string)
		if !ok {
			return fmt.Errorf("[travDSL] OpLike value should be string, but got %v", dsl.Value)
		}
		query.Bool.Must = append(query.Bool.Must, types.Query{
			Match: map[string]types.MatchQuery{
				dsl.Field: {Query: s},
			},
		})
	case searchstore.OpIn:
		query.Bool.Must = append(query.Bool.Must, types.Query{
			Terms: &types.TermsQuery{
				TermsQuery: map[string]types.TermsQueryField{
					dsl.Field: dsl.Value,
				},
			},
		})
	case searchstore.OpAnd:
		conds, ok := dsl.Value.([]*searchstore.DSL)
		if !ok {
			return fmt.Errorf("[trav] value type assertion failed for or")
		}
		for _, cond := range conds {
			sub := &types.Query{}
			if err := e.travDSL(sub, cond); err != nil {
				return err
			}
			query.Bool.Must = append(query.Bool.Must, *sub)
		}
	case searchstore.OpOr:
		conds, ok := dsl.Value.([]*searchstore.DSL)
		if !ok {
			return fmt.Errorf("[trav] value type assertion failed for or")
		}
		for _, cond := range conds {
			sub := &types.Query{}
			if err := e.travDSL(sub, cond); err != nil {
				return err
			}
			query.Bool.Should = append(query.Bool.Should, *sub)
		}
	default:
		return fmt.Errorf("[trav] unknown op %s", dsl.Op)
	}

	return nil
}

func (e *esSearchStore) parseSearchResult(resp *search.Response) (docs []*schema.Document, err error) {
	docs = make([]*schema.Document, 0, len(resp.Hits.Hits))
	for _, hit := range resp.Hits.Hits {
		var src map[string]any
		if err = json.Unmarshal(hit.Source_, &src); err != nil {
			return nil, err
		}

		ext := make(map[string]any)
		doc := &schema.Document{MetaData: map[string]any{document.MetaDataKeyExternalStorage: ext}}

		for field, val := range src {
			var ok bool
			switch field {
			case searchstore.FieldTextContent:
				doc.Content, ok = val.(string)
			case searchstore.FieldCreatorID:
				doc.MetaData[document.MetaDataKeyCreatorID], ok = val.(int64)
			default:
				ext[field] = val
			}
			if !ok {
				return nil, fmt.Errorf("[parseSearchResult] type assertion failed, field=%s, val=%v", field, val)
			}
		}

		if hit.Id_ != nil {
			doc.ID = *hit.Id_
		}

		if hit.Score_ != nil {
			doc.WithScore(float64(*hit.Score_))
		}

		docs = append(docs, doc)
	}

	return docs, nil
}

func (e *esSearchStore) fromDocument(doc *schema.Document) (map[string]any, error) {
	if doc.MetaData == nil {
		return nil, fmt.Errorf("[fromDocument] es document meta data is nil")
	}

	creatorID, ok := doc.MetaData[string(searchstore.FieldCreatorID)].(int64)
	if !ok {
		return nil, fmt.Errorf("[fromDocument] creator id not found or type invalid")
	}

	fieldMapping := map[string]any{
		searchstore.FieldTextContent: doc.Content,
		searchstore.FieldCreatorID:   creatorID,
	}

	ext, ok := doc.MetaData[document.MetaDataKeyExternalStorage].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("[fromDocument] meta data external storage not found or type invalid")
	}

	for k, v := range ext {
		fieldMapping[k] = v
	}

	return fieldMapping, nil
}
