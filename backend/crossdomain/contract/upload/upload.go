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

package crossupload

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/upload/service"
)

var defaultSVC Uploader

//go:generate  mockgen -destination uploadmock/upload_mock.go --package uploadmock -source upload.go
type Uploader interface {
	GetFile(ctx context.Context, req *service.GetFileRequest) (resp *service.GetFileResponse, err error)
}

func SetDefaultSVC(s Uploader) {
	defaultSVC = s
}

func DefaultSVC() Uploader {
	return defaultSVC
}
