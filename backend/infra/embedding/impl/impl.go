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

package impl

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino-ext/components/embedding/gemini"
	"github.com/cloudwego/eino-ext/components/embedding/ollama"
	"github.com/cloudwego/eino-ext/components/embedding/openai"
	"google.golang.org/genai"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/infra/embedding"
	"github.com/coze-dev/coze-studio/backend/infra/embedding/impl/ark"
	"github.com/coze-dev/coze-studio/backend/infra/embedding/impl/http"
	"github.com/coze-dev/coze-studio/backend/infra/embedding/impl/wrap"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func GetEmbedding(ctx context.Context, cfg *config.EmbeddingConfig) (embedding.Embedder, error) {
	var (
		emb           embedding.Embedder
		err           error
		connInfo      = cfg.Connection.BaseConnInfo
		embeddingInfo = cfg.Connection.EmbeddingInfo
	)

	switch cfg.Type {
	case config.EmbeddingType_OpenAI:
		openaiConnCfg := cfg.Connection.Openai
		openAICfg := &openai.EmbeddingConfig{
			APIKey:     connInfo.APIKey,
			BaseURL:    connInfo.BaseURL,
			Model:      connInfo.Model,
			ByAzure:    openaiConnCfg.ByAzure,
			APIVersion: openaiConnCfg.APIVersion,
		}

		if embeddingInfo.Dims > 0 {
			// some openai model not support request dims
			openAICfg.Dimensions = ptr.Of(int(embeddingInfo.Dims))
		}

		emb, err = wrap.NewOpenAIEmbedder(ctx, openAICfg, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init openai embedding failed, err=%w", err)
		}
	case config.EmbeddingType_Ark:
		arkCfg := cfg.Connection.Ark

		apiType := ark.APITypeText
		if ark.APIType(arkCfg.APIType) == ark.APITypeMultiModal {
			apiType = ark.APITypeMultiModal
		}

		emb, err = ark.NewArkEmbedder(ctx, &ark.EmbeddingConfig{
			APIKey:  connInfo.APIKey,
			Model:   connInfo.Model,
			BaseURL: connInfo.BaseURL,
			APIType: &apiType,
		}, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init ark embedding client failed, err=%w", err)
		}

	case config.EmbeddingType_Ollama:
		emb, err = wrap.NewOllamaEmbedder(ctx, &ollama.EmbeddingConfig{
			BaseURL: connInfo.BaseURL,
			Model:   connInfo.Model,
		}, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init ollama embedding failed, err=%w", err)
		}
	case config.EmbeddingType_Gemini:
		geminiCfg := cfg.Connection.Gemini

		if len(connInfo.Model) == 0 {
			return nil, fmt.Errorf("GEMINI_EMBEDDING_MODEL environment variable is required")
		}
		if len(connInfo.APIKey) == 0 {
			return nil, fmt.Errorf("GEMINI_EMBEDDING_API_KEY environment variable is required")
		}

		geminiCli, err1 := genai.NewClient(ctx, &genai.ClientConfig{
			APIKey:   connInfo.APIKey,
			Backend:  genai.Backend(geminiCfg.Backend),
			Project:  geminiCfg.Project,
			Location: geminiCfg.Location,
			HTTPOptions: genai.HTTPOptions{
				BaseURL: connInfo.BaseURL,
			},
		})
		if err1 != nil {
			return nil, fmt.Errorf("init gemini client failed, err=%w", err)
		}

		emb, err = wrap.NewGeminiEmbedder(ctx, &gemini.EmbeddingConfig{
			Client:               geminiCli,
			Model:                connInfo.Model,
			OutputDimensionality: ptr.Of(int32(embeddingInfo.Dims)),
		}, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init gemini embedding failed, err=%w", err)
		}
	case config.EmbeddingType_HTTP:
		httpCfg := cfg.Connection.HTTP

		emb, err = http.NewEmbedding(httpCfg.Address, int64(embeddingInfo.Dims), int(cfg.MaxBatchSize))
		if err != nil {
			return nil, fmt.Errorf("init http embedding failed, err=%w", err)
		}

	default:
		return nil, fmt.Errorf("init knowledge embedding failed, type not configured")
	}

	return emb, nil
}
