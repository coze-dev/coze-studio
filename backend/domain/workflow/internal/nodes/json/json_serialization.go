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

package json

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

const (
	InputKeySerialization  = "input"
	OutputKeySerialization = "output"
)

type SerializationConfig struct {
	InputTypes map[string]*vo.TypeInfo
}

type JsonSerializer struct {
	config *SerializationConfig
}

func NewJsonSerializer(_ context.Context, cfg *SerializationConfig) (*JsonSerializer, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config required")
	}
	if cfg.InputTypes == nil {
		return nil, fmt.Errorf("InputTypes is required for serialization")
	}

	return &JsonSerializer{
		config: cfg,
	}, nil
}

func (js *JsonSerializer) Invoke(_ context.Context, input map[string]any) (map[string]any, error) {
	// Directly use the input map for serialization
	if input == nil {
		return nil, fmt.Errorf("input data for serialization cannot be nil")
	}

	originData := input[InputKeySerialization]
	serializedData, err := sonic.Marshal(originData) // Serialize the entire input map
	if err != nil {
		return nil, fmt.Errorf("serialization error: %w", err)
	}
	return map[string]any{OutputKeySerialization: string(serializedData)}, nil
}
