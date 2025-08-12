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

package coze

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"github.com/coze-dev/coze-studio/backend/api/model/base"
	"github.com/coze-dev/coze-studio/backend/api/model/space"
	"github.com/coze-dev/coze-studio/backend/domain/model/service"
)

var modelService service.ModelService

// InitModelService 初始化模型服务
func InitModelService(ms service.ModelService) {
	modelService = ms
}

// GetSpaceModelList 获取空间模型列表（兼容性接口，推荐使用新的 /api/model/list）
// @router /api/space/model/list [POST]
// @deprecated 请使用新的 /api/model/list 接口
func GetSpaceModelList(ctx context.Context, c *app.RequestContext) {
	// 返回弃用提示，引导用户使用新接口
	c.JSON(consts.StatusOK, &space.GetSpaceModelListResp{
		BaseResp: &base.BaseResp{
			StatusCode:    10001,
			StatusMessage: "此接口已弃用，请使用新的 /api/model/list 接口",
		},
		Data: &space.SpaceModelListData{
			Models: []*space.SpaceModelItem{},
		},
	})
}
