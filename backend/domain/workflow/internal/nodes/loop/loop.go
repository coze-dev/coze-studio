package loop

import (
	"context"
	"errors"
	"fmt"
	"math"
	"reflect"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

type Loop struct {
	config     *Config
	outputs    map[string]*vo.FieldSource
	outputVars map[string]string
}

type Config struct {
	LoopNodeKey      vo.NodeKey
	LoopType         Type
	InputArrays      []string
	IntermediateVars map[string]*vo.TypeInfo
	Outputs          []*vo.FieldInfo

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

	loop := &Loop{
		config:     conf,
		outputs:    make(map[string]*vo.FieldSource),
		outputVars: make(map[string]string),
	}

	for _, info := range conf.Outputs {
		if len(info.Path) != 1 {
			return nil, fmt.Errorf("invalid output path: %s", info.Path)
		}

		k := info.Path[0]

		fromNodeKey := info.Source.Ref.FromNodeKey
		fromPath := info.Source.Ref.FromPath

		if fromNodeKey == conf.LoopNodeKey {
			if len(fromPath) > 1 {
				return nil, fmt.Errorf("loop output refers to intermediate variable, but path length > 1: %v", fromPath)
			}

			if _, ok := conf.IntermediateVars[fromPath[0]]; !ok {
				return nil, fmt.Errorf("loop output refers to intermediate variable, but not found in intermediate vars: %v", fromPath)
			}

			loop.outputVars[k] = fromPath[0]

			continue
		}

		loop.outputs[k] = &info.Source
	}

	return loop, nil
}

const (
	Count = "LoopCount"
)

func (l *Loop) Execute(ctx context.Context, in map[string]any, opts ...nodes.CompositeOption) (map[string]any, error) {
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

	intermediateVars := make(map[string]*any, len(l.config.IntermediateVars))
	for varKey := range l.config.IntermediateVars {
		v, ok := nodes.TakeMapValue(in, compose.FieldPath{varKey})
		if !ok {
			return nil, fmt.Errorf("incoming intermediate variable not present in input: %s", varKey)
		}

		intermediateVars[varKey] = &v
	}

	hasBreak := any(false)
	intermediateVars[BreakKey] = &hasBreak

	ctx = callbacks.InitCallbacks(ctx, &callbacks.RunInfo{
		Component: compose.ComponentOfWorkflow,
		Name:      string(l.config.LoopNodeKey),
	})
	ctx = nodes.InitIntermediateVars(ctx, intermediateVars)

	output := make(map[string]any, len(l.outputs))
	for k := range l.outputs {
		output[k] = make([]any, 0)
	}

	getIthInput := func(i int) (map[string]any, map[string]any, error) {
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

		if _, ok := input[string(l.config.LoopNodeKey)]; !ok {
			input[string(l.config.LoopNodeKey)] = make(map[string]any)
		}

		input[string(l.config.LoopNodeKey)].(map[string]any)["index"] = int64(i)

		items := make(map[string]any)
		for arrayKey := range arrays {
			items[arrayKey] = arrays[arrayKey][i]
			input[string(l.config.LoopNodeKey)].(map[string]any)[arrayKey] = arrays[arrayKey][i]
		}

		return input, items, nil
	}

	setIthOutput := func(i int, taskOutput map[string]any) {
		for arrayKey := range l.outputs {
			source := l.outputs[arrayKey]
			fromValue, ok := nodes.TakeMapValue(taskOutput, append(compose.FieldPath{string(source.Ref.FromNodeKey)}, source.Ref.FromPath...))
			if ok {
				output[arrayKey] = append(output[arrayKey].([]any), fromValue)
			}
		}
	}

	options := &nodes.CompositeOptions{}
	for _, opt := range opts {
		opt(options)
	}

	for i := 0; i < maxIter; i++ {
		input, items, err := getIthInput(i)
		if err != nil {
			return nil, err
		}

		subCtx := execute.InheritExeCtxWithBatchInfo(ctx, i, items)
		taskOutput, err := l.config.Inner.Invoke(subCtx, input, options.GetOptsForInner()...) // TODO: needs to distinguish between Invoke and Stream for inner workflow
		if err != nil {
			return nil, err
		}

		setIthOutput(i, taskOutput)

		if hasBreak.(bool) {
			break
		}
	}

	for outputVarKey, intermediateVarKey := range l.outputVars {
		output[outputVarKey] = *(intermediateVars[intermediateVarKey])
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
