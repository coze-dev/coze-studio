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
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
)

// 管理页面

// 供应商列表
// 模型列表
// 配置信息

type Model struct {
	ID          int64                           `json:"id,omitempty"`
	Provider    ModelProvider                   `json:"provider,omitempty"`
	ModelType   string                          `json:"model_type,omitempty"` // llm、text embedding
	DisplayInfo DisplayInfo                     `json:"display_info,omitempty"`
	Capability  developer_api.ModelAbility      `json:"capability,omitempty"`
	Connection  Connection                      `json:"connection,omitempty"`
	Parameters  []*developer_api.ModelParameter `json:"parameters,omitempty"`
}

type DisplayInfo struct {
	Name         string   `json:"name,omitempty"` // e.g. Doubao-Seed-1.6-Thinking
	IconURL      string   `json:"icon_url,omitempty"`
	Desc         I18nText `json:"desc,omitempty"`
	OutputTokens int      `json:"output_tokens"` // e.g. 32000 -> 32K
	MaxTokens    int      `json:"max_tokens"`    // e.g. 128000 -> 128K
}

type Connection struct {
	Ark      ArkConnInfo      `json:"ark,omitempty"`
	OpenAI   OpenAIConnInfo   `json:"openai,omitempty"`
	Deepseek DeepseekConnInfo `json:"deepseek,omitempty"`
	Gemini   GeminiConnInfo   `json:"gemini,omitempty"`
	Qwen     QwenConnInfo     `json:"qwen,omitempty"`
	Ollama   OllamaConnInfo   `json:"ollama,omitempty"`
	Claude   ClaudeConnInfo   `json:"claude,omitempty"`
}

type ArkConnInfo struct {
	BaseURL    string `json:"base_url"`
	APIKey     string `json:"api_key"`
	Region     string `json:"region"`
	EndpointID string `json:"endpoint_id"`

	// 运行时配置
	MaxTokens int `json:"max_tokens"`
}

type OpenAIConnInfo struct {
	BaseURL string `json:"base_url"`
	APIKey  string `json:"api_key"`
	// 运行时配置
}

type DeepseekConnInfo struct {
	BaseURL string `json:"base_url"`
	APIKey  string `json:"api_key"`
	Model   string `json:"model"`
	// 运行时配置
}

type GeminiConnInfo struct {
	BaseURL string `json:"base_url"`
	APIKey  string `json:"api_key"`
	Model   string `json:"model"`
	// 运行时配置
}

type QwenConnInfo struct {
	BaseURL   string `json:"base_url"`
	APIKey    string `json:"api_key"`
	Model     string `json:"model"`
	MaxTokens int    `json:"max_tokens"`
	// 运行时配置
}

type OllamaConnInfo struct {
	BaseURL   string `json:"base_url"`
	APIKey    string `json:"api_key"`
	Model     string `json:"model"`
	MaxTokens int    `json:"max_tokens"`

	// 运行时配置
}

type ClaudeConnInfo struct {
	BaseURL string `json:"base_url"`
	APIKey  string `json:"api_key"`
	Model   string `json:"model"`
	// 运行时配置
}

// ---------------------------------------------------------------------

// type Parameter struct {
// 	Name       ParameterName  `json:"name" yaml:"name"`
// 	Label      *I18nText      `json:"label,omitempty" yaml:"label,omitempty"`
// 	Desc       *I18nText      `json:"desc" yaml:"desc"`
// 	Type       ValueType      `json:"type" yaml:"type"`
// 	Min        string         `json:"min" yaml:"min"`
// 	Max        string         `json:"max" yaml:"max"`
// 	DefaultVal DefaultValue   `json:"default_val" yaml:"default_val"`
// 	Precision  int            `json:"precision,omitempty" yaml:"precision,omitempty"` // float precision, default 2
// 	Options    []*ParamOption `json:"options" yaml:"options"`                         // enum options
// 	Style      DisplayStyle   `json:"param_class" yaml:"style"`
// }

// type ParameterName string

