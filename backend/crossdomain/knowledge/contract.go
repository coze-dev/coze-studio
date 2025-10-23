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

	"github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
)

//go:generate  mockgen -destination knowledgemock/knowledge_mock.go --package knowledgemock -source model.go
type Knowledge interface {
	ListKnowledge(ctx context.Context, request *model.ListKnowledgeRequest) (response *model.ListKnowledgeResponse, err error)
	GetKnowledgeByID(ctx context.Context, request *model.GetKnowledgeByIDRequest) (response *model.GetKnowledgeByIDResponse, err error)
	Retrieve(ctx context.Context, req *model.RetrieveRequest) (*model.RetrieveResponse, error)
	DeleteKnowledge(ctx context.Context, request *model.DeleteKnowledgeRequest) error
	MGetKnowledgeByID(ctx context.Context, request *model.MGetKnowledgeByIDRequest) (response *model.MGetKnowledgeByIDResponse, err error)
	Store(ctx context.Context, document *model.CreateDocumentRequest) (*model.CreateDocumentResponse, error)
	Delete(ctx context.Context, r *model.DeleteDocumentRequest) (*model.DeleteDocumentResponse, error)
	ListKnowledgeDetail(ctx context.Context, req *model.ListKnowledgeDetailRequest) (*model.ListKnowledgeDetailResponse, error)
}

var defaultSVC Knowledge

func DefaultSVC() Knowledge {
	return defaultSVC
}

func SetDefaultSVC(c Knowledge) {
	defaultSVC = c
}
