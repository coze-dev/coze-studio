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

package es

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/elastic/go-elasticsearch/v7"
	"github.com/elastic/go-elasticsearch/v7/esapi"
	"github.com/elastic/go-elasticsearch/v7/esutil"

	"github.com/coze-dev/coze-studio/backend/infra/contract/es"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type es7Client struct {
	esClient *elasticsearch.Client
}

func newES7() (Client, error) {
	esAddr := os.Getenv("ES_ADDR")
	esUsername := os.Getenv("ES_USERNAME")
	esPassword := os.Getenv("ES_PASSWORD")

	esClient, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{esAddr},
		Username:  esUsername,
		Password:  esPassword,
	})
	if err != nil {
		return nil, err
	}

	return &es7Client{esClient: esClient}, nil
}

func (c *es7Client) Create(ctx context.Context, index, id string, document any) error {
	body, err := json.Marshal(document)
	if err != nil {
		return err
	}

	req := esapi.IndexRequest{
		Index:      index,
		DocumentID: id,
		Body:       bytes.NewReader(body),
		Refresh:    "true",
	}

	logs.CtxDebugf(ctx, "[Create] req : %s", conv.DebugJsonToStr(req))
	_, err = req.Do(ctx, c.esClient)
	return err
}

func (c *es7Client) Update(ctx context.Context, index, id string, document any) error {
	bodyMap := map[string]any{"doc": document}
	body, err := json.Marshal(bodyMap)
	if err != nil {
		return err
	}
	req := esapi.UpdateRequest{
		Index:      index,
		DocumentID: id,
		Body:       bytes.NewReader(body),
	}

	logs.CtxDebugf(ctx, "[Update] req : %s", conv.DebugJsonToStr(req))

	_, err = req.Do(ctx, c.esClient)
	return err
}

func (c *es7Client) Delete(ctx context.Context, index, id string) error {
	req := esapi.DeleteRequest{
		Index:      index,
		DocumentID: id,
	}

	logs.CtxDebugf(ctx, "[Delete] req : %s", conv.DebugJsonToStr(req))

	_, err := req.Do(ctx, c.esClient)
	return err
}

func (c *es7Client) Exists(ctx context.Context, index string) (bool, error) {
	req := esapi.IndicesExistsRequest{Index: []string{index}}
	logs.CtxDebugf(ctx, "[Exists] req : %s", conv.DebugJsonToStr(req))

	res, err := req.Do(ctx, c.esClient)
	if err != nil {
		return false, err
	}
	defer res.Body.Close()
	return res.StatusCode == 200, nil
}

func (c *es7Client) CreateIndex(ctx context.Context, index string, properties map[string]any) error {
	mapping := map[string]any{
		"mappings": map[string]any{
			"properties": properties,
		},
	}

	body, err := json.Marshal(mapping)
	if err != nil {
		return err
	}

	req := esapi.IndicesCreateRequest{
		Index: index,
		Body:  bytes.NewReader(body),
	}

	logs.CtxDebugf(ctx, "[CreateIndex] req : %s", conv.DebugJsonToStr(req))
	_, err = req.Do(ctx, c.esClient)
	return err
}

func (c *es7Client) DeleteIndex(ctx context.Context, index string) error {
	req := esapi.IndicesDeleteRequest{
		Index:             []string{index},
		IgnoreUnavailable: ptr.Of(true),
	}

	logs.CtxDebugf(ctx, "[DeleteIndex] req : %s", conv.DebugJsonToStr(req))
	_, err := req.Do(ctx, c.esClient)
	return err
}

func (c *es7Client) Search(ctx context.Context, index string, req *Request) (*Response, error) {
	queryBody := map[string]any{}
	if q := c.query2ESQuery(req.Query); q != nil {
		queryBody["query"] = q
	}
	if req.Size != nil {
		queryBody["size"] = *req.Size
	}
	if req.MinScore != nil {
		queryBody["min_score"] = *req.MinScore
	}
	if len(req.Sort) > 0 {
		var sorts []map[string]any
		for _, s := range req.Sort {
			order := "asc"
			if !s.Asc {
				order = "desc"
			}
			sorts = append(sorts, map[string]any{
				s.Field: map[string]string{"order": order},
			})
		}
		queryBody["sort"] = sorts
	}

	if req.From != nil {
		queryBody["from"] = *req.From
	} else {
		if len(req.SearchAfter) > 0 {
			queryBody["search_after"] = req.SearchAfter
		}
	}

	body, err := json.Marshal(queryBody)
	if err != nil {
		return nil, err
	}

	res, err := c.esClient.Search(
		c.esClient.Search.WithContext(ctx),
		c.esClient.Search.WithIndex(index),
		c.esClient.Search.WithBody(bytes.NewReader(body)),
	)

	logs.CtxDebugf(ctx, "[Search] req : %s", string(body))

	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	respBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	var esResp Response
	if err := json.Unmarshal(respBytes, &esResp); err != nil {
		return nil, err
	}
	return &esResp, nil
}

