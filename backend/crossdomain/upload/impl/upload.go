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

package impl

import (
	"context"

	crossupload "github.com/coze-dev/coze-studio/backend/crossdomain/upload"
	"github.com/coze-dev/coze-studio/backend/domain/upload/service"
)

var defaultSVC crossupload.Uploader

type impl struct {
	DomainSVC service.UploadService
}

func InitDomainService(c service.UploadService) crossupload.Uploader {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *impl) GetFile(ctx context.Context, req *service.GetFileRequest) (resp *service.GetFileResponse, err error) {
	return c.DomainSVC.GetFile(ctx, req)
}
