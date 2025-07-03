package json

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

const (
	InputKeyDeserialization  = "input"
	OutputKeyDeserialization = "output"
	warningsKey              = "deserialization_warnings"
)

type DeserializationConfig struct {
	OutputFields map[string]*vo.TypeInfo `json:"outputFields,omitempty"`
}

type JsonDeserializer struct {
	config   *DeserializationConfig
	typeInfo *vo.TypeInfo
}

func NewJsonDeserializer(_ context.Context, cfg *DeserializationConfig) (*JsonDeserializer, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config required")
	}
	if cfg.OutputFields == nil {
		return nil, fmt.Errorf("OutputFields is required for deserialization")
	}
	typeInfo := cfg.OutputFields[OutputKeyDeserialization]
	if typeInfo == nil {
		return nil, fmt.Errorf("no output field specified in deserialization config")
	}
	return &JsonDeserializer{
		config:   cfg,
		typeInfo: typeInfo,
	}, nil
}

func (jd *JsonDeserializer) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
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

	convertedValue, warnings, err := nodes.Convert(ctx, rawValue, OutputKeyDeserialization, typeInfo)
	if err != nil {
		return nil, err
	}
	if len(warnings) > 0 {
		ctxcache.Store(ctx, warningsKey, warnings)
	}
	return map[string]any{OutputKeyDeserialization: convertedValue}, nil
}

func (jd *JsonDeserializer) ToCallbackOutput(ctx context.Context, out map[string]any) (*nodes.StructuredCallbackOutput, error) {
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
