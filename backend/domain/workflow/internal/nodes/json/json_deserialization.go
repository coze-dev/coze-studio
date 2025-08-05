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
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

const (
	InputKeyDeserialization  = "input"
	OutputKeyDeserialization = "output"
	warningsKey              = "deserialization_warnings"
)

type DeserializationConfig struct{}

func (d *DeserializationConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (
	*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeJsonDeserialization,
		Name:    n.Data.Meta.Title,
		Configs: d,
	}

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (d *DeserializationConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	typeInfo, ok := ns.OutputTypes[OutputKeyDeserialization]
	if !ok {
		return nil, fmt.Errorf("no output field specified in deserialization config")
	}
	return &Deserializer{
		typeInfo: typeInfo,
	}, nil
}

type Deserializer struct {
	typeInfo *vo.TypeInfo
}

func (jd *Deserializer) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	jsonStrValue := input[InputKeyDeserialization]

	jsonStr, ok := jsonStrValue.(string)
	if !ok {
		return nil, fmt.Errorf("input is not a string, got %T", jsonStrValue)
	}

	typeInfo := jd.typeInfo

	var rawValue any
	var err error

	// Unmarshal based on the root type
	switch typeInfo.Type {
	case vo.DataTypeString, vo.DataTypeInteger, vo.DataTypeNumber, vo.DataTypeBoolean, vo.DataTypeTime, vo.DataTypeFile:
		// Scalar types - unmarshal to generic any
		err = sonic.Unmarshal([]byte(jsonStr), &rawValue)
	case vo.DataTypeArray:
		// Array type - unmarshal to []any
		var arr []any
		err = sonic.Unmarshal([]byte(jsonStr), &arr)
		rawValue = arr
	case vo.DataTypeObject:
		// Object type - unmarshal to map[string]any
		var obj map[string]any
		err = sonic.Unmarshal([]byte(jsonStr), &obj)
		rawValue = obj
	default:
		return nil, fmt.Errorf("unsupported root data type: %s", typeInfo.Type)
	}

	if err != nil {
		return nil, fmt.Errorf("JSON unmarshaling failed: %w", err)
	}

	convertedValue, ws, err := nodes.Convert(ctx, rawValue, OutputKeyDeserialization, typeInfo)
	if err != nil {
		return nil, err
	}

	if ws != nil && len(*ws) > 0 {
		ctxcache.Store(ctx, warningsKey, *ws)
	}

	return map[string]any{OutputKeyDeserialization: convertedValue}, nil
}

func (jd *Deserializer) ToCallbackOutput(ctx context.Context, out map[string]any) (*nodes.StructuredCallbackOutput, error) {
	var wfe vo.WorkflowError
	if warnings, ok := ctxcache.Get[nodes.ConversionWarnings](ctx, warningsKey); ok {
		wfe = vo.WrapWarn(errno.ErrNodeOutputParseFail, warnings, errorx.KV("warnings", warnings.Error()))
	}
	return &nodes.StructuredCallbackOutput{
		Output:    out,
		RawOutput: out,
		Error:     wfe,
	}, nil
}
