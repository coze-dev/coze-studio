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

package knowledge

import (
	"context"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	crossknowledge "github.com/coze-dev/coze-studio/backend/crossdomain/contract/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
)

var defaultSVC crossknowledge.Knowledge

type impl struct {
	DomainSVC service.Knowledge
}

func InitDomainService(c service.Knowledge) crossknowledge.Knowledge {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (i *impl) ListKnowledge(ctx context.Context, request *model.ListKnowledgeRequest) (response *model.ListKnowledgeResponse, err error) {
	return i.DomainSVC.ListKnowledge(ctx, request)
}

func (i *impl) Retrieve(ctx context.Context, req *model.RetrieveRequest) (*model.RetrieveResponse, error) {
	return i.DomainSVC.Retrieve(ctx, req)
}

func (i *impl) DeleteKnowledge(ctx context.Context, req *model.DeleteKnowledgeRequest) error {
	return i.DomainSVC.DeleteKnowledge(ctx, req)
}

func (i *impl) GetKnowledgeByID(ctx context.Context, request *model.GetKnowledgeByIDRequest) (response *model.GetKnowledgeByIDResponse, err error) {
	return i.DomainSVC.GetKnowledgeByID(ctx, request)
}

func (i *impl) MGetKnowledgeByID(ctx context.Context, request *model.MGetKnowledgeByIDRequest) (response *model.MGetKnowledgeByIDResponse, err error) {
	return i.DomainSVC.MGetKnowledgeByID(ctx, request)
}
