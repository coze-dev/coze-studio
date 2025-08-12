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

package modelmgr

import (
	"github.com/coze-dev/coze-studio/backend/api/model/base"
)

// CreateModelReq 创建模型请求
type CreateModelReq struct {
	Name              string                `json:"name" binding:"required"`
	Description       map[string]string     `json:"description,omitempty"`
	IconURI           string                `json:"icon_uri,omitempty"`
	IconURL           string                `json:"icon_url,omitempty"`
	DefaultParameters []ModelParameterInput `json:"default_parameters,omitempty"`
	Meta              ModelMetaInput        `json:"meta" binding:"required"`
}

// ModelParameterInput 模型参数输入
type ModelParameterInput struct {
	Name       string            `json:"name" binding:"required"`
	Label      map[string]string `json:"label" binding:"required"`
	Desc       map[string]string `json:"desc" binding:"required"`
	Type       string            `json:"type" binding:"required,oneof=int float boolean string"`
	Min        string            `json:"min,omitempty"`
	Max        string            `json:"max,omitempty"`
	DefaultVal map[string]string `json:"default_val" binding:"required"`
	Precision  int               `json:"precision,omitempty"`
	Options    []ParamOption     `json:"options,omitempty"`
	Style      ParamDisplayStyle `json:"style" binding:"required"`
}

// ParamOption 参数选项
type ParamOption struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

// ParamDisplayStyle 参数显示样式
type ParamDisplayStyle struct {
	Widget string            `json:"widget" binding:"required,oneof=slider radio_buttons"`
	Label  map[string]string `json:"label" binding:"required"`
}

// ModelMetaInput 模型元数据输入
type ModelMetaInput struct {
	Name       string                 `json:"name" binding:"required"`
	Protocol   string                 `json:"protocol" binding:"required"`
	Capability ModelCapability        `json:"capability" binding:"required"`
	ConnConfig map[string]interface{} `json:"conn_config" binding:"required"`
}

// ModelCapability 模型能力
type ModelCapability struct {
	FunctionCall    bool     `json:"function_call"`
	InputModal      []string `json:"input_modal,omitempty"`
	InputTokens     int      `json:"input_tokens"`
	JSONMode        bool     `json:"json_mode"`
	MaxTokens       int      `json:"max_tokens"`
	OutputModal     []string `json:"output_modal,omitempty"`
	OutputTokens    int      `json:"output_tokens"`
	PrefixCaching   bool     `json:"prefix_caching"`
	Reasoning       bool     `json:"reasoning"`
	PrefillResponse bool     `json:"prefill_response"`
}

// UpdateModelReq 更新模型请求
type UpdateModelReq struct {
	ModelID           string                `json:"model_id" binding:"required"`
	Name              *string               `json:"name,omitempty"`
	Description       map[string]string     `json:"description,omitempty"`
	IconURI           *string               `json:"icon_uri,omitempty"`
	IconURL           *string               `json:"icon_url,omitempty"`
	DefaultParameters []ModelParameterInput `json:"default_parameters,omitempty"`
	Status            *int                  `json:"status,omitempty"`
}

// UpdateModelMetaReq 更新模型元数据请求
type UpdateModelMetaReq struct {
	MetaID     string                 `json:"meta_id" binding:"required"`
	ModelName  *string                `json:"model_name,omitempty"`
	Protocol   *string                `json:"protocol,omitempty"`
	Capability *ModelCapability       `json:"capability,omitempty"`
	ConnConfig map[string]interface{} `json:"conn_config,omitempty"`
	Status     *int                   `json:"status,omitempty"`
}

// DeleteModelReq 删除模型请求
type DeleteModelReq struct {
	ModelID string `json:"model_id" binding:"required"`
}

// GetModelReq 获取模型详情请求
type GetModelReq struct {
	ModelID string `json:"model_id" binding:"required"`
}

// AddModelToSpaceReq 添加模型到空间请求
type AddModelToSpaceReq struct {
	SpaceID string `json:"space_id" binding:"required"`
	ModelID string `json:"model_id" binding:"required"`
}

// RemoveModelFromSpaceReq 从空间移除模型请求
type RemoveModelFromSpaceReq struct {
	SpaceID string `json:"space_id" binding:"required"`
	ModelID string `json:"model_id" binding:"required"`
}

// UpdateSpaceModelConfigReq 更新空间模型配置请求
type UpdateSpaceModelConfigReq struct {
	SpaceID      string                 `json:"space_id" binding:"required"`
	ModelID      string                 `json:"model_id" binding:"required"`
	CustomConfig map[string]interface{} `json:"custom_config" binding:"required"`
}

// ModelDetail 模型详情
type ModelDetail struct {
	ID                string                 `json:"id"`
	Name              string                 `json:"name"`
	Description       map[string]string      `json:"description,omitempty"`
	IconURI           string                 `json:"icon_uri,omitempty"`
	IconURL           string                 `json:"icon_url,omitempty"`
	DefaultParameters []ModelParameterOutput `json:"default_parameters,omitempty"`
	Meta              ModelMetaOutput        `json:"meta"`
	CreatedAt         int64                  `json:"created_at"`
	UpdatedAt         int64                  `json:"updated_at"`
}

// ModelParameterOutput 模型参数输出
type ModelParameterOutput struct {
	Name       string            `json:"name"`
	Label      map[string]string `json:"label"`
	Desc       map[string]string `json:"desc"`
	Type       string            `json:"type"`
	Min        string            `json:"min,omitempty"`
	Max        string            `json:"max,omitempty"`
	DefaultVal map[string]string `json:"default_val"`
	Precision  int               `json:"precision,omitempty"`
	Options    []ParamOption     `json:"options,omitempty"`
	Style      ParamDisplayStyle `json:"style"`
}

// ModelMetaOutput 模型元数据输出
type ModelMetaOutput struct {
	ID         string                 `json:"id"`
	Name       string                 `json:"name"`
	Protocol   string                 `json:"protocol"`
	Capability ModelCapability        `json:"capability"`
	ConnConfig map[string]interface{} `json:"conn_config"`
	Status     int                    `json:"status"`
}

// CreateModelResp 创建模型响应
type CreateModelResp struct {
	*base.BaseResp
	Data *ModelDetail `json:"data"`
}

// GetModelResp 获取模型详情响应
type GetModelResp struct {
	*base.BaseResp
	Data *ModelDetail `json:"data"`
}

// UpdateModelResp 更新模型响应
type UpdateModelResp struct {
	*base.BaseResp
	Data *ModelDetail `json:"data"`
}

// DeleteModelResp 删除模型响应
type DeleteModelResp struct {
	*base.BaseResp
}

// AddModelToSpaceResp 添加模型到空间响应
type AddModelToSpaceResp struct {
	*base.BaseResp
}

// RemoveModelFromSpaceResp 从空间移除模型响应
type RemoveModelFromSpaceResp struct {
	*base.BaseResp
}

// UpdateSpaceModelConfigResp 更新空间模型配置响应
type UpdateSpaceModelConfigResp struct {
	*base.BaseResp
}
