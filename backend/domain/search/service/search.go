package service

import (
	"context"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/search"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types/enums/sortorder"

	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	searchItf "code.byted.org/flow/opencoze/backend/domain/search"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type SearchConfig struct {
	ESClient *es8.Client
}

func NewSearchService(ctx context.Context, c *SearchConfig) (searchItf.Search, eventbus.ConsumerHandler, error) {

	si := &searchImpl{
		esClient: c.ESClient,
	}

	ch := wrapDomainSubscriber(ctx, si.indexApps)

	return si, ch, nil
}

type searchImpl struct {
	esClient *es8.Client
}

type fieldName string

const (
	fieldOfSpaceID      = "space_id"
	fieldOfOwnerID      = "owner_id"
	fieldOfName         = "name"
	fieldOfHasPublished = "has_published"
	fieldOfStatus       = "status"
	fieldOfAppType      = "app_type"

	// resource index fields
	fieldOfResType       = "res_type"
	fieldOfPublishStatus = "publish_status"
	fieldOfResSubType    = "res_sub_type"
	fieldOfBizStatus     = "biz_status"
	fieldOfScores        = "scores"

	fieldOfCreateTime  = "create_time"
	fieldOfUpdateTime  = "update_time"
	fieldOfPublishTime = "publish_time"
)

func (s *searchImpl) SearchApps(ctx context.Context, req *searchEntity.SearchAppsRequest) (resp *searchEntity.SearchAppsResponse, err error) {
	sr := s.esClient.Search()

	mustQueries := make([]types.Query, 0, 10)

	mustQueries = append(mustQueries,
		types.Query{Term: map[string]types.TermQuery{
			fieldOfSpaceID: {Value: req.SpaceID},
		}},
		types.Query{
			Term: map[string]types.TermQuery{
				fieldOfHasPublished: {Value: searchEntity.HasPublishedEnum(req.IsPublished)},
			},
		},
	)

	if req.Name != "" {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfName: {Value: req.Name},
				},
			},
		)
	}

	if req.OwnerID > 0 {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfOwnerID: {Value: req.OwnerID},
				},
			})
	}

	if len(req.Status) > 0 {
		mustQueries = append(mustQueries,
			types.Query{
				Terms: &types.TermsQuery{
					TermsQuery: map[string]types.TermsQueryField{
						fieldOfStatus: req.Status,
					},
				},
			})
	}

	if len(req.AppTypes) > 0 {
		mustQueries = append(mustQueries,
			types.Query{
				Terms: &types.TermsQuery{
					TermsQuery: map[string]types.TermsQueryField{
						fieldOfAppType: req.AppTypes,
					},
				},
			})
	}

	searchReq := &search.Request{
		Query: &types.Query{
			Bool: &types.BoolQuery{
				Must:   mustQueries,
				Filter: make([]types.Query, 0),
			},
		},
	}

	sr = sr.Request(searchReq)
	sr.Index(appIndexName)

	reqLimit := 100
	if req.Limit > 0 {
		reqLimit = req.Limit
	}
	realLimit := reqLimit + 1
	orderBy := func() fieldName {
		switch req.OrderBy {
		case intelligence.OrderBy_UpdateTime:
			return fieldOfUpdateTime
		case intelligence.OrderBy_CreateTime:
			return fieldOfCreateTime
		case intelligence.OrderBy_PublishTime:
			return fieldOfPublishTime
		default:
			return fieldOfUpdateTime
		}
	}()
	order := common.OrderByType_Desc

	sr.Sort(&sortOptions{
		OrderBy: orderBy,
		Order: func() sortorder.SortOrder {
			if order == common.OrderByType_Asc {
				return sortorder.Asc
			}
			return sortorder.Desc
		}(),
	})

	sr.Size(realLimit)

	if req.Cursor != "" {
		sr.SearchAfter(&searchCursor{
			orderBy: orderBy,
			cursor:  req.Cursor,
		})
	}

	result, err := sr.Do(ctx)
	if err != nil {
		return nil, err
	}

	hits := result.Hits.Hits

	hasMore := func() bool {
		if len(hits) > reqLimit {
			return true
		}
		return false
	}()

	if hasMore {
		hits = hits[:reqLimit]
	}

	docs := make([]*searchEntity.AppDocument, 0, len(hits))
	for _, hit := range hits {
		doc, err := hit2AppDocument(hit)
		if err != nil {
			return nil, err
		}
		docs = append(docs, doc)
	}

	nextCursor := ""
	if len(docs) > 0 {
		nextCursor = formatNextCursor(orderBy, docs[len(docs)-1])
	}
	if nextCursor == "" {
		hasMore = false
	}

	resp = &searchEntity.SearchAppsResponse{
		Data:       docs,
		HasMore:    hasMore,
		NextCursor: nextCursor,
	}

	return resp, nil
}

func hit2AppDocument(hit types.Hit) (*searchEntity.AppDocument, error) {
	doc := &searchEntity.AppDocument{}

	if err := sonic.Unmarshal(hit.Source_, doc); err != nil {
		return nil, err
	}

	return doc, nil
}

type sortOptions struct {
	OrderBy fieldName
	Order   sortorder.SortOrder
}

func (s *sortOptions) SortCombinationsCaster() *types.SortCombinations {
	so := types.SortCombinations(types.SortOptions{
		SortOptions: map[string]types.FieldSort{
			string(s.OrderBy): {
				Order: ptr.Of(s.Order),
			},
		},
	})

	return ptr.Of(so)
}

type searchCursor struct {
	orderBy fieldName
	cursor  string
}

func (s *searchCursor) FieldValueCaster() *types.FieldValue {
	switch s.orderBy {
	case fieldOfCreateTime, fieldOfUpdateTime, fieldOfPublishTime:
		cursor, err := strconv.ParseInt(s.cursor, 10, 64)
		if err != nil {
			cursor = 0
		}

		return ptr.Of(types.FieldValue(cursor))
	default:
		return ptr.Of(types.FieldValue(s.cursor))
	}
}

func formatNextCursor(ob fieldName, val *searchEntity.AppDocument) string {
	switch ob {
	case fieldOfUpdateTime:
		return strconv.FormatInt(val.UpdateTime, 10)
	case fieldOfPublishTime:
		return strconv.FormatInt(val.PublishTime, 10)
	case fieldOfCreateTime:
		return strconv.FormatInt(val.CreateTime, 10)
	default:
		return ""
	}
}

func (s *searchImpl) SearchResources(ctx context.Context, req *searchEntity.SearchResourcesRequest) (
	resp *searchEntity.SearchResourcesResponse, err error) {
	sr := s.esClient.Search()

	mustQueries := make([]types.Query, 0, 10)

	mustQueries = append(mustQueries,
		types.Query{Term: map[string]types.TermQuery{
			fieldOfSpaceID: {Value: req.SpaceID},
		}},
	)

	if req.Name != "" {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfName: {Value: req.Name},
				},
			},
		)
	}

	if req.OwnerID > 0 {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfOwnerID: {Value: req.OwnerID},
				},
			})
	}

	if len(req.ResTypeFilter) > 0 {
		mustQueries = append(mustQueries,
			types.Query{
				Terms: &types.TermsQuery{
					TermsQuery: map[string]types.TermsQueryField{
						fieldOfResType: req.ResTypeFilter,
					},
				},
			})
	}

	if req.PublishStatusFilter != 0 {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfPublishStatus: {Value: req.PublishStatusFilter},
				},
			})
	}

	searchReq := &search.Request{
		Query: &types.Query{
			Bool: &types.BoolQuery{
				Must:   mustQueries,
				Filter: make([]types.Query, 0),
			},
		},
	}

	sr = sr.Request(searchReq)
	sr.Index(resourceIndexName)

	reqLimit := 100
	if req.Limit > 0 {
		reqLimit = int(req.Limit)
	}
	realLimit := reqLimit + 1

	sr.Sort(&sortOptions{
		OrderBy: fieldOfUpdateTime,
		Order:   sortorder.Desc,
	}, &sortOptions{
		OrderBy: fieldOfScores,
		Order:   sortorder.Desc,
	})

	sr.Size(realLimit)

	if req.Cursor != "" {
		sr.SearchAfter(&searchCursor{
			orderBy: fieldOfUpdateTime,
			cursor:  req.Cursor,
		})
	}

	result, err := sr.Do(ctx)
	if err != nil {
		return nil, err
	}

	hits := result.Hits.Hits

	hasMore := func() bool {
		if len(hits) > reqLimit {
			return true
		}
		return false
	}()

	if hasMore {
		hits = hits[:reqLimit]
	}

	docs := make([]*searchEntity.ResourceDocument, 0, len(hits))
	for _, hit := range hits {
		doc := &searchEntity.ResourceDocument{}
		if err := sonic.Unmarshal(hit.Source_, doc); err != nil {
			return nil, err
		}
		docs = append(docs, doc)
	}

	nextCursor := ""
	if len(docs) > 0 {
		nextCursor = strconv.FormatInt(docs[len(docs)-1].UpdateTime, 10)
	}
	if nextCursor == "" {
		hasMore = false
	}

	resp = &searchEntity.SearchResourcesResponse{
		Data:       docs,
		HasMore:    hasMore,
		NextCursor: nextCursor,
	}

	return resp, nil
}
