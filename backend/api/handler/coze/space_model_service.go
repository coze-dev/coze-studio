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
	"strconv"

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

// GetSpaceModelList 获取空间模型列表
// @router /api/space/model/list [POST]
func GetSpaceModelList(ctx context.Context, c *app.RequestContext) {
	var req space.GetSpaceModelListReq
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, "参数验证失败: "+err.Error())
		return
	}

	// 从请求体中获取 space_id
	spaceID, err := strconv.ParseUint(req.SpaceID, 10, 64)
	if err != nil {
		invalidParamRequestResponse(c, "空间ID格式错误")
		return
	}


	if modelService == nil {
		internalServerErrorResponse(ctx, c, context.DeadlineExceeded)
		return
	}

	models, err := modelService.ListSpaceModels(ctx, spaceID)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	// 转换为 API 响应格式
	modelItems := make([]*space.SpaceModelItem, 0, len(models))
	for _, model := range models {
		modelItems = append(modelItems, space.ConvertToSpaceModelItem(model))
	}

	c.JSON(consts.StatusOK, &space.GetSpaceModelListResp{
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
		Data: &space.SpaceModelListData{
			Models: modelItems,
		},
	})
}