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
	"encoding/json"

	"github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_common"
)

// SearchSaasPluginRequest represents the request parameters for searching SaaS plugins
type SearchSaasPluginRequest struct {
	Keyword         *string                         `json:"keyword,omitempty"`
	PageNum         *int                            `json:"page_num,omitempty"`
	PageSize        *int                            `json:"page_size,omitempty"`
	SortType        *string                         `json:"sort_type,omitempty"`
	CategoryIDs     []int64                         `json:"category_ids,omitempty"`
	IsOfficial      *bool                           `json:"is_official,omitempty"`
	ProductPaidType *product_common.ProductPaidType `json:"product_paid_type,omitempty"`
}

// SearchSaasPluginResponse represents the response from coze.cn search API
type SearchSaasPluginResponse struct {
	Code   int                   `json:"code"`
	Msg    string                `json:"msg"`
	Detail *ResponseDetail       `json:"detail,omitempty"`
	Data   *SearchSaasPluginData `json:"data"`
}

// ResponseDetail represents the detail section of API response
type ResponseDetail struct {
	LogID string `json:"logid"`
}

// SearchSaasPluginData represents the data section of search response
type SearchSaasPluginData struct {
	Items   []*SaasPluginItem `json:"items"`
	HasMore bool              `json:"has_more"`
}

// SaasPluginItem represents a single plugin item in search results
type SaasPluginItem struct {
	MetaInfo   *SaasPluginMetaInfo `json:"metainfo"`
	PluginInfo *SaasPluginInfo     `json:"plugin_info"`
}

// SaasPluginMetaInfo represents the metadata of a SaaS plugin
type SaasPluginMetaInfo struct {
	ProductID     string              `json:"product_id"`
	EntityID      string              `json:"entity_id"`
	EntityVersion string              `json:"entity_version"`
	EntityType    string              `json:"entity_type"`
	Name          string              `json:"name"`
	Description   string              `json:"description"`
	UserInfo      *SaasPluginUserInfo `json:"user_info"`
	Category      *SaasPluginCategory `json:"category"`
	IconURL       string              `json:"icon_url"`
	ProductURL    string              `json:"product_url"`
	ListedAt      int64               `json:"listed_at"`
	PaidType      string              `json:"paid_type"`
	IsOfficial    bool                `json:"is_official"`
}

// SaasPluginUserInfo represents the user information of a SaaS plugin
type SaasPluginUserInfo struct {
	UserID    string `json:"user_id"`
	UserName  string `json:"user_name"`
	NickName  string `json:"nick_name"`
	AvatarURL string `json:"avatar_url"`
}

// SaasPluginCategory represents the category information of a SaaS plugin
type SaasPluginCategory struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// SaasPluginInfo represents the plugin statistics and information
type SaasPluginInfo struct {
	Description            string  `json:"description"`
	TotalToolsCount        int     `json:"total_tools_count"`
	FavoriteCount          int     `json:"favorite_count"`
	Heat                   int     `json:"heat"`
	SuccessRate            float64 `json:"success_rate"`
	AvgExecDurationMs      float64 `json:"avg_exec_duration_ms"`
	BotsUseCount           int64   `json:"bots_use_count"`
	AssociatedBotsUseCount int64   `json:"associated_bots_use_count"`
	CallCount              int64   `json:"call_count"`
	IsCallAvailable        bool    `json:"is_call_available"`
}

type ListPluginCategoriesRequest struct {
	PageNum    *int    `json:"page_num,omitempty"`
	PageSize   *int    `json:"page_size,omitempty"`
	EntityType *string `json:"entity_type,omitempty"`
}

type ListPluginCategoriesResponse struct {
	Code int                       `json:"code"`
	Msg  string                    `json:"msg"`
	Data *ListPluginCategoriesData `json:"data"`
}

type ListPluginCategoriesData struct {
	Items   []*PluginCategoryItem `json:"items"`
	HasMore bool                  `json:"has_more"`
}

