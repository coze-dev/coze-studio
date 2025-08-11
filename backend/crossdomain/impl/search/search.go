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

package search

import (
	"context"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/search"
	crosssearch "github.com/coze-dev/coze-studio/backend/crossdomain/contract/search"
	"github.com/coze-dev/coze-studio/backend/domain/search/service"
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