// const (
// 	Temperature      ParameterName = "temperature"
// 	TopP             ParameterName = "top_p"
// 	TopK             ParameterName = "top_k"
// 	MaxTokens        ParameterName = "max_tokens"
// 	RespFormat       ParameterName = "response_format"
// 	FrequencyPenalty ParameterName = "frequency_penalty"
// 	PresencePenalty  ParameterName = "presence_penalty"
// )

// type ValueType string

// const (
// 	ValueTypeInt     ValueType = "int"
// 	ValueTypeFloat   ValueType = "float"
// 	ValueTypeBoolean ValueType = "boolean"
// 	ValueTypeString  ValueType = "string"
// )

// type DefaultValue map[DefaultType]string

// type DisplayStyle struct {
// 	Widget Widget            `json:"class_id" yaml:"widget"`
// 	Label  *MultilingualText `json:"label" yaml:"label"`
// }

// type DefaultType string

// const (
// 	DefaultTypeDefault  DefaultType = "default_val"
// 	DefaultTypeCreative DefaultType = "creative"
// 	DefaultTypeBalance  DefaultType = "balance"
// 	DefaultTypePrecise  DefaultType = "precise"
// )

// type Widget string

// const (
// 	WidgetSlider       Widget = "slider"
// 	WidgetRadioButtons Widget = "radio_buttons"
// )

// type ParamOption struct {
// 	Label string `json:"label"`
// 	Value string `json:"value"`
// }

// type ModelMeta struct {
// 	Protocol   chatmodel.Protocol `yaml:"protocol"`    // Model Communication Protocol
// 	Capability *Capability        `yaml:"capability"`  // model capability
// 	ConnConfig *chatmodel.Config  `yaml:"conn_config"` // model connection configuration
// 	Status     ModelStatus        `yaml:"status"`      // model state
// }

// type Modal string

// const (
// 	ModalText  Modal = "text"
// 	ModalImage Modal = "image"
// 	ModalFile  Modal = "file"
// 	ModalAudio Modal = "audio"
// 	ModalVideo Modal = "video"
// )

// type ModelStatus int64

// const (
// 	StatusDefault ModelStatus = 0  // Default state when not configured, equivalent to StatusInUse
// 	StatusInUse   ModelStatus = 1  // In the application, it can be used to create new
// 	StatusPending ModelStatus = 5  // To be offline, it can be used and cannot be created.
// 	StatusDeleted ModelStatus = 10 // It is offline, unusable, and cannot be created.
// )

// func modelDo2To(model *modelmgr.Model, locale i18n.Locale) (*developer_api.Model, error) {
// 	mm := model.Meta

// 	mps := slices.Transform(model.DefaultParameters,
// 		func(param *modelmgr.Parameter) *developer_api.ModelParameter {
// 			return parameterDo2To(param, locale)
// 		},
// 	)

// 	modalSet := sets.FromSlice(mm.Capability.InputModal)

