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
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	_break "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/loop/break"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type Loop struct {
	outputs    map[string]*vo.FieldSource
	outputVars map[string]string
	inner      compose.Runnable[map[string]any, map[string]any]
	nodeKey    vo.NodeKey

	loopType         Type
	inputArrays      []string
	intermediateVars map[string]*vo.TypeInfo
}

type Config struct {
	LoopType         Type
	InputArrays      []string
	IntermediateVars map[string]*vo.TypeInfo
}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	if n.Parent() != nil {
		return nil, fmt.Errorf("loop node cannot have parent: %s", n.Parent().ID)
	}

	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeLoop,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	loopType, err := toLoopType(n.Data.Inputs.LoopType)
	if err != nil {
		return nil, err
	}
	c.LoopType = loopType

	intermediateVars := make(map[string]*vo.TypeInfo)
	for _, param := range n.Data.Inputs.VariableParameters {
		tInfo, err := convert.CanvasBlockInputToTypeInfo(param.Input)
		if err != nil {
			return nil, err
		}
		intermediateVars[param.Name] = tInfo

		ns.SetInputType(param.Name, tInfo)
		sources, err := convert.CanvasBlockInputToFieldInfo(param.Input, compose.FieldPath{param.Name}, nil)
		if err != nil {
			return nil, err
		}
		ns.AddInputSource(sources...)
	}
	c.IntermediateVars = intermediateVars

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err := convert.SetOutputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	for _, fieldInfo := range ns.OutputSources {
		if fieldInfo.Source.Ref != nil {
			if len(fieldInfo.Source.Ref.FromPath) == 1 {
				if _, ok := intermediateVars[fieldInfo.Source.Ref.FromPath[0]]; ok {
					fieldInfo.Source.Ref.VariableType = ptr.Of(vo.ParentIntermediate)
				}
			}
		}
	}

	loopCount := n.Data.Inputs.LoopCount
	if loopCount != nil {
		typeInfo, err := convert.CanvasBlockInputToTypeInfo(loopCount)
		if err != nil {
			return nil, err
		}
		ns.SetInputType(Count, typeInfo)

		sources, err := convert.CanvasBlockInputToFieldInfo(loopCount, compose.FieldPath{Count}, nil)
		if err != nil {
			return nil, err
		}
		ns.AddInputSource(sources...)
	}

	for key, tInfo := range ns.InputTypes {
		if tInfo.Type != vo.DataTypeArray {
			continue
		}

		if _, ok := intermediateVars[key]; ok { // exclude arrays in intermediate vars
			continue
		}

		c.InputArrays = append(c.InputArrays, key)
	}

	return ns, nil
}

func toLoopType(l vo.LoopType) (Type, error) {
	switch l {
	case vo.LoopTypeArray:
		return ByArray, nil
	case vo.LoopTypeCount:
		return ByIteration, nil
	case vo.LoopTypeInfinite:
		return Infinite, nil
	default:
		return "", fmt.Errorf("unsupported loop type: %s", l)
	}
}

func (c *Config) Build(_ context.Context, ns *schema.NodeSchema, opts ...schema.BuildOption) (any, error) {
	if c.LoopType == ByArray {
		if len(c.InputArrays) == 0 {
			return nil, errors.New("input arrays is empty when loop type is ByArray")
		}
	}

	options := schema.GetBuildOptions(opts...)
	if options.Inner == nil {
		return nil, errors.New("inner workflow is required for Loop Node")
	}

	loop := &Loop{
		outputs:          make(map[string]*vo.FieldSource),
		outputVars:       make(map[string]string),
		inputArrays:      c.InputArrays,
		nodeKey:          ns.Key,
		intermediateVars: c.IntermediateVars,
		inner:            options.Inner,
		loopType:         c.LoopType,
	}

	for _, info := range ns.OutputSources {
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

			if _, ok := c.IntermediateVars[fromPath[0]]; !ok {
				return nil, fmt.Errorf("loop output refers to intermediate variable, but not found in intermediate vars: %v", fromPath)
			}

			loop.outputVars[k] = fromPath[0]

			continue
		}

		loop.outputs[k] = &info.Source
	}

	return loop, nil
}

type Type string

