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

package loop

import (
	"context"
	"errors"
	"fmt"
	"math"
	"reflect"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
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
		fromPath := info.Source.Ref.FromPath

		if info.Source.Ref != nil && info.Source.Ref.VariableType != nil &&
			*info.Source.Ref.VariableType == vo.ParentIntermediate {
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
	Count = "loopCount"
)

func (l *Loop) Execute(ctx context.Context, in map[string]any, opts ...nodes.NestedWorkflowOption) (out map[string]any, err error) {
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

	options := &nodes.NestedWorkflowOptions{}
	for _, opt := range opts {
		opt(options)
	}

	var (
		existingCState   *nodes.NestedWorkflowState
		intermediateVars map[string]*any
		output           map[string]any
		hasBreak         = any(false)
	)
	err = compose.ProcessState(ctx, func(ctx context.Context, getter nodes.NestedWorkflowAware) error {
		var e error
		existingCState, _, e = getter.GetNestedWorkflowState(l.config.LoopNodeKey)
		if e != nil {
			return e
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	if existingCState != nil {
		output = existingCState.FullOutput
		intermediateVars = make(map[string]*any, len(existingCState.IntermediateVars))
		for k := range existingCState.IntermediateVars {
			intermediateVars[k] = ptr.Of(existingCState.IntermediateVars[k])
		}
		intermediateVars[BreakKey] = &hasBreak
	} else {
		output = make(map[string]any, len(l.outputs))
		for k := range l.outputs {
			output[k] = make([]any, 0)
		}

		intermediateVars = make(map[string]*any, len(l.config.IntermediateVars))
		for varKey := range l.config.IntermediateVars {
			v, ok := nodes.TakeMapValue(in, compose.FieldPath{varKey})
			if !ok {
				return nil, fmt.Errorf("incoming intermediate variable not present in input: %s", varKey)
			}

			intermediateVars[varKey] = &v
		}
		intermediateVars[BreakKey] = &hasBreak
	}

	ctx = nodes.InitIntermediateVars(ctx, intermediateVars, l.config.IntermediateVars)

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

		input[string(l.config.LoopNodeKey)+"#index"] = int64(i)

		items := make(map[string]any)
		for arrayKey := range arrays {
			ele := arrays[arrayKey][i]
			items[arrayKey] = ele
			currentKey := string(l.config.LoopNodeKey) + "#" + arrayKey

			// Recursively expand map[string]any elements
			var expand func(prefix string, val interface{})
			expand = func(prefix string, val interface{}) {
				input[prefix] = val
				if nestedMap, ok := val.(map[string]any); ok {
					for k, v := range nestedMap {
						expand(prefix+"#"+k, v)
					}
				}
			}
			expand(currentKey, ele)
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

	var (
		index2Done          = map[int]bool{}
		index2InterruptInfo = map[int]*compose.InterruptInfo{}
		resumed             = map[int]bool{}
	)

	for i := 0; i < maxIter; i++ {
		select {
		case <-ctx.Done():
			return nil, ctx.Err() // canceled by Eino workflow engine
		default:
		}

		if existingCState != nil {
			if existingCState.Index2Done[i] == true {
				continue
			}

			if existingCState.Index2InterruptInfo[i] != nil {
				if len(options.GetResumeIndexes()) > 0 {
					if _, ok := options.GetResumeIndexes()[i]; !ok {
						// previously interrupted, but not resumed this time, should not happen
						panic("impossible")
					}
				}
			}

			resumed[i] = true
		}

		input, items, err := getIthInput(i)
		if err != nil {
			return nil, err
		}

		subCtx, checkpointID := execute.InheritExeCtxWithBatchInfo(ctx, i, items)

		ithOpts := options.GetOptsForNested()
		ithOpts = append(ithOpts, options.GetOptsForIndexed(i)...)

		if checkpointID != "" {
			ithOpts = append(ithOpts, compose.WithCheckPointID(checkpointID))
		}

		if len(options.GetResumeIndexes()) > 0 {
			stateModifier, ok := options.GetResumeIndexes()[i]
			if ok {
				fmt.Println("has state modifier for ith run: ", i, ", checkpointID: ", checkpointID)
				ithOpts = append(ithOpts, compose.WithStateModifier(stateModifier))
			}
		}

		taskOutput, err := l.config.Inner.Invoke(subCtx, input, ithOpts...)
		if err != nil {
			info, ok := compose.ExtractInterruptInfo(err)
			if !ok {
				return nil, err
			}

			index2InterruptInfo[i] = info
			break
		}

		setIthOutput(i, taskOutput)

		index2Done[i] = true

		if hasBreak.(bool) {
			break
		}
	}

	// delete the interruptions that have been resumed
	for index := range resumed {
		delete(existingCState.Index2InterruptInfo, index)
	}

	compState := existingCState
	if compState == nil {
		compState = &nodes.NestedWorkflowState{
			Index2Done:          index2Done,
			Index2InterruptInfo: index2InterruptInfo,
			FullOutput:          output,
			IntermediateVars:    convertIntermediateVars(intermediateVars),
		}
	} else {
		for i := range index2Done {
			compState.Index2Done[i] = index2Done[i]
		}
		for i := range index2InterruptInfo {
			compState.Index2InterruptInfo[i] = index2InterruptInfo[i]
		}
		compState.FullOutput = output
		compState.IntermediateVars = convertIntermediateVars(intermediateVars)
	}

	if len(index2InterruptInfo) > 0 { // this invocation of batch.Execute has new interruptions
		iEvent := &entity.InterruptEvent{
			NodeKey:             l.config.LoopNodeKey,
			NodeType:            entity.NodeTypeLoop,
			NestedInterruptInfo: index2InterruptInfo, // only emit the newly generated interruptInfo
		}

		err := compose.ProcessState(ctx, func(ctx context.Context, setter nodes.NestedWorkflowAware) error {
			if e := setter.SaveNestedWorkflowState(l.config.LoopNodeKey, compState); e != nil {
				return e
			}

			return setter.SetInterruptEvent(l.config.LoopNodeKey, iEvent)
		})
		if err != nil {
			return nil, err
		}

		fmt.Println("save interruptEvent in state within loop: ", iEvent)
		fmt.Println("save composite info in state within loop: ", compState)

		return nil, compose.InterruptAndRerun
	} else {
		err := compose.ProcessState(ctx, func(ctx context.Context, setter nodes.NestedWorkflowAware) error {
			return setter.SaveNestedWorkflowState(l.config.LoopNodeKey, compState)
		})
		if err != nil {
			return nil, err
		}

		fmt.Println("save composite info in state within loop: ", compState)
	}

	if existingCState != nil && len(existingCState.Index2InterruptInfo) > 0 {
		fmt.Println("no interrupt thrown this round, but has historical interrupt events: ", existingCState.Index2InterruptInfo)
		panic("impossible")
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

		maxIter = int(iter.(int64))
	case Infinite:
	default:
		return 0, fmt.Errorf("loop type not supported: %v", l.config.LoopType)
	}

	return maxIter, nil
}

func convertIntermediateVars(vars map[string]*any) map[string]any {
	ret := make(map[string]any, len(vars))
	for k, v := range vars {
		ret[k] = *v
	}
	return ret
}

func (l *Loop) ToCallbackInput(_ context.Context, in map[string]any) (map[string]any, error) {
	trimmed := make(map[string]any, len(l.config.InputArrays))
	for _, arrayKey := range l.config.InputArrays {
		if v, ok := in[arrayKey]; ok {
			trimmed[arrayKey] = v
		}
	}
	return trimmed, nil
}
