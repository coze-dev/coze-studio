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

package datacopy

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/datacopy"
)

type DataCopy interface {
	CheckAndGenCopyTask(ctx context.Context, req *datacopy.CheckAndGenCopyTaskReq) (*datacopy.CheckAndGenCopyTaskResp, error)
	UpdateCopyTask(ctx context.Context, req *datacopy.UpdateCopyTaskReq) error
	UpdateCopyTaskWithTX(ctx context.Context, req *datacopy.UpdateCopyTaskReq, tx *gorm.DB) error
}

var defaultSVC DataCopy

func DefaultSVC() DataCopy {
	return defaultSVC
}

func SetDefaultSVC(c DataCopy) {
	defaultSVC = c
}