func (c *es7Client) query2ESQuery(q *Query) map[string]any {
	if q == nil {
		return nil
	}

	var base map[string]any

	switch q.Type {
	case es.QueryTypeEqual:
		base = map[string]any{
			"term": map[string]any{
				q.KV.Key: q.KV.Value,
			},
		}
	case es.QueryTypeMatch:
		base = map[string]any{
			"match": map[string]any{
				q.KV.Key: fmt.Sprint(q.KV.Value),
			},
		}
	case es.QueryTypeMultiMatch:
		base = map[string]any{
			"multi_match": map[string]any{
				"fields":   q.MultiMatchQuery.Fields,
				"operator": q.MultiMatchQuery.Operator,
				"query":    q.MultiMatchQuery.Query,
				"type":     q.MultiMatchQuery.Type,
			},
		}
	case es.QueryTypeNotExists:
		base = map[string]any{
			"bool": map[string]any{
				"must_not": []map[string]any{
					{"exists": map[string]any{"field": q.KV.Key}},
				},
			},
		}
	case es.QueryTypeContains:
		base = map[string]any{
			"wildcard": map[string]any{
				q.KV.Key: map[string]any{
					"value":            fmt.Sprintf("*%s*", q.KV.Value),
					"case_insensitive": true,
				},
			},
		}
	case es.QueryTypeIn:
		base = map[string]any{
			"terms": map[string]any{
				q.KV.Key: q.KV.Value,
			},
		}
	default:
		base = map[string]any{}
	}

	// If there is no BoolQuery, return the base query directly
	if q.Bool == nil {
		return base
	}

	// If there is a BoolQuery, make base part of the BoolQuery (or empty).
	boolQuery := map[string]any{}

	appendBool := func(key string, queries []Query) {
		if len(queries) == 0 {
			return
		}
		var arr []map[string]any
		for i := range queries {
			sub := c.query2ESQuery(&queries[i])
			if sub != nil {
				arr = append(arr, sub)
			}
		}
		if len(arr) > 0 {
			boolQuery[key] = arr
		}
	}

	appendBool("filter", q.Bool.Filter)
	appendBool("must", q.Bool.Must)
	appendBool("must_not", q.Bool.MustNot)
	appendBool("should", q.Bool.Should)

	// If base is not empty, append it as a filter
	if len(base) > 0 {
		if _, ok := boolQuery["filter"]; !ok {
			boolQuery["filter"] = []map[string]any{}
		}
		boolQuery["filter"] = append(boolQuery["filter"].([]map[string]any), base)
	}

	if q.Bool.MinimumShouldMatch != nil {
		boolQuery["minimum_should_match"] = *q.Bool.MinimumShouldMatch
	}

	return map[string]any{"bool": boolQuery}
}

func (c *es7Client) NewBulkIndexer(index string) (BulkIndexer, error) {
	bi, err := esutil.NewBulkIndexer(esutil.BulkIndexerConfig{
		Client: c.esClient,
		Index:  index,
	})
	if err != nil {
		return nil, err
	}
	return &es7BulkIndexer{bi: bi}, nil
}

type es7BulkIndexer struct {
	bi esutil.BulkIndexer
}

func (b *es7BulkIndexer) Add(ctx context.Context, item BulkIndexerItem) error {
	var buf bytes.Buffer
	if item.Body != nil {
		data, err := json.Marshal(item.Body)
		if err != nil {
			return err
		}
		buf.Write(data)
	}

	return b.bi.Add(ctx, esutil.BulkIndexerItem{
		Action:          item.Action,
		DocumentID:      item.DocumentID,
		Body:            &buf,
		Routing:         item.Routing,
		Version:         item.Version,
		VersionType:     item.VersionType,
		RetryOnConflict: item.RetryOnConflict,
	},
	)
}

func (b *es7BulkIndexer) Close(ctx context.Context) error {
	return b.bi.Close(ctx)
}

func (c *es7Client) Types() Types {
	return &es7Types{}
}

type es7Types struct{}

func (t *es7Types) NewLongNumberProperty() any {
	return map[string]string{"type": "long"}
}

func (t *es7Types) NewTextProperty() any {
	return map[string]string{"type": "text"}
}

func (t *es7Types) NewUnsignedLongNumberProperty() any {
	return map[string]string{"type": "unsigned_long"}
}
