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

package dto

import (
	"github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_common"
	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
)

type CreateDraftPluginRequest struct {
	PluginType   common.PluginType
	IconURI      string
	SpaceID      int64
	DeveloperID  int64
	ProjectID    *int64
	Name         string
	Desc         string
	ServerURL    string
	CommonParams map[common.ParameterLocation][]*common.CommonParamSchema
	AuthInfo     *PluginAuthInfo
}

type UpdateDraftPluginWithCodeRequest struct {
	UserID     int64
	PluginID   int64
	OpenapiDoc *model.Openapi3T
	Manifest   *model.PluginManifest
}

type UpdateDraftPluginRequest struct {
	PluginID     int64
	Name         *string
	Desc         *string
	URL          *string
	Icon         *common.PluginIcon
	CommonParams map[common.ParameterLocation][]*common.CommonParamSchema
	AuthInfo     *PluginAuthInfo
}

type ListDraftPluginsRequest struct {
	SpaceID  int64
	APPID    int64
	PageInfo PageInfo
}

type PageInfo struct {
	Name       *string
	Page       int
	Size       int
	SortBy     *SortField
	OrderByACS *bool
}

type SortField string

const (
	SortByCreatedAt SortField = "created_at"
	SortByUpdatedAt SortField = "updated_at"
)

type OAuthProvider string

type ListDraftPluginsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
}

type CreateDraftPluginWithCodeRequest struct {
	SpaceID     int64
	DeveloperID int64
	ProjectID   *int64
	Manifest    *model.PluginManifest
	OpenapiDoc  *model.Openapi3T
}

type CreateDraftPluginWithCodeResponse struct {
	Plugin *entity.PluginInfo
	Tools  []*entity.ToolInfo
}

type ListPluginProductsRequest struct {
}

type ListSaasPluginProductsRequest struct {
	PageNum         *int32                             `json:"page_num,omitempty"`
	PageSize        *int32                             `json:"page_size,omitempty"`
	Keyword         *string                            `json:"keyword,omitempty"`
	EntityTypes     []product_common.ProductEntityType `json:"entity_types,omitempty"`
	CategoryIDs     []int64                            `json:"category_ids,omitempty"`
	IsOfficial      *bool                              `json:"is_official,omitempty"`
	PluginType      *product_common.PluginType         `json:"plugin_type,omitempty"`
	ProductPaidType *product_common.ProductPaidType    `json:"product_paid_type,omitempty"`
	SortType        *product_common.SortType           `json:"sort_type,omitempty"`
}

type ListPluginProductsResponse struct {
	Plugins []*entity.PluginInfo
	Total   int64
	HasMore bool
}

type CopyPluginRequest struct {
	UserID    int64
	PluginID  int64
	CopyScene consts.CopyScene

	TargetAPPID *int64
}

type CopyPluginResponse struct {
	Plugin *entity.PluginInfo
	Tools  map[int64]*entity.ToolInfo // old tool id -> new tool
}

// DefaultParamSource 表示默认参数的设置来源
type DefaultParamSource int32

const (
	DefaultParamSource_Input    DefaultParamSource = 0 // 默认用户输入
	DefaultParamSource_Variable DefaultParamSource = 1 // 引用变量
)

// AssistParameterType 表示辅助参数类型
type AssistParameterType int32

const (
	AssistParameterType_DEFAULT AssistParameterType = 1
	AssistParameterType_IMAGE   AssistParameterType = 2
	AssistParameterType_DOC     AssistParameterType = 3
	AssistParameterType_CODE    AssistParameterType = 4
	AssistParameterType_PPT     AssistParameterType = 5
	AssistParameterType_TXT     AssistParameterType = 6
	AssistParameterType_EXCEL   AssistParameterType = 7
	AssistParameterType_AUDIO   AssistParameterType = 8
	AssistParameterType_ZIP     AssistParameterType = 9
	AssistParameterType_VIDEO   AssistParameterType = 10
)

type Parameter struct {
	Name               string               `json:"name,omitempty"`
	Desc               string               `json:"desc,omitempty"`
	Required           bool                 `json:"required,omitempty"`
	Type               string               `json:"type,omitempty"`
	SubParameters      []*Parameter         `json:"subParameters,omitempty"`
	SubType            string               `json:"subType,omitempty"`    // 如果Type是数组，则有subtype
	FromNodeId         *string              `json:"fromNodeId,omitempty"` // 如果入参的值是引用的则有fromNodeId
	FromOutput         []string             `json:"fromOutput,omitempty"` // 具体引用哪个节点的key
	Value              *string              `json:"value,omitempty"`      // 如果入参是用户手输 就放这里
	Format             *string              `json:"format,omitempty"`
	Title              *string              `json:"title,omitempty"`
	EnumList           []string             `json:"enumList,omitempty"`
	EnumVarNames       []string             `json:"enumVarNames,omitempty"`
	Minimum            *float64             `json:"minimum,omitempty"`
	Maximum            *float64             `json:"maximum,omitempty"`
	ExclusiveMinimum   *bool                `json:"exclusiveMinimum,omitempty"`
	ExclusiveMaximum   *bool                `json:"exclusiveMaximum,omitempty"`
	BizExtend          *string              `json:"bizExtend,omitempty"`
	DefaultParamSource *DefaultParamSource  `json:"defaultParamSource,omitempty"` // 默认入参的设置来源
	VariableRef        *string              `json:"variableRef,omitempty"`        // 引用variable的key
	AssistType         *AssistParameterType `json:"assistType,omitempty"`
}
