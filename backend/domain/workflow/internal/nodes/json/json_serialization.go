package json

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
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
