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

package service

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/upload/entity"
)

//go:generate mockgen -destination ../../../internal/mock/domain/upload/upload_service_mock.go --package upload -source interface.go
type UploadService interface {
	UploadFile(ctx context.Context, req *UploadFileRequest) (resp *UploadFileResponse, err error)
	UploadFiles(ctx context.Context, req *UploadFilesRequest) (resp *UploadFilesResponse, err error)
	GetFiles(ctx context.Context, req *GetFilesRequest) (resp *GetFilesResponse, err error)
	GetFile(ctx context.Context, req *GetFileRequest) (resp *GetFileResponse, err error)
}

type UploadFileRequest struct {
	File *entity.File `json:"file"`
}
type UploadFileResponse struct {
	File *entity.File `json:"file"`
}
type UploadFilesRequest struct {
	Files []*entity.File `json:"files"`
}

type UploadFilesResponse struct {
	Files []*entity.File `json:"files"`
}

type GetFilesRequest struct {
	IDs []int64 `json:"ids"`
}

type GetFilesResponse struct {
	Files []*entity.File `json:"files"`
}

type GetFileRequest struct {
	ID int64 `json:"id"`
}

type GetFileResponse struct {
	File *entity.File `json:"file"`
}
