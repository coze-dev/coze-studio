package json

import (
	"context"
	"fmt"
	"strings"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
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

func (jd *JsonDeserializer) addWarning(ctx context.Context, err error) {
	if err == nil {
		return
	}
	var warnings []string
	warnings, _ = ctxcache.Get[[]string](ctx, warningsKey)
	warnings = append(warnings, err.Error())
	ctxcache.Store(ctx, warningsKey, warnings)
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

	convertedValue, err := nodes.Convert(ctx, rawValue, OutputKeyDeserialization, typeInfo)
	jd.addWarning(ctx, err)

	return map[string]any{OutputKeyDeserialization: convertedValue}, nil
}

func (jd *JsonDeserializer) ToCallbackOutput(ctx context.Context, out map[string]any) (*nodes.StructuredCallbackOutput, error) {
	var errInfo *vo.ErrorInfo
	if warnings, ok := ctxcache.Get[[]string](ctx, warningsKey); ok && len(warnings) > 0 {
		errInfo = &vo.ErrorInfo{
			Err:   fmt.Errorf("赋值异常: %s", strings.Join(warnings, ", ")),
			Level: vo.LevelWarn,
		}
	}
	return &nodes.StructuredCallbackOutput{
			Output:    out,
			RawOutput: out,
			Error:     errInfo,
		},
		nil
}
