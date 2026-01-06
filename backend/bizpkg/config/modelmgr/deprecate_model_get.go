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
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/components/model/openai"
	"gorm.io/gorm"

	config "github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/envkey"
	"github.com/coze-dev/coze-studio/backend/pkg/kvstore"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"

	"google.golang.org/genai"
	"gopkg.in/yaml.v3"
)

var oldModels []*Model

func initOldModelConf(ctx context.Context, oss storage.Storage, c *ModelConfig) error {
	wd, err := os.Getwd()
	if err != nil {
		return err
	}

	mo, err := initModelByTemplate(wd, "resources/conf/model")
	if err != nil {
		return err
	}

	oldModels = mo

	envModel, err := initModelByEnv()
	if err != nil {
		return err
	}

	if envModel != nil {
		oldModels = append(oldModels, envModel)
	}

	for _, q := range oldModels {
		if q.Provider.IconURI != "" {
			url, err := oss.GetObjectUrl(ctx, q.Provider.IconURI)
			if err != nil {
				logs.CtxWarnf(ctx, "get model icon url failed, err: %v", err)
			} else {
				q.Provider.IconURL = url
			}
		}
	}

	for _, old := range oldModels {
		if old.ID <= 0 {
			logs.CtxWarnf(ctx, "model id is invalid, model: %v", old.ID)
			continue
		}

		_, err := c.getModelByID(ctx, old.ID)
		if err == nil {
			logs.CtxInfof(ctx, "model id %d - %s already exists", old.ID, old.DisplayInfo.Name)
			continue
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			id, err1 := c.createModel(ctx, &old.ID,
				old.Provider.ModelClass, old.DisplayInfo.Name, old.Connection, &ModelExtra{EnableBase64URL: false})
			if err1 != nil {
				return fmt.Errorf("sync old model to db failed, err: %w", err1)
			}

			logs.CtxInfof(ctx, "sync old model id %d - %s to db success, new id: %d ", old.ID, old.DisplayInfo.Name, id)
			continue
		}

		return fmt.Errorf("get model by id failed, err: %w", err)
	}

	return nil
}

func initModelByEnv() (*Model, error) {
	if os.Getenv("MODEL_PROTOCOL_0") == "" || os.Getenv("MODEL_OPENCOZE_ID_0") == "" {
		return nil, nil
	}
	protocol := os.Getenv("MODEL_PROTOCOL_0")
	openCozeID, err := envkey.GetI64("MODEL_OPENCOZE_ID_0")
	if err != nil {
		return nil, err
	}
	name := os.Getenv("MODEL_NAME_0")
	modelID := os.Getenv("MODEL_ID_0")
	apiKey := os.Getenv("MODEL_API_KEY_0")
	baseURL := os.Getenv("MODEL_BASE_URL_0")

	modelClass := strProtocolToModelClass(Protocol(protocol))
	provider, _ := GetModelProvider(modelClass)

	modelMeta, err := modelMetaConf.GetModelMeta(modelClass, modelID)
	if err != nil {
		return nil, fmt.Errorf("get model meta failed, err: %w", err)
	}

	m := &Model{
		Model: &config.Model{
			ID:          openCozeID,
			DisplayInfo: modelMeta.DisplayInfo,
			Provider:    provider,
			Connection: &config.Connection{
				BaseConnInfo: &config.BaseConnectionInfo{
					BaseURL: baseURL,
					APIKey:  apiKey,
					Model:   modelID,
				},
			},
			Capability:      modelMeta.Capability,
			Parameters:      modelMeta.Parameters,
			Status:          config.ModelStatus_StatusInUse,
			EnableBase64URL: modelMeta.EnableBase64URL,
			Type:            config.ModelType_LLM,
		},
	}

	if m.DisplayInfo.Name == "" {
		m.DisplayInfo.Name = name
	}

	if modelMeta.Connection != nil {
		m.Connection.Ark = modelMeta.Connection.Ark
		m.Connection.Openai = modelMeta.Connection.Openai
		m.Connection.Deepseek = modelMeta.Connection.Deepseek
		m.Connection.Gemini = modelMeta.Connection.Gemini
		m.Connection.Qwen = modelMeta.Connection.Qwen
		m.Connection.Ollama = modelMeta.Connection.Ollama
		m.Connection.Claude = modelMeta.Connection.Claude
	}

	return m, nil
}

func initModelByTemplate(wd, configPath string) ([]*Model, error) {
	configRoot := filepath.Join(wd, configPath)
	staticModel, err := readDirYaml[OldModel](configRoot)
	if err != nil {
		return nil, err
	}

	models := make([]*Model, 0, len(staticModel))
	for _, old := range staticModel {
		m, err := toNewModel(old)
		if err != nil {
			return nil, fmt.Errorf("to new model failed, err: %w", err)
		}

		models = append(models, m)
	}

	return models, nil
}

