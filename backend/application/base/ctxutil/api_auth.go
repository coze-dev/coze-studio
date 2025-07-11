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

package ctxutil

import (
	"context"

	"code.byted.org/data_edc/workflow_engine_next/domain/openauth/openapiauth/entity"
	"code.byted.org/data_edc/workflow_engine_next/pkg/ctxcache"
	"code.byted.org/data_edc/workflow_engine_next/types/consts"
)

func GetApiAuthFromCtx(ctx context.Context) *entity.ApiKey {
	data, ok := ctxcache.Get[*entity.ApiKey](ctx, consts.OpenapiAuthKeyInCtx)

	if !ok {
		return nil
	}
	return data
}

func MustGetUIDFromApiAuthCtx(ctx context.Context) int64 {
	apiKeyInfo := GetApiAuthFromCtx(ctx)
	if apiKeyInfo == nil {
		panic("mustGetUIDFromApiAuthCtx: apiKeyInfo is nil")
	}
	return apiKeyInfo.UserID
}
