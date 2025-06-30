package crosssearch

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/search"
)

type Search interface {
	SearchResources(ctx context.Context, req *model.SearchResourcesRequest) (resp *model.SearchResourcesResponse, err error)
}

var defaultSVC Search

func DefaultSVC() Search {
	return defaultSVC
}

func SetDefaultSVC(svc Search) {
	defaultSVC = svc
}
