package variableaggregator

import (
	"context"
	"errors"
	"fmt"
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

func (v *VariableAggregator) Invoke(_ context.Context, in map[string][]any) (map[string]any, error) {
	if v.config.MergeStrategy != FirstNotNullValue {
		return nil, fmt.Errorf("merge strategy not supported: %v", v.config.MergeStrategy)
	}

	result := make(map[string]any)
	for k, values := range in {
		done := false
		for index := range values {
			value := values[index]
			if value != nil {
				result[k] = value
				done = true
				break
			}
		}
		if !done {
			result[k] = nil
		}
	}

	return result, nil
}
