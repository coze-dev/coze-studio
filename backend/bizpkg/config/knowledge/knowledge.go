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

package knowledge

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/envkey"
	"github.com/coze-dev/coze-studio/backend/pkg/kvstore"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

const (
	knowledgeConfigKey = "knowledge_config"
)

type KnowledgeConfig struct {
	knowledge *kvstore.KVStore[config.KnowledgeConfig]
}

func NewKnowledgeConfig(db *gorm.DB) *KnowledgeConfig {
	return &KnowledgeConfig{
		knowledge: kvstore.New[config.KnowledgeConfig](db),
	}
}

func (c *KnowledgeConfig) GetKnowledgeConfig(ctx context.Context) (*config.KnowledgeConfig, error) {
	conf, err := c.knowledge.Get(ctx, consts.KnowledgeConfigSpace, knowledgeConfigKey)
	if err != nil {
		if errors.Is(err, kvstore.ErrKeyNotFound) {
			return getKnowledgeConfigurationFromOldConfig(), nil
		}

		return nil, err
	}

	return conf, nil
}

func getKnowledgeConfigurationFromOldConfig() *config.KnowledgeConfig {
	embeddingTypeStr := strings.ToUpper(os.Getenv("EMBEDDING_TYPE"))
	baseURLKey := fmt.Sprintf("%s_EMBEDDING_BASE_URL", embeddingTypeStr)
	apiKeyKey := fmt.Sprintf("%s_EMBEDDING_API_KEY", embeddingTypeStr)
	modelKey := fmt.Sprintf("%s_EMBEDDING_MODEL", embeddingTypeStr)
	dimsKey := fmt.Sprintf("%s_EMBEDDING_DIMS", embeddingTypeStr)

	conf := &config.KnowledgeConfig{
		EmbeddingConfig: &config.EmbeddingConfig{
			Type:         getEmbeddingType(),
			MaxBatchSize: envkey.GetI32D("EMBEDDING_MAX_BATCH_SIZE", 100),
			Connection: &config.EmbeddingConnection{
				BaseConnInfo: &config.BaseConnectionInfo{
					BaseURL: envkey.GetString(baseURLKey),
					APIKey:  envkey.GetString(apiKeyKey),
					Model:   envkey.GetString(modelKey),
				},
				EmbeddingInfo: &config.EmbeddingInfo{
					Dims: envkey.GetI32D(dimsKey, 1024),
				},
				Ark: &config.ArkConnInfo{
					APIType: envkey.GetStringD("ARK_EMBEDDING_API_TYPE", "text_api"),
				},
				Openai: &config.OpenAIConnInfo{
					ByAzure:     envkey.GetBoolD("OPENAI_EMBEDDING_BY_AZURE", false),
					APIVersion:  envkey.GetString("OPENAI_EMBEDDING_API_VERSION"),
					RequestDims: envkey.GetI32D("OPENAI_EMBEDDING_REQUEST_DIMS", 1024),
				},

				Gemini: &config.GeminiConnInfo{
					Backend:  envkey.GetI32D("GEMINI_EMBEDDING_BACKEND", 1),
					Project:  envkey.GetString("GEMINI_EMBEDDING_PROJECT"),
					Location: envkey.GetString("GEMINI_EMBEDDING_LOCATION"),
				},
				HTTP: &config.HttpConnection{
					Address: envkey.GetString("HTTP_EMBEDDING_ADDR"),
				},
			},
		},
		RerankConfig: &config.RerankConfig{
			Type: getRerankType(),
			VikingdbConfig: &config.VikingDBConfig{
				Ak:     envkey.GetString("VIKINGDB_RERANK_AK"),
				Sk:     envkey.GetString("VIKINGDB_RERANK_SK"),
				Host:   envkey.GetString("VIKINGDB_RERANK_HOST"),
				Region: envkey.GetString("VIKINGDB_RERANK_REGION"),
				Model:  envkey.GetString("VIKINGDB_RERANK_MODEL"),
			},
		},
		OcrConfig: &config.OCRConfig{
			Type:            getOCRType(),
			VolcengineAk:    envkey.GetString("VE_OCR_AK"),
			VolcengineSk:    envkey.GetString("VE_OCR_SK"),
			PaddleocrAPIURL: envkey.GetString("PADDLEOCR_OCR_API_URL"),
		},
		ParserConfig: &config.ParserConfig{
			Type:                     getParserType(),
			PaddleocrStructureAPIURL: envkey.GetString("PADDLEOCR_STRUCTURE_API_URL"),
		},
		BuiltinModelID: 0,
	}

	if conf.EmbeddingConfig.Type == config.EmbeddingType_Ark {
		conf.EmbeddingConfig.Connection.BaseConnInfo.APIKey = getArkEmbeddingAPIKey()
	}

	return conf
}

func getArkEmbeddingAPIKey() string {
	if len(envkey.GetString("ARK_EMBEDDING_API_KEY")) > 0 {
		return envkey.GetString("ARK_EMBEDDING_API_KEY")
	}
	return envkey.GetString("ARK_EMBEDDING_AK")
}

func (c *KnowledgeConfig) SaveKnowledgeConfig(ctx context.Context, v *config.KnowledgeConfig) error {
	return c.knowledge.Save(ctx, consts.KnowledgeConfigSpace, knowledgeConfigKey, v)
}

func getEmbeddingType() config.EmbeddingType {
	embeddingTypeStr := os.Getenv("EMBEDDING_TYPE")

	switch embeddingTypeStr {
	case "openai":
		return config.EmbeddingType_OpenAI
	case "ark":
		return config.EmbeddingType_Ark
	case "ollama":
		return config.EmbeddingType_Ollama
	case "gemini":
		return config.EmbeddingType_Gemini
	case "http":
		return config.EmbeddingType_HTTP
	}

	return config.EmbeddingType_Ark
}

func getRerankType() config.RerankType {
	embeddingTypeStr := os.Getenv("RERANK_TYPE")

	switch embeddingTypeStr {
	case "rrf":
		return config.RerankType_RRF
	case "vikingdb":
		return config.RerankType_VikingDB
	}

	return config.RerankType_RRF
}

func getOCRType() config.OCRType {
	ocrTypeStr := os.Getenv("OCR_TYPE")

	switch ocrTypeStr {
	case "ve":
		return config.OCRType_Volcengine
	case "paddleocr":
		return config.OCRType_Paddleocr
	}

	return config.OCRType_Volcengine
}

func getParserType() config.ParserType {
	parserTypeStr := os.Getenv("PARSER_TYPE")

	switch parserTypeStr {
	case "paddleocr":
		return config.ParserType_Paddleocr
	}

	return config.ParserType_builtin
}
