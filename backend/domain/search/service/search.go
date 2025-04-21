package service

import (
	"context"
	"strconv"

	"github.com/elastic/go-elasticsearch/v8/typedapi/core/search"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types"

	searchItf "code.byted.org/flow/opencoze/backend/domain/search"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
)

type SearchConfig struct {
	DomainEventBus searchItf.DomainEventBus
}

func NewSearchService(ctx context.Context, c *SearchConfig) (searchItf.Search, error) {

	si := &searchImpl{
		eventBus: c.DomainEventBus,
	}

	err := si.eventBus.Subscribe(ctx, si.indexApps)
	if err != nil {
		return nil, err
	}

	return si, nil
}

type searchImpl struct {
	eventBus searchItf.DomainEventBus
	esClient es8.Client
}

func (s *searchImpl) SearchApps(ctx context.Context, req *searchEntity.SearchRequest) (resp *searchEntity.SearchResponse, err error) {
	sr := s.esClient.Search()

	sr.Index(appIndexName)

	searchReq := &search.Request{
		Query: &types.Query{
			Bool: &types.BoolQuery{
				Must:   make([]types.Query, 0),
				Filter: make([]types.Query, 0),
			},
		},
	}

	searchReq.Query.Bool.Filter = append(searchReq.Query.Bool.Filter, types.Query{
		Term: map[string]types.TermQuery{
			"space_id": {Value: strconv.FormatInt(req.SpaceID, 10)},
		},
	})

	if req.Name != "" {
		searchReq.Query.Bool.Must = append(searchReq.Query.Bool.Must, types.Query{
			Match: map[string]types.MatchQuery{
				"name": {Query: req.Name},
			},
		})
	}

	if req.IsPublished {
		searchReq.Query.Bool.Filter = append(searchReq.Query.Bool.Filter, types.Query{
			Term: map[string]types.TermQuery{
				"has_published": {Value: true},
			},
		})
	}

	// 设置排序
	if req.OrderBy != "" {
		// sr.Sort(string(req.OrderBy), req.Order)
	}

	// 设置分页
	if req.Limit > 0 {
		sr.Size(req.Limit)
	}
	if req.Cursor != "" {
		// sr.SearchAfter(req.Cursor)
	}

	// 执行搜索
	result, err := sr.Request(searchReq).Do(ctx)
	if err != nil {
		return nil, err
	}

	// 处理结果
	resp = &searchEntity.SearchResponse{
		Data: make([]*searchEntity.AppDocument, 0, len(result.Hits.Hits)),
	}

	// for _, hit := range result.Hits.Hits {
	// 	doc := &searchEntity.AppDocument{}
	//
	// 	if err := hit(doc); err != nil {
	// 		return nil, err
	// 	}
	// 	resp.Data = append(resp.Data, doc)
	// }

	// 设置分页信息
	resp.HasMore = len(result.Hits.Hits) == req.Limit
	if resp.HasMore && len(result.Hits.Hits) > 0 {
		lastHit := result.Hits.Hits[len(result.Hits.Hits)-1]
		resp.NextCursor = lastHit.Sort[0].(string)
	}

	return resp, nil
}