func strProtocolToModelClass(protocol Protocol) developer_api.ModelClass {
	modelClass := developer_api.ModelClass_SEED

	switch protocol {
	case ProtocolOpenAI:
		modelClass = developer_api.ModelClass_GPT
	case ProtocolClaude:
		modelClass = developer_api.ModelClass_Claude
	case ProtocolDeepseek:
		modelClass = developer_api.ModelClass_DeekSeek
	case ProtocolGemini:
		modelClass = developer_api.ModelClass_Gemini
	case ProtocolArk:
		modelClass = developer_api.ModelClass_SEED
	case ProtocolOllama:
		modelClass = developer_api.ModelClass_Llama
	case ProtocolQwen:
		modelClass = developer_api.ModelClass_QWen
	default:
		modelClass = developer_api.ModelClass_SEED
	}

	return modelClass
}

func (c *ModelConfig) UseOldModelConf(ctx context.Context) (bool, error) {
	useOldModelList, ok := ctxcache.Get[bool](ctx, doNotUseOldModelFlagContextKey)
	if ok {
		return useOldModelList, nil
	}

	_, err := c.kv.Get(ctx, consts.ModelConfigSpace, doNotUseOldModelFlagKey)
	if err != nil {
		if errors.Is(err, kvstore.ErrKeyNotFound) {
			logs.CtxInfof(ctx, "[UseOldModelConf] will use old model")
			ctxcache.Store(ctx, doNotUseOldModelFlagContextKey, true)
			return true, nil
		}

		return false, err
	}

	ctxcache.Store(ctx, doNotUseOldModelFlagContextKey, false)
	return false, nil
}

func (c *ModelConfig) SetDoNotUseOldModelConf(ctx context.Context) error {
	useOldModelList, err := c.UseOldModelConf(ctx)
	if err != nil {
		logs.CtxWarnf(ctx, "set use new model list failed, err: %v , will try to set use new model flag", err)
	}

	if useOldModelList {
		return c.kv.Save(ctx, consts.ModelConfigSpace, doNotUseOldModelFlagKey, &struct{}{})
	}

	return nil
}

func toNewModel(old *OldModel) (*Model, error) {
	// to new model, old: {"ID":68010,"Name":"Test_Ollama_Qwen2.5vl-7b","Description":{"zh":"ollama 模型简介","en":"ollama model description"},"Meta":{"Protocol":"ollama","ConnConfig":null}}
	modelClass := strProtocolToModelClass(old.Meta.Protocol)
	provider, _ := GetModelProvider(modelClass)

	modelMeta, err := modelMetaConf.GetModelMeta(modelClass, old.Meta.ConnConfig.Model)
	if err != nil {
		return nil, fmt.Errorf("get model meta failed, err: %w", err)
	}

	m := &Model{
		Model: &config.Model{
			ID:          old.ID,
			DisplayInfo: modelMeta.DisplayInfo,
			Provider:    provider,
			Connection: &config.Connection{
				BaseConnInfo: &config.BaseConnectionInfo{
					BaseURL: old.Meta.ConnConfig.BaseURL,
					APIKey:  old.Meta.ConnConfig.APIKey,
					Model:   old.Meta.ConnConfig.Model,
				},
			},
			Capability:      modelMeta.Capability,
			Parameters:      modelMeta.Parameters,
			Status:          config.ModelStatus_StatusInUse,
			EnableBase64URL: modelMeta.EnableBase64URL,
			Type:            config.ModelType_LLM,
		},
	}

	m.DisplayInfo.Name = old.Name

	if modelMeta.Connection != nil {
		m.Connection.Ark = modelMeta.Connection.Ark
		m.Connection.Openai = modelMeta.Connection.Openai
		m.Connection.Deepseek = modelMeta.Connection.Deepseek
		m.Connection.Gemini = modelMeta.Connection.Gemini
		m.Connection.Qwen = modelMeta.Connection.Qwen
		m.Connection.Ollama = modelMeta.Connection.Ollama
		m.Connection.Claude = modelMeta.Connection.Claude
	}

	if old.Meta.ConnConfig.EnableBase64Url != nil {
		m.EnableBase64URL = *old.Meta.ConnConfig.EnableBase64Url
	}

	logs.Debugf("to new model, old: %v \n new %v",
		conv.DebugJsonToStr(old), conv.DebugJsonToStr(m))

	return m, nil
}

func readDirYaml[T any](dir string) ([]*T, error) {
	des, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	resp := make([]*T, 0, len(des))
	for _, file := range des {
		if file.IsDir() {
			continue
		}
		if strings.HasSuffix(file.Name(), ".yaml") || strings.HasSuffix(file.Name(), ".yml") {
			filePath := filepath.Join(dir, file.Name())
			data, err := os.ReadFile(filePath)
			if err != nil {
				return nil, err
			}
			var content T
			if err := yaml.Unmarshal(data, &content); err != nil {
				return nil, err
			}
			// logs.Debugf("readDirYaml %s  , content: %s", string(data), conv.DebugJsonToStr(content))

			resp = append(resp, &content)
		}
	}
	return resp, nil
}

type OldModel struct {
	ID          int64             `yaml:"id"`
	Name        string            `yaml:"name"`
	Description *MultilingualText `yaml:"description"`
	Meta        ModelOldMeta      `yaml:"meta"`
}