type PluginCategoryItem struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type GetSaasPluginCallInfoRequest struct {
	PluginID int64 `json:"plugin_id"`
}

type GetSaasPluginCallInfoResponse struct {
	Code int                        `json:"code"`
	Msg  string                     `json:"msg"`
	Data *GetSaasPluginCallInfoData `json:"data"`
}

type GetSaasPluginCallInfoData struct {
}

type JsonSchemaType int32

const (
	JsonSchemaType_STRING  JsonSchemaType = 1
	JsonSchemaType_NUMBER  JsonSchemaType = 2
	JsonSchemaType_INTEGER JsonSchemaType = 3
	JsonSchemaType_BOOLEAN JsonSchemaType = 4
	JsonSchemaType_OBJECT  JsonSchemaType = 5
	JsonSchemaType_ARRAY   JsonSchemaType = 6
	JsonSchemaType_NULL    JsonSchemaType = 7
)

type AnyValue struct {
	Type        JsonSchemaType `json:"type,omitempty"`
	StringValue string         `json:"stringValue,omitempty"`
}
type JsonSchema struct {
	// core
	ID          string                 `json:"$id,omitempty"`
	Schema      string                 `json:"$schema,omitempty"`
	Ref         string                 `json:"$ref,omitempty"`
	Comment     string                 `json:"$comment,omitempty"`
	Defs        map[string]*JsonSchema `json:"$defs,omitempty"`
	Definitions map[string]*JsonSchema `json:"definitions,omitempty"` // deprecated but still allowed

	Anchor        string          `json:"$anchor,omitempty"`
	DynamicAnchor string          `json:"$dynamicAnchor,omitempty"`
	DynamicRef    string          `json:"$dynamicRef,omitempty"`
	Vocabulary    map[string]bool `json:"$vocabulary,omitempty"`

	// metadata
	Title       string      `json:"title,omitempty"`
	Description string      `json:"description,omitempty"`
	Default     interface{} `json:"default,omitempty"`
	Deprecated  bool        `json:"deprecated,omitempty"`
	ReadOnly    bool        `json:"readOnly,omitempty"`
	WriteOnly   bool        `json:"writeOnly,omitempty"`

	// validation
	// Use Type for a single type, or Types for multiple types; never both.
	Type             JsonSchemaType   `json:"type,omitempty"`
	Types            []JsonSchemaType `json:"types,omitempty"`
	Enum             []*AnyValue      `json:"enum,omitempty"`
	MultipleOf       *float64         `json:"multipleOf,omitempty"`
	Minimum          *float64         `json:"minimum,omitempty"`
	Maximum          *float64         `json:"maximum,omitempty"`
	ExclusiveMinimum *bool            `json:"exclusiveMinimum,omitempty"`
	ExclusiveMaximum *bool            `json:"exclusiveMaximum,omitempty"`
	MinLength        *int32           `json:"minLength,omitempty"`
	MaxLength        *int32           `json:"maxLength,omitempty"`
	Pattern          string           `json:"pattern,omitempty"`

	// arrays
	PrefixItems      []*JsonSchema `json:"prefixItems,omitempty"`
	Items            *JsonSchema   `json:"items,omitempty"`
	MinItems         *int32        `json:"minItems,omitempty"`
	MaxItems         *int32        `json:"maxItems,omitempty"`
	AdditionalItems  *JsonSchema   `json:"additionalItems,omitempty"`
	UniqueItems      bool          `json:"uniqueItems,omitempty"`
	Contains         *JsonSchema   `json:"contains,omitempty"`
	MinContains      *int32        `json:"minContains,omitempty"`
	MaxContains      *int32        `json:"maxContains,omitempty"`
	UnevaluatedItems *JsonSchema   `json:"unevaluatedItems,omitempty"`

	// objects
	MinProperties         *int32                 `json:"minProperties,omitempty"`
	MaxProperties         *int32                 `json:"maxProperties,omitempty"`
	Required              []string               `json:"required,omitempty"`
	DependentRequired     map[string][]string    `json:"dependentRequired,omitempty"`
	Properties            map[string]*JsonSchema `json:"properties,omitempty"`
	PatternProperties     map[string]*JsonSchema `json:"patternProperties,omitempty"`
	AdditionalProperties  *JsonSchema            `json:"additionalProperties,omitempty"`
	PropertyNames         *JsonSchema            `json:"propertyNames,omitempty"`
	UnevaluatedProperties *JsonSchema            `json:"unevaluatedProperties,omitempty"`

	// logic
	AllOf []*JsonSchema `json:"allOf,omitempty"`
	AnyOf []*JsonSchema `json:"anyOf,omitempty"`
	OneOf []*JsonSchema `json:"oneOf,omitempty"`
	Not   *JsonSchema   `json:"not,omitempty"`

	// conditional
	If               map[string]*JsonSchema `json:"if,omitempty"`
	Then             map[string]*JsonSchema `json:"then,omitempty"`
	Else             map[string]*JsonSchema `json:"else,omitempty"`
	DependentSchemas map[string]*JsonSchema `json:"dependentSchemas,omitempty"`

	// other
	ContentEncoding  *JsonSchema `json:"contentEncoding,omitempty"`
	ContentMediaType *JsonSchema `json:"contentMediaType,omitempty"`
	ContentSchema    *JsonSchema `json:"contentSchema,omitempty"`

	Format string `json:"format,omitempty"`

	// Extra allows for additional keywords beyond those specified.
	Extra map[string]*JsonSchema `json:"-"`
}

