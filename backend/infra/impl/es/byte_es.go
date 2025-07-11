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
	"context"
	"fmt"
	"strconv"

	"code.byted.org/ad/elastic-go/v7"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/es"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/ptr"
	"code.byted.org/data_edc/workflow_engine_next/pkg/sonic"
	"code.byted.org/data_edc/workflow_engine_next/types/consts"
	"code.byted.org/gopkg/logs"
)

type byteESClient struct {
	readClient  *elastic.Client
	writeClient *elastic.Client
}

func newByteES() (Client, error) {
	ctx := context.Background()
	readClient, err := elastic.NewClient(elastic.SetConsulSniff(consts.ElasticSearchPSM, "client"), elastic.SetCustomMetricsPrefix(consts.WorkflowEnginePSM+".read"))

	if err != nil {
		logs.CtxError(ctx, "[newByteES] new read client failed, err: %v", err)
		return nil, err
	}

	writeClient, err := elastic.NewClient(elastic.SetConsulSniff(consts.ElasticSearchPSM, "data"), elastic.SetCustomMetricsPrefix(consts.WorkflowEnginePSM+".write"))

	return &byteESClient{
		readClient:  readClient,
		writeClient: writeClient,
	}, nil
}

func (c *byteESClient) Create(ctx context.Context, index, id string, document any) error {

	_, err := c.writeClient.Index().Index(index).Id(id).BodyJson(document).Do(ctx)
	if err != nil {
		logs.CtxError(ctx, "[create] create index failed, err: %v", err)
		return err
	}

	return nil
}

func (c *byteESClient) Update(ctx context.Context, index, id string, document any) error {
	_, err := c.writeClient.Update().Index(index).Id(id).Doc(document).Do(ctx)
	if err != nil {
		logs.CtxError(ctx, "[update] update index failed, err: %v", err)
		return err
	}
	return nil
}

func (c *byteESClient) Delete(ctx context.Context, index, id string) error {
	_, err := c.writeClient.Delete().Index(index).Id(id).Do(ctx)
	if err != nil {
		logs.CtxError(ctx, "[delete] delete index failed, err: %v", err)
		return err
	}
	return nil
}

func (c *byteESClient) Exists(ctx context.Context, index string) (bool, error) {
	_, err := c.readClient.Exists().Index(index).Id("").Do(ctx)
	if err != nil {
		logs.CtxError(ctx, "[exists] exists index failed, err: %v", err)
		return false, err
	}
	return true, nil
}

func (c *byteESClient) CreateIndex(ctx context.Context, index string, properties map[string]any) error {
	_, err := c.writeClient.CreateIndex(index).BodyJson(properties).Do(ctx)
	if err != nil {
		logs.CtxError(ctx, "[create] create index failed, err: %v", err)
		return err
	}
	return nil
}

func (c *byteESClient) DeleteIndex(ctx context.Context, index string) error {
	_, err := c.writeClient.DeleteIndex(index).Do(ctx)
	if err != nil {
		logs.CtxError(ctx, "[delete] delete index failed, err: %v", err)
		return err
	}
	return nil
}

func (c *byteESClient) Search(ctx context.Context, index string, req *Request) (*Response, error) {
	if req == nil {
		return nil, fmt.Errorf("req is nil")
	}
	q := c.query2ESQuery(req.Query)

	res, err := c.readClient.Search().Index(index).Query(q).Do(ctx)
	if err != nil {
		logs.CtxError(ctx, "[search] search index failed, err: %v", err)
		return nil, err
	}

	var hits = es.HitsMetadata{}
	hitStr, _ := sonic.MarshalString(res.Hits)
	_ = sonic.UnmarshalString(hitStr, &hits)
	return &Response{
		Hits:     hits,
		MaxScore: hits.MaxScore,
	}, nil
}

func (c *byteESClient) query2ESQuery(q *Query) elastic.Query {
	if q == nil {
		return nil
	}

	var typesQ elastic.Query
	switch q.Type {
	case es.QueryTypeEqual:
		typesQ = elastic.NewTermQuery(q.KV.Key, q.KV.Value)

	case es.QueryTypeMatch:
		typesQ = elastic.NewMatchQuery(q.KV.Key, q.KV.Value)

	case es.QueryTypeMultiMatch:
		typesQ = elastic.NewMultiMatchQuery(q.MultiMatchQuery.Query, q.MultiMatchQuery.Fields...)

	case es.QueryTypeNotExists:
		typesQ = elastic.NewBoolQuery().MustNot(elastic.NewExistsQuery(q.KV.Key))

	case es.QueryTypeContains:
		typesQ = elastic.NewWildcardQuery(q.KV.Key, fmt.Sprintf("*%s*", q.KV.Value)).CaseInsensitive(true)

	case es.QueryTypeIn:
		// TODO:: 转下Interface
		typesQ = elastic.NewTermsQuery(q.KV.Key, q.KV.Value)

	default:

	}

	if q.Bool == nil {
		return typesQ
	}

	boolQuery := elastic.NewBoolQuery()
	for idx := range q.Bool.Filter {
		v := q.Bool.Filter[idx]
		boolQuery.Filter(c.query2ESQuery(&v))
	}

	for idx := range q.Bool.Must {
		v := q.Bool.Must[idx]
		boolQuery.Must(c.query2ESQuery(&v))
	}

	for idx := range q.Bool.MustNot {
		v := q.Bool.MustNot[idx]
		boolQuery.Must(c.query2ESQuery(&v))
	}

	for idx := range q.Bool.Should {
		v := q.Bool.Should[idx]
		boolQuery.Should(c.query2ESQuery(&v))
	}

	if q.Bool.MinimumShouldMatch != nil {
		v := q.Bool.MinimumShouldMatch
		boolQuery.MinimumShouldMatch(strconv.Itoa(*v))
	}

	return typesQ
}

func (c *byteESClient) NewBulkIndexer(index string) (BulkIndexer, error) {
	return &byteESBulkIndexer{index, elastic.NewBulkService(c.writeClient)}, nil
}

type byteESBulkIndexer struct {
	index string
	bs    *elastic.BulkService
}

func (b *byteESBulkIndexer) Add(ctx context.Context, item BulkIndexerItem) error {
	var req elastic.BulkableRequest
	switch item.Action {
	case "index":
		req = elastic.NewBulkIndexRequest().
			Id(item.DocumentID).
			Index(b.index).
			Doc(item.Body).
			Routing(item.Routing).
			Version(ptr.From(item.Version)).
			VersionType(item.VersionType).
			RetryOnConflict(ptr.From(item.RetryOnConflict))

	case "delete":
		req = elastic.NewBulkDeleteRequest().
			Id(item.DocumentID).
			Index(b.index).
			Routing(item.Routing).
			Version(ptr.From(item.Version)).
			VersionType(item.VersionType)

	default:
		return fmt.Errorf("unknown action: %s", item.Action)
	}

	b.bs = b.bs.Add(req)
	return nil
}

func (b *byteESBulkIndexer) Close(ctx context.Context) error {
	_, err := b.bs.Do(ctx)
	return err
}

func (c *byteESClient) Types() Types {
	return &es7Types{}
}
