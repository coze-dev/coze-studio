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

package modelmgr

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr/entity"
)

type Manager interface {
	CreateModelMeta(ctx context.Context, meta *entity.ModelMeta) (*entity.ModelMeta, error)
	UpdateModelMetaStatus(ctx context.Context, id int64, status entity.ModelMetaStatus) error
	DeleteModelMeta(ctx context.Context, id int64) error
	ListModelMeta(ctx context.Context, req *ListModelMetaRequest) (*ListModelMetaResponse, error)
	MGetModelMetaByID(ctx context.Context, req *MGetModelMetaRequest) ([]*entity.ModelMeta, error)

	CreateModel(ctx context.Context, model *entity.Model) (*entity.Model, error)
	DeleteModel(ctx context.Context, id int64) error
	ListModel(ctx context.Context, req *ListModelRequest) (*ListModelResponse, error)
	MGetModelByID(ctx context.Context, req *MGetModelRequest) ([]*entity.Model, error)
}

type ListModelMetaRequest struct {
	FuzzyModelName *string
	Status         []entity.ModelMetaStatus
	Limit          int
	Cursor         *string
}

type ListModelMetaResponse struct {
	ModelMetaList []*entity.ModelMeta
	HasMore       bool
	NextCursor    *string
}

type MGetModelMetaRequest struct {
	IDs []int64
}

type ListModelRequest struct {
	FuzzyModelName *string
	Status         []modelmgr.ModelEntityStatus // default is default and in_use status
	Limit          int
	Cursor         *string
}

type ListModelResponse struct {
	ModelList  []*entity.Model
	HasMore    bool
	NextCursor *string
}

type MGetModelRequest = modelmgr.MGetModelRequest
