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

package openapiauth

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth/entity"
)

type APIAuth interface {
	Create(ctx context.Context, req *entity.CreateApiKey) (*entity.ApiKey, error)
	Delete(ctx context.Context, req *entity.DeleteApiKey) error
	Get(ctx context.Context, req *entity.GetApiKey) (*entity.ApiKey, error)
	List(ctx context.Context, req *entity.ListApiKey) (*entity.ListApiKeyResp, error)
	Save(ctx context.Context, req *entity.SaveMeta) error

	CheckPermission(ctx context.Context, req *entity.CheckPermission) (*entity.ApiKey, error)
}