// 	return &developer_api.Model{
// 		Name:             model.Name,
// 		ModelType:        model.ID,
// 		ModelClass:       mm.Protocol.TOModelClass(),
// 		ModelIcon:        model.IconURL,
// 		ModelInputPrice:  0,
// 		ModelOutputPrice: 0,
// 		ModelQuota: &developer_api.ModelQuota{
// 			TokenLimit: int32(mm.Capability.MaxTokens),
// 			TokenResp:  int32(mm.Capability.OutputTokens),
// 			// TokenSystem:       0,
// 			// TokenUserIn:       0,
// 			// TokenToolsIn:      0,
// 			// TokenToolsOut:     0,
// 			// TokenData:         0,
// 			// TokenHistory:      0,
// 			// TokenCutSwitch:    false,
// 			PriceIn:           0,
// 			PriceOut:          0,
// 			SystemPromptLimit: nil,
// 		},
// 		ModelName:      model.Name,
// 		ModelClassName: mm.Protocol.TOModelClass().String(),
// 		IsOffline:      mm.Status != modelmgr.StatusInUse,
// 		ModelParams:    mps,
// 		ModelDesc: []*developer_api.ModelDescGroup{
// 			{
// 				GroupName: "Description",
// 				Desc:      []string{model.Description.Read(locale)},
// 			},
// 		},
// 		FuncConfig:     nil,
// 		EndpointName:   nil,
// 		ModelTagList:   nil,
// 		IsUpRequired:   nil,
// 		ModelBriefDesc: model.Description.Read(locale),
// 		ModelSeries: &developer_api.ModelSeriesInfo{ // TODO: Replace with real configuration
// 			SeriesName: "热门模型",
// 		},
// 		ModelStatusDetails: nil,
// 		ModelAbility: &developer_api.ModelAbility{
// 			CotDisplay:         ptr.Of(mm.Capability.Reasoning),
// 			FunctionCall:       ptr.Of(mm.Capability.FunctionCall),
// 			ImageUnderstanding: ptr.Of(modalSet.Contains(modelmgr.ModalImage)),
// 			VideoUnderstanding: ptr.Of(modalSet.Contains(modelmgr.ModalVideo)),
// 			AudioUnderstanding: ptr.Of(modalSet.Contains(modelmgr.ModalAudio)),
// 			SupportMultiModal:  ptr.Of(len(modalSet) > 1),
// 			PrefillResp:        ptr.Of(mm.Capability.PrefillResponse),
// 		},
// 	}, nil
// }

// func parameterDo2To(param *modelmgr.Parameter, locale i18n.Locale) *developer_api.ModelParameter {
// 	if param == nil {
// 		return nil
// 	}

// 	apiOptions := make([]*developer_api.Option, 0, len(param.Options))
// 	for _, opt := range param.Options {
// 		apiOptions = append(apiOptions, &developer_api.Option{
// 			Label: opt.Label,
// 			Value: opt.Value,
// 		})
// 	}

// 	var custom string
// 	var creative, balance, precise *string
// 	if val, ok := param.DefaultVal[modelmgr.DefaultTypeDefault]; ok {
// 		custom = val
// 	}

// 	if val, ok := param.DefaultVal[modelmgr.DefaultTypeCreative]; ok {
// 		creative = ptr.Of(val)
// 	}

// 	if val, ok := param.DefaultVal[modelmgr.DefaultTypeBalance]; ok {
// 		balance = ptr.Of(val)
// 	}

// 	if val, ok := param.DefaultVal[modelmgr.DefaultTypePrecise]; ok {
// 		precise = ptr.Of(val)
// 	}

// 	return &developer_api.ModelParameter{
// 		Name:  string(param.Name),
// 		Label: param.Label.Read(locale),
// 		Desc:  param.Desc.Read(locale),
// 		Type: func() developer_api.ModelParamType {
// 			switch param.Type {
// 			case modelmgr.ValueTypeBoolean:
// 				return developer_api.ModelParamType_Boolean
// 			case modelmgr.ValueTypeInt:
// 				return developer_api.ModelParamType_Int
// 			case modelmgr.ValueTypeFloat:
// 				return developer_api.ModelParamType_Float
// 			default:
// 				return developer_api.ModelParamType_String
// 			}
// 		}(),
// 		Min:       param.Min,
// 		Max:       param.Max,
// 		Precision: int32(param.Precision),
// 		DefaultVal: &developer_api.ModelParamDefaultValue{
// 			DefaultVal: custom,
// 			Creative:   creative,
// 			Balance:    balance,
// 			Precise:    precise,
// 		},
// 		Options: apiOptions,
// 		ParamClass: &developer_api.ModelParamClass{
// 			ClassID: func() int32 {
// 				switch param.Style.Widget {
// 				case modelmgr.WidgetSlider:
// 					return 1
// 				case modelmgr.WidgetRadioButtons:
// 					return 2
// 				default:
// 					return 0
// 				}
// 			}(),
// 			Label: param.Style.Label.Read(locale),
// 		},
// 	}
// }