type ModelOldMeta struct {
	Protocol Protocol `yaml:"protocol"` // Model Communication Protocol

	ConnConfig *OldConfig `yaml:"conn_config"` // model connection configuration
}

type Protocol string

const (
	ProtocolOpenAI   Protocol = "openai"
	ProtocolClaude   Protocol = "claude"
	ProtocolDeepseek Protocol = "deepseek"
	ProtocolGemini   Protocol = "gemini"
	ProtocolArk      Protocol = "ark"
	ProtocolOllama   Protocol = "ollama"
	ProtocolQwen     Protocol = "qwen"
)

type MultilingualText struct {
	ZH string `json:"zh,omitempty" yaml:"zh,omitempty"`
	EN string `json:"en,omitempty" yaml:"en,omitempty"`
}

type OldConfig struct {
	BaseURL string        `json:"base_url,omitempty" yaml:"base_url"`
	APIKey  string        `json:"api_key,omitempty" yaml:"api_key"`
	Timeout time.Duration `json:"timeout,omitempty" yaml:"timeout"`

	Model            string   `json:"model" yaml:"model"`
	Temperature      *float32 `json:"temperature,omitempty" yaml:"temperature,omitempty"`
	FrequencyPenalty *float32 `json:"frequency_penalty,omitempty" yaml:"frequency_penalty,omitempty"`
	PresencePenalty  *float32 `json:"presence_penalty,omitempty" yaml:"presence_penalty,omitempty"`
	MaxTokens        *int     `json:"max_tokens,omitempty" yaml:"max_tokens,omitempty"`
	TopP             *float32 `json:"top_p,omitempty" yaml:"top_p"`
	TopK             *int     `json:"top_k,omitempty" yaml:"top_k"`
	Stop             []string `json:"stop,omitempty" yaml:"stop"`
	EnableThinking   *bool    `json:"enable_thinking,omitempty" yaml:"enable_thinking,omitempty"`
	EnableBase64Url  *bool    `json:"enable_base64_url,omitempty" yaml:"enable_base64_url,omitempty"`

	OpenAI   *OpenAIConfig   `json:"open_ai,omitempty" yaml:"openai"`
	Claude   *ClaudeConfig   `json:"claude,omitempty" yaml:"claude"`
	Ark      *ArkConfig      `json:"ark,omitempty" yaml:"ark"`
	Deepseek *DeepseekConfig `json:"deepseek,omitempty" yaml:"deepseek"`
	Qwen     *QwenConfig     `json:"qwen,omitempty" yaml:"qwen"`
	Gemini   *GeminiConfig   `json:"gemini,omitempty" yaml:"gemini"`

	Custom map[string]string `json:"custom,omitempty" yaml:"custom"`
}

type OpenAIConfig struct {
	ByAzure    bool   `json:"by_azure,omitempty" yaml:"by_azure"`
	APIVersion string `json:"api_version,omitempty" yaml:"api_version"`

	ResponseFormat *openai.ChatCompletionResponseFormat `json:"response_format,omitempty" yaml:"response_format"`
}

type ClaudeConfig struct {
	ByBedrock bool `json:"by_bedrock" yaml:"by_bedrock"`
	// bedrock config
	AccessKey       string `json:"access_key,omitempty" yaml:"access_key"`
	SecretAccessKey string `json:"secret_access_key,omitempty" yaml:"secret_access_key"`
	SessionToken    string `json:"session_token,omitempty" yaml:"session_token"`
	Region          string `json:"region,omitempty" yaml:"region"`
	BudgetTokens    *int   `json:"budget_tokens,omitempty" yaml:"budget_tokens"`
}

type ArkConfig struct {
	Region       string            `json:"region" yaml:"region"`
	AccessKey    string            `json:"access_key,omitempty" yaml:"access_key"`
	SecretKey    string            `json:"secret_key,omitempty" yaml:"secret_key"`
	RetryTimes   *int              `json:"retry_times,omitempty" yaml:"retry_times"`
	CustomHeader map[string]string `json:"custom_header,omitempty" yaml:"custom_header"`
}

type DeepseekConfig struct {
	ResponseFormatType deepseek.ResponseFormatType `json:"response_format_type" yaml:"response_format_type"`
}

type QwenConfig struct {
	ResponseFormat *openai.ChatCompletionResponseFormat `json:"response_format,omitempty" yaml:"response_format"`
}

type GeminiConfig struct {
	Backend    genai.Backend       `json:"backend,omitempty" yaml:"backend"`
	Project    string              `json:"project,omitempty" yaml:"project"`
	Location   string              `json:"location,omitempty" yaml:"location"`
	APIVersion string              `json:"api_version,omitempty" yaml:"api_version"`
	Headers    map[string][]string `json:"headers,omitempty" yaml:"headers"`
	TimeoutMs  int64               `json:"timeout_ms,omitempty" yaml:"timeout_ms"`

	IncludeThoughts *bool  `json:"include_thoughts,omitempty" yaml:"include_thoughts"` // default true
	ThinkingBudget  *int32 `json:"thinking_budget,omitempty" yaml:"thinking_budget"`   // default nil
}