const (
	ByArray     Type = "by_array"
	ByIteration Type = "by_iteration"
	Infinite    Type = "infinite"
)

const (
	Count = "loopCount"
)

func (l *Loop) Invoke(ctx context.Context, in map[string]any, opts ...nodes.NodeOption) (
	out map[string]any, err error) {
	maxIter, err := l.getMaxIter(in)
	if err != nil {
		return nil, err
	}

	arrays := make(map[string][]any, len(l.inputArrays))
	for _, arrayKey := range l.inputArrays {
		a, ok := nodes.TakeMapValue(in, compose.FieldPath{arrayKey})
		if !ok {
			return nil, fmt.Errorf("incoming array not present in input: %s", arrayKey)
		}
		arrays[arrayKey] = a.([]any)
	}

	options := nodes.GetCommonOptions(&nodes.NodeOptions{}, opts...)

	var (
		existingCState   *nodes.NestedWorkflowState
		intermediateVars map[string]*any
		output           map[string]any
		hasBreak         = any(false)
	)
	err = compose.ProcessState(ctx, func(ctx context.Context, getter nodes.NestedWorkflowAware) error {
		var e error
		existingCState, _, e = getter.GetNestedWorkflowState(l.nodeKey)
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
		intermediateVars[_break.BreakKey] = &hasBreak
	} else {
		output = make(map[string]any, len(l.outputs))
		for k := range l.outputs {
			output[k] = make([]any, 0)
		}

		intermediateVars = make(map[string]*any, len(l.intermediateVars))
		for varKey := range l.intermediateVars {
			v, ok := nodes.TakeMapValue(in, compose.FieldPath{varKey})
			if !ok {
				return nil, fmt.Errorf("incoming intermediate variable not present in input: %s", varKey)
			}

			intermediateVars[varKey] = &v
		}
		intermediateVars[_break.BreakKey] = &hasBreak
	}

	ctx = nodes.InitIntermediateVars(ctx, intermediateVars, l.intermediateVars)

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

		input[string(l.nodeKey)+"#index"] = int64(i)

		items := make(map[string]any)
		for arrayKey := range arrays {
			ele := arrays[arrayKey][i]
			items[arrayKey] = ele
			currentKey := string(l.nodeKey) + "#" + arrayKey

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

		taskOutput, err := l.inner.Invoke(subCtx, input, ithOpts...)
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
			NodeKey:             l.nodeKey,
			NodeType:            entity.NodeTypeLoop,
			NestedInterruptInfo: index2InterruptInfo, // only emit the newly generated interruptInfo
		}

		err := compose.ProcessState(ctx, func(ctx context.Context, setter nodes.NestedWorkflowAware) error {
			if e := setter.SaveNestedWorkflowState(l.nodeKey, compState); e != nil {
				return e
			}

			return setter.SetInterruptEvent(l.nodeKey, iEvent)
		})
		if err != nil {
			return nil, err
		}

		return nil, compose.InterruptAndRerun
	} else {
		err := compose.ProcessState(ctx, func(ctx context.Context, setter nodes.NestedWorkflowAware) error {
			return setter.SaveNestedWorkflowState(l.nodeKey, compState)
		})
		if err != nil {
			return nil, err
		}

		fmt.Println("save composite info in state within loop: ", compState)
	}

	if existingCState != nil && len(existingCState.Index2InterruptInfo) > 0 {
		panic(fmt.Sprintf("no interrupt thrown this round, but has historical interrupt events: %v", existingCState.Index2InterruptInfo))
	}

	for outputVarKey, intermediateVarKey := range l.outputVars {
		output[outputVarKey] = *(intermediateVars[intermediateVarKey])
	}

	return output, nil
}

func (l *Loop) getMaxIter(in map[string]any) (int, error) {
	maxIter := math.MaxInt

	switch l.loopType {
	case ByArray:
		for _, arrayKey := range l.inputArrays {
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
		return 0, fmt.Errorf("loop type not supported: %v", l.loopType)
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
	trimmed := make(map[string]any, len(l.inputArrays))
	for _, arrayKey := range l.inputArrays {
		if v, ok := in[arrayKey]; ok {
			trimmed[arrayKey] = v
		}
	}
	return trimmed, nil
}
