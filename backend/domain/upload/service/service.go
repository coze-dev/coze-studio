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

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/upload/repository"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type uploadSVC struct {
	fileRepo repository.FilesRepo
	idgen    idgen.IDGenerator
	oss      storage.Storage
}

func NewUploadSVC(db *gorm.DB, idgen idgen.IDGenerator, oss storage.Storage) UploadService {
	return &uploadSVC{fileRepo: repository.NewFilesRepo(db), idgen: idgen, oss: oss}
}

func (u *uploadSVC) UploadFile(ctx context.Context, req *UploadFileRequest) (resp *UploadFileResponse, err error) {
	resp = &UploadFileResponse{}
	if req.File.ID == 0 {
		req.File.ID, err = u.idgen.GenID(ctx)
		if err != nil {
			return nil, errorx.New(errno.ErrIDGenError)
		}
	}
	err = u.fileRepo.Create(ctx, req.File)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUploadSystemErrorCode)
	}
	resp.File = req.File
	return
}

func (u *uploadSVC) UploadFiles(ctx context.Context, req *UploadFilesRequest) (resp *UploadFilesResponse, err error) {
	resp = &UploadFilesResponse{}
	for _, file := range req.Files {
		if file.ID == 0 {
			file.ID, err = u.idgen.GenID(ctx)
			if err != nil {
				return nil, errorx.New(errno.ErrIDGenError)
			}
		}
	}
	err = u.fileRepo.BatchCreate(ctx, req.Files)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUploadSystemErrorCode)
	}
	resp.Files = req.Files
	return
}

func (u *uploadSVC) GetFiles(ctx context.Context, req *GetFilesRequest) (resp *GetFilesResponse, err error) {
	resp = &GetFilesResponse{}
	resp.Files, err = u.fileRepo.MGetByIDs(ctx, req.IDs)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUploadSystemErrorCode)
	}
	return
}

func (u *uploadSVC) GetFile(ctx context.Context, req *GetFileRequest) (resp *GetFileResponse, err error) {
	resp = &GetFileResponse{}
	resp.File, err = u.fileRepo.GetByID(ctx, req.ID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrUploadSystemErrorCode)
	}
	if resp.File != nil {
		url, err := u.oss.GetObjectUrl(ctx, resp.File.TosURI)
		if err == nil {
			resp.File.Url = url
		}
	}
	return
}
