package loop

import (
	"context"
	"errors"
	"fmt"
	"math"
	"reflect"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type Loop struct {
	config *Config
}

type Config struct {
	LoopNodeKey      string
	LoopType         Type
	InputArrays      []string
	IntermediateVars map[string]*nodes.TypeInfo
	Outputs          map[string]*nodes.FieldInfo

	Inner compose.Runnable[map[string]any, map[string]any]
}

type Type string

const (
	ByArray     Type = "by_array"
	ByIteration Type = "by_iteration"
	Infinite    Type = "infinite"
)

func NewLoop(_ context.Context, conf *Config) (*Loop, error) {
	if conf == nil {
		return nil, errors.New("config is nil")
	}

	if conf.LoopType == ByArray {
		if len(conf.InputArrays) == 0 {
			return nil, errors.New("input arrays is empty when loop type is ByArray")
		}
	}

	return &Loop{
		config: conf,
	}, nil
}

const (
	Count = "LoopCount"
)

func (l *Loop) Execute(ctx context.Context, in map[string]any) (map[string]any, error) {
	maxIter, err := l.getMaxIter(in)
	if err != nil {
		return nil, err
	}

	arrays := make(map[string][]any, len(l.config.InputArrays))
	for _, arrayKey := range l.config.InputArrays {
		a, ok := nodes.TakeMapValue(in, compose.FieldPath{arrayKey})
		if !ok {
			return nil, fmt.Errorf("incoming array not present in input: %s", arrayKey)
		}
		arrays[arrayKey] = a.([]any)
	}

	intermediateVars := make(map[string]any, len(l.config.IntermediateVars))
	for varKey, tInfo := range l.config.IntermediateVars {
		v, ok := nodes.TakeMapValue(in, compose.FieldPath{varKey})
		if !ok {
			return nil, fmt.Errorf("incoming intermediate variable not present in input: %s", varKey)
		}

		v1, ok := nodes.TypeValidateAndConvert(tInfo, v)
		if !ok {
			return nil, fmt.Errorf("incoming intermediate variable not valid in input: %s", varKey)
		}

		intermediateVars[varKey] = &v1 // use pointer, because this will get updated in inner workflow
	}

	output := make(map[string]any, len(l.config.Outputs))
	outputVars := make(map[string]string, len(l.config.Outputs))
	for k, info := range l.config.Outputs {
		fromNodeKey := info.Source.Ref.FromNodeKey
		fromPath := info.Source.Ref.FromPath

		if fromNodeKey == l.config.LoopNodeKey {
			if len(fromPath) > 1 {
				return nil, fmt.Errorf("loop output refers to intermediate variable, but path length > 1: %v", fromPath)
			}

			if _, ok := intermediateVars[fromPath[0]]; !ok {
				return nil, fmt.Errorf("loop output refers to intermediate variable, but not found in intermediate vars: %v", fromPath)
			}

			outputVars[k] = fromPath[0]

			continue
		}

		output[k] = make([]any, 0)
	}

	getIthInput := func(i int) (map[string]any, error) {
		input := make(map[string]any)

		for k, v := range in { // carry over other values
			if k == Count {
				continue
			}

			if _, ok := arrays[k]; ok {
				continue
			}

			if _, ok := intermediateVars[k]; ok {
				continue
			}

			input[k] = v
		}

		if _, ok := input[l.config.LoopNodeKey]; !ok {
			input[l.config.LoopNodeKey] = make(map[string]any)
		}

		input[l.config.LoopNodeKey].(map[string]any)["index"] = i

		for arrayKey := range arrays {
			input[l.config.LoopNodeKey].(map[string]any)[arrayKey] = arrays[arrayKey]
		}

		for varKey := range intermediateVars {
			input[l.config.LoopNodeKey].(map[string]any)[varKey] = intermediateVars[varKey]
		}

		return input, nil
	}

	setIthOutput := func(i int, taskOutput map[string]any) bool {
		for arrayKey := range output {
			tInfo := l.config.Outputs[arrayKey]
			fromValue, ok := nodes.TakeMapValue(taskOutput, append(compose.FieldPath{tInfo.Source.Ref.FromNodeKey}, tInfo.Source.Ref.FromPath...))
			if ok {
				output[arrayKey] = append(output[arrayKey].([]any), fromValue)
			}
		}

		b, ok := nodes.TakeMapValue(taskOutput, compose.FieldPath{BreakKey})
		if ok {
			return b.(bool)
		}

		return false
	}

	for i := 0; i < maxIter; i++ {
		input, err := getIthInput(i)
		if err != nil {
			return nil, err
		}
		taskOutput, err := l.config.Inner.Invoke(ctx, input)
		if err != nil {
			return nil, err
		}

		if setIthOutput(i, taskOutput) {
			break
		}
	}

	for outputVarKey, intermediateVarKey := range outputVars {
		output[outputVarKey] = *(intermediateVars[intermediateVarKey].(*any))
	}

	return output, nil
}

func (l *Loop) getMaxIter(in map[string]any) (int, error) {
	maxIter := math.MaxInt

	switch l.config.LoopType {
	case ByArray:
		for _, arrayKey := range l.config.InputArrays {
			a, ok := nodes.TakeMapValue(in, compose.FieldPath{arrayKey})
			if !ok {
				return 0, fmt.Errorf("incoming array not present in input: %s", arrayKey)
			}

			if reflect.TypeOf(a).Kind() != reflect.Slice {
				return 0, fmt.Errorf("incoming array not a slice: %s. Actual type: %v", arrayKey, reflect.TypeOf(a))
			}

			oneLen := reflect.ValueOf(a).Len()
			if oneLen < maxIter {
				maxIter = oneLen
			}
		}
	case ByIteration:
		iter, ok := nodes.TakeMapValue(in, compose.FieldPath{Count})
		if !ok {
			return 0, errors.New("incoming LoopCount not present in input when loop type is ByIteration")
		}

		maxIter = iter.(int)
	case Infinite:
	default:
		return 0, fmt.Errorf("loop type not supported: %v", l.config.LoopType)
	}

	return maxIter, nil
}
