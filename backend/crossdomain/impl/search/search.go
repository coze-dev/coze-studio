package search

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/search"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crosssearch"
	"code.byted.org/flow/opencoze/backend/domain/search/service"
)

var defaultSVC crosssearch.Search

type impl struct {
	DomainSVC crosssearch.Search
}

func (i impl) SearchResources(ctx context.Context, req *model.SearchResourcesRequest) (resp *model.SearchResourcesResponse, err error) {
	return i.DomainSVC.SearchResources(ctx, req)
}

func InitDomainService(c service.Search) crosssearch.Search {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}
