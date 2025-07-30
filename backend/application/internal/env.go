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

package internal

import (
	"context"
	"fmt"
	"os"
	"strconv"

	ao "github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/components/model/gemini"
	"github.com/cloudwego/eino-ext/components/model/ollama"
	mo "github.com/cloudwego/eino-ext/components/model/openai"
	"github.com/cloudwego/eino-ext/components/model/qwen"
	"google.golang.org/genai"

	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
)

func GetBuiltinChatModel(ctx context.Context, envPrefix string) (bcm chatmodel.BaseChatModel, configured bool, err error) {
	getEnv := func(key string) string {
		if val := os.Getenv(envPrefix + key); val != "" {
			return val
		}
		return os.Getenv(key)
	}

	switch getEnv("BUILTIN_CM_TYPE") {
	case "openai":
		byAzure, _ := strconv.ParseBool(getEnv("BUILTIN_CM_OPENAI_BY_AZURE"))
		bcm, err = mo.NewChatModel(ctx, &mo.ChatModelConfig{
			APIKey:  getEnv("BUILTIN_CM_OPENAI_API_KEY"),
			ByAzure: byAzure,
			BaseURL: getEnv("BUILTIN_CM_OPENAI_BASE_URL"),
			Model:   getEnv("BUILTIN_CM_OPENAI_MODEL"),
		})
	case "ark":
		bcm, err = ao.NewChatModel(ctx, &ao.ChatModelConfig{
			APIKey:  getEnv("BUILTIN_CM_ARK_API_KEY"),
			Model:   getEnv("BUILTIN_CM_ARK_MODEL"),
			BaseURL: getEnv("BUILTIN_CM_ARK_BASE_URL"),
		})
	case "deepseek":
		bcm, err = deepseek.NewChatModel(ctx, &deepseek.ChatModelConfig{
			APIKey:  getEnv("BUILTIN_CM_DEEPSEEK_API_KEY"),
			BaseURL: getEnv("BUILTIN_CM_DEEPSEEK_BASE_URL"),
			Model:   getEnv("BUILTIN_CM_DEEPSEEK_MODEL"),
		})
	case "ollama":
		bcm, err = ollama.NewChatModel(ctx, &ollama.ChatModelConfig{
			BaseURL: getEnv("BUILTIN_CM_OLLAMA_BASE_URL"),
			Model:   getEnv("BUILTIN_CM_OLLAMA_MODEL"),
		})
	case "qwen":
		bcm, err = qwen.NewChatModel(ctx, &qwen.ChatModelConfig{
			APIKey:  getEnv("BUILTIN_CM_QWEN_API_KEY"),
			BaseURL: getEnv("BUILTIN_CM_QWEN_BASE_URL"),
			Model:   getEnv("BUILTIN_CM_QWEN_MODEL"),
		})
	case "gemini":
		backend, convErr := strconv.ParseInt(getEnv("BUILTIN_CM_GEMINI_BACKEND"), 10, 64)
		if convErr != nil {
			return nil, false, convErr
		}
		c, clientErr := genai.NewClient(ctx, &genai.ClientConfig{
			APIKey:   getEnv("BUILTIN_CM_GEMINI_API_KEY"),
			Backend:  genai.Backend(backend),
			Project:  getEnv("BUILTIN_CM_GEMINI_PROJECT"),
			Location: getEnv("BUILTIN_CM_GEMINI_LOCATION"),
			HTTPOptions: genai.HTTPOptions{
				BaseURL: getEnv("BUILTIN_CM_GEMINI_BASE_URL"),
			},
		})
		if clientErr != nil {
			return nil, false, clientErr
		}
		bcm, err = gemini.NewChatModel(ctx, &gemini.Config{
			Client: c,
			Model:  getEnv("BUILTIN_CM_GEMINI_MODEL"),
		})
	default:
		// accept builtin chat model not configured
	}

	if err != nil {
		return nil, false, fmt.Errorf("knowledge init openai chat mode failed, %w", err)
	}
	if bcm != nil {
		configured = true
	}

	return
}
