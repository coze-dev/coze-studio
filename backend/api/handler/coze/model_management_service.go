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
	apimodelmgr "github.com/coze-dev/coze-studio/backend/api/model/modelmgr"
	"github.com/coze-dev/coze-studio/backend/application/modelmgr"
)

// CreateModel 创建模型
// @router /api/model/create [POST]
func CreateModel(ctx context.Context, c *app.RequestContext) {
	var req apimodelmgr.CreateModelReq
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, "参数验证失败: "+err.Error())
		return
	}

	// TODO: 添加认证中间件

	detail, err := modelmgr.ModelmgrApplicationSVC.CreateModel(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, &apimodelmgr.CreateModelResp{
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
		Data: detail,
	})
}

// GetModel 获取模型详情
// @router /api/model/detail [POST]
func GetModel(ctx context.Context, c *app.RequestContext) {
	var req apimodelmgr.GetModelReq
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, "参数验证失败: "+err.Error())
		return
	}

	detail, err := modelmgr.ModelmgrApplicationSVC.GetModel(ctx, req.ModelID)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, &apimodelmgr.GetModelResp{
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
		Data: detail,
	})
}

// UpdateModel 更新模型
// @router /api/model/update [POST]
func UpdateModel(ctx context.Context, c *app.RequestContext) {
	var req apimodelmgr.UpdateModelReq
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, "参数验证失败: "+err.Error())
		return
	}

	// TODO: 添加认证中间件

	detail, err := modelmgr.ModelmgrApplicationSVC.UpdateModel(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, &apimodelmgr.UpdateModelResp{
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
		Data: detail,
	})
}

// DeleteModel 删除模型
// @router /api/model/delete [POST]
func DeleteModel(ctx context.Context, c *app.RequestContext) {
	var req apimodelmgr.DeleteModelReq
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, "参数验证失败: "+err.Error())
		return
	}

	// TODO: 添加认证中间件

	err := modelmgr.ModelmgrApplicationSVC.DeleteModel(ctx, req.ModelID)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, &apimodelmgr.DeleteModelResp{
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	})
}

// AddModelToSpace 添加模型到空间
// @router /api/space/model/add [POST]
func AddModelToSpace(ctx context.Context, c *app.RequestContext) {
	var req apimodelmgr.AddModelToSpaceReq
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, "参数验证失败: "+err.Error())
		return
	}

	// TODO: 添加认证中间件
	userID := uint64(1) // 临时默认用户ID

	err := modelmgr.ModelmgrApplicationSVC.AddModelToSpace(ctx, req.SpaceID, req.ModelID, userID)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, &apimodelmgr.AddModelToSpaceResp{
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	})
}

// RemoveModelFromSpace 从空间移除模型
// @router /api/space/model/remove [POST]
func RemoveModelFromSpace(ctx context.Context, c *app.RequestContext) {
	var req apimodelmgr.RemoveModelFromSpaceReq
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, "参数验证失败: "+err.Error())
		return
	}

	// TODO: 添加认证中间件

	err := modelmgr.ModelmgrApplicationSVC.RemoveModelFromSpace(ctx, req.SpaceID, req.ModelID)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, &apimodelmgr.RemoveModelFromSpaceResp{
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	})
}

// UpdateSpaceModelConfig 更新空间模型配置
// @router /api/space/model/config/update [POST]
func UpdateSpaceModelConfig(ctx context.Context, c *app.RequestContext) {
	var req apimodelmgr.UpdateSpaceModelConfigReq
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, "参数验证失败: "+err.Error())
		return
	}

	// TODO: 添加认证中间件

	err := modelmgr.ModelmgrApplicationSVC.UpdateSpaceModelConfig(ctx, req.SpaceID, req.ModelID, req.CustomConfig)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, &apimodelmgr.UpdateSpaceModelConfigResp{
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	})
}
