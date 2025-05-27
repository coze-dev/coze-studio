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
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

var searchInstance *searchImpl

func NewDomainService(ctx context.Context, e *es8.Client) Search {
	return &searchImpl{
		esClient: e,
	}
}

type searchImpl struct {
	esClient *es8.Client
}

type fieldName string

const (
	fieldOfSpaceID        = "space_id"
	fieldOfOwnerID        = "owner_id"
	fieldOfAPPID          = "app_id"
	fieldOfName           = "name"
	fieldOfHasPublished   = "has_published"
	fieldOfStatus         = "status"
	fieldOfType           = "type"
	fieldOfIsFav          = "is_fav"
	fieldOFIsRecentlyOpen = "is_recently_open"

	// resource index fields
	fieldOfResType       = "res_type"
	fieldOfPublishStatus = "publish_status"
	fieldOfResSubType    = "res_sub_type"
	fieldOfBizStatus     = "biz_status"
	fieldOfScores        = "scores"

	fieldOfCreateTime  = "create_time"
	fieldOfUpdateTime  = "update_time"
	fieldOfPublishTime = "publish_time"
	resTypeSearchAll   = -1
)

func (s *searchImpl) SearchProjects(ctx context.Context, req *searchEntity.SearchProjectsRequest) (resp *searchEntity.SearchProjectsResponse, err error) {
	sr := s.esClient.Search()

	mustQueries := make([]types.Query, 0, 10)

	mustQueries = append(mustQueries,
		types.Query{Term: map[string]types.TermQuery{
			fieldOfSpaceID: {Value: conv.Int64ToStr(req.SpaceID)},
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

	if req.IsPublished {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfHasPublished: {Value: conv.BoolToInt(req.IsPublished)},
				},
			})
	}

	if req.IsFav {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfIsFav: {Value: conv.BoolToInt(req.IsFav)},
				},
			})
	}

	if req.IsRecentlyOpen {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOFIsRecentlyOpen: {Value: conv.BoolToInt(req.IsRecentlyOpen)},
				},
			})
	}

	if req.OwnerID > 0 {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfOwnerID: {Value: conv.Int64ToStr(req.OwnerID)},
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

	if len(req.Types) > 0 {
		mustQueries = append(mustQueries,
			types.Query{
				Terms: &types.TermsQuery{
					TermsQuery: map[string]types.TermsQueryField{
						fieldOfType: req.Types,
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
	sr.Index(projectIndexName)

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

	if req.Cursor != "" && req.Cursor != "0" {
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

	docs := make([]*searchEntity.ProjectDocument, 0, len(hits))
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

	resp = &searchEntity.SearchProjectsResponse{
		Data:       docs,
		HasMore:    hasMore,
		NextCursor: nextCursor,
	}

	return resp, nil
}

func hit2AppDocument(hit types.Hit) (*searchEntity.ProjectDocument, error) {
	doc := &searchEntity.ProjectDocument{}

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

func formatNextCursor(ob fieldName, val *searchEntity.ProjectDocument) string {
	fieldName2Cursor := map[fieldName]string{
		fieldOfCreateTime:  conv.Int64ToStr(val.GetCreateTime()),
		fieldOfUpdateTime:  conv.Int64ToStr(val.GetUpdateTime()),
		fieldOfPublishTime: conv.Int64ToStr(val.GetPublishTime()),
	}

	res, ok := fieldName2Cursor[ob]
	if !ok {
		return ""
	}

	return res
}

func (s *searchImpl) SearchResources(ctx context.Context, req *searchEntity.SearchResourcesRequest) (resp *searchEntity.SearchResourcesResponse, err error) {
	sr := s.esClient.Search()

	mustQueries := make([]types.Query, 0, 10)
	mustNotQueries := make([]types.Query, 0, 10)

	mustQueries = append(mustQueries,
		types.Query{Term: map[string]types.TermQuery{
			fieldOfSpaceID: {Value: conv.Int64ToStr(req.SpaceID)},
		}},
	)

	if req.APPID > 0 {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfAPPID: {Value: conv.Int64ToStr(req.APPID)},
				},
			})
	} else {
		mustNotQueries = append(mustNotQueries,
			types.Query{
				Exists: &types.ExistsQuery{
					Field: fieldOfAPPID,
				},
			})
	}

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
					fieldOfOwnerID: {Value: conv.Int64ToStr(req.OwnerID)},
				},
			})
	}

	if len(req.ResTypeFilter) == 1 && int(req.ResTypeFilter[0]) != resTypeSearchAll {
		mustQueries = append(mustQueries,
			types.Query{
				Term: map[string]types.TermQuery{
					fieldOfResType: {Value: req.ResTypeFilter[0]},
				},
			},
		)
	}

	if len(req.ResTypeFilter) == 2 {
		resType := req.ResTypeFilter[0]
		resSubType := int(req.ResTypeFilter[1])
		mustQueries = append(mustQueries, types.Query{
			Term: map[string]types.TermQuery{
				fieldOfResType: {Value: resType},
			},
		})
		if resSubType != resTypeSearchAll {
			mustQueries = append(mustQueries, types.Query{
				Term: map[string]types.TermQuery{
					fieldOfResSubType: {Value: int(resSubType)},
				},
			})
		}
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
				Must:    mustQueries,
				MustNot: mustNotQueries,
				Filter:  make([]types.Query, 0),
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

	sr.Sort(
		&sortOptions{
			OrderBy: fieldOfUpdateTime,
			Order:   sortorder.Desc,
		},
		// &sortOptions{
		// 	OrderBy: fieldOfScores,
		// 	Order:   sortorder.Desc,
		// },
	)

	sr.Size(realLimit)

	if req.Cursor != "" && req.Cursor != "0" {
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
		if err = sonic.Unmarshal(hit.Source_, doc); err != nil {
			return nil, err
		}

		docs = append(docs, doc)
	}

	nextCursor := ""
	if len(docs) > 0 {
		nextCursor = strconv.FormatInt(docs[len(docs)-1].GetUpdateTime(), 10)
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
