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

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

const (
	InputKeySerialization  = "input"
	OutputKeySerialization = "output"
)

// SerializationConfig is the Config type for NodeTypeJsonSerialization.
// Each Node Type should have its own designated Config type,
// which should implement NodeAdaptor and NodeBuilder.
// NOTE: we didn't define any fields for this type,
// because this node is simple, we doesn't need to extract any SPECIFIC piece of info
// from frontend Node. In other cases we would need to do it, such as LLM's model configs.
type SerializationConfig struct {
	// you can define ANY number of fields here,
	// as long as these fields are SERIALIZABLE and EXPORTED.
	// to store specific info extracted from frontend node.
	// e.g.
	// - LLM model configs
	// - conditional expressions
	// - fixed input fields such as MaxBatchSize
}

// Adapt provides conversion from Node to NodeSchema.
// NOTE: in this specific case, we don't need AdaptOption.
func (s *SerializationConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeJsonSerialization,
		Name:    n.Data.Meta.Title,
		Configs: s, // remember to set the Node's Config Type to NodeSchema as well
	}

	// this sets input fields' type and mapping info
	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	// this set output fields' type info
	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (s *SerializationConfig) Build(_ context.Context, _ *schema.NodeSchema, _ ...schema.BuildOption) (
	any, error) {
	return &Serializer{}, nil
}

// Serializer is the actual node implementation.
type Serializer struct {
	// here can holds ANY data required for node execution
}

// Invoke implements the InvokableNode interface.
func (js *Serializer) Invoke(_ context.Context, input map[string]any) (map[string]any, error) {
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
