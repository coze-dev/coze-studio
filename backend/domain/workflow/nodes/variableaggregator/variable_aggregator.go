package variableaggregator

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type MergeStrategy uint

const (
	FirstNotNullValue MergeStrategy = 1
)

type Config struct {
	MergeStrategy MergeStrategy
}

type VariableAggregator struct {
	config *Config
}

func NewVariableAggregator(_ context.Context, cfg *Config) (*VariableAggregator, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	return &VariableAggregator{config: cfg}, nil

}

func (v *VariableAggregator) Info() (*nodes.NodeInfo, error) {
	return &nodes.NodeInfo{
		Lambda: &nodes.Lambda{
			Invoke: v.Invoke,
		},
	}, nil
}

func (v *VariableAggregator) Invoke(ctx context.Context, in map[string]any) (map[string]any, error) {

	formatedInput := make(map[string][]any)

	for k, value := range in {
		m, ok := value.(map[string]any)
		if !ok {
			return nil, errors.New("value is not a map[string]any")
		}
		formatedInput[k] = make([]any, len(m))
		for i, sv := range m {
			index, err := strconv.Atoi(i)
			if err != nil {
				return nil, fmt.Errorf(" converting %s to int failed, err=%v", i, err)
			}
			formatedInput[k][index] = sv
		}
	}

	result := make(map[string]any)
	for k, values := range formatedInput {
		for index := range values {
			value := values[index]
			if value != nil {
				result[k] = value
				break
			}
		}
	}
	return result, nil
}