type SaasPluginToolsListResponse struct {
	Items []SaasPluginToolsList `json:"items"`
}
type SaasPluginToolsList struct {
	Tools           []Tools `json:"tools"`
	PluginID        string  `json:"plugin_id"`
	Name            string  `json:"name"`
	NameForModel    string  `json:"name_for_model"`
	Description     string  `json:"description"`
	IconURL         string  `json:"icon_url"`
	Category        string  `json:"category"`
	CreatedAt       int64   `json:"created_at"`
	UpdatedAt       int64   `json:"updated_at"`
	IsCallAvailable bool    `json:"is_call_available"`
	McpJSON         string  `json:"mcp_json"`
}

type Tools struct {
	ToolID       string      `json:"tool_id"`
	Description  string      `json:"description"`
	InputSchema  *JsonSchema `json:"inputSchema"`
	Name         string      `json:"name"`
	OutputSchema *JsonSchema `json:"outputSchema"`
}

// stringToJsonSchemaType converts a string to JsonSchemaType
func stringToJsonSchemaType(s string) JsonSchemaType {
	switch s {
	case "string":
		return JsonSchemaType_STRING
	case "number":
		return JsonSchemaType_NUMBER
	case "integer":
		return JsonSchemaType_INTEGER
	case "boolean":
		return JsonSchemaType_BOOLEAN
	case "object":
		return JsonSchemaType_OBJECT
	case "array":
		return JsonSchemaType_ARRAY
	case "null":
		return JsonSchemaType_NULL
	default:
		return JsonSchemaType_STRING // default fallback
	}
}

// UnmarshalJSON implements custom JSON unmarshaling for JsonSchema
func (js *JsonSchema) UnmarshalJSON(data []byte) error {
	// Create a temporary struct with the same fields but string type for Type field
	type Alias JsonSchema
	aux := &struct {
		TypeString interface{} `json:"type"`
		*Alias
	}{
		Alias: (*Alias)(&JsonSchema{}),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// Copy all fields from aux.Alias to js
	*js = JsonSchema(*aux.Alias)

	// Handle the type field conversion
	if aux.TypeString != nil {
		switch v := aux.TypeString.(type) {
		case string:
			js.Type = stringToJsonSchemaType(v)
		case []interface{}:
			// Handle array of types
			js.Types = make([]JsonSchemaType, len(v))
			for i, typeVal := range v {
				if typeStr, ok := typeVal.(string); ok {
					js.Types[i] = stringToJsonSchemaType(typeStr)
				}
			}
		}
	}

	return nil
}
