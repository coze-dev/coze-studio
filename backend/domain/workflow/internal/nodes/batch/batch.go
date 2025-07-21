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

package batch

import (
	"context"
	"errors"
	"fmt"
	"math"
	"reflect"
	"slices"
	"sync"

	"github.com/cloudwego/eino/compose"
	"golang.org/x/exp/maps"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type Batch struct {
	config  *Config
	outputs map[string]*vo.FieldSource
}

type Config struct {
	BatchNodeKey  vo.NodeKey `json:"batch_node_key"`
	InnerWorkflow compose.Runnable[map[string]any, map[string]any]

	InputArrays []string        `json:"input_arrays"`
	Outputs     []*vo.FieldInfo `json:"outputs"`
}

func NewBatch(_ context.Context, config *Config) (*Batch, error) {
	if config == nil {
		return nil, errors.New("config is required")
	}

	if len(config.InputArrays) == 0 {
		return nil, errors.New("need to have at least one incoming array for batch")
	}

	if len(config.Outputs) == 0 {
		return nil, errors.New("need to have at least one output variable for batch")
	}

	b := &Batch{
		config:  config,
		outputs: make(map[string]*vo.FieldSource),
	}

	for i := range config.Outputs {
		source := config.Outputs[i]
		path := source.Path
		if len(path) != 1 {
			return nil, fmt.Errorf("invalid path %q", path)
		}

		b.outputs[path[0]] = &source.Source
	}

	return b, nil
}

const (
	MaxBatchSizeKey   = "batchSize"
	ConcurrentSizeKey = "concurrentSize"
)

func (b *Batch) initOutput(length int) map[string]any {
	out := make(map[string]any, len(b.outputs))
	for key := range b.outputs {
		sliceType := reflect.TypeOf([]any{})
		slice := reflect.New(sliceType).Elem()
		slice.Set(reflect.MakeSlice(sliceType, length, length))
		out[key] = slice.Interface()
	}

	return out
}

func (b *Batch) Execute(ctx context.Context, in map[string]any, opts ...nodes.NestedWorkflowOption) (
	out map[string]any, err error) {
	arrays := make(map[string]any, len(b.config.InputArrays))
	minLen := math.MaxInt64
	for _, arrayKey := range b.config.InputArrays {
		a, ok := nodes.TakeMapValue(in, compose.FieldPath{arrayKey})
		if !ok {
			return nil, fmt.Errorf("incoming array not present in input: %s", arrayKey)
		}

		if reflect.TypeOf(a).Kind() != reflect.Slice {
			return nil, fmt.Errorf("incoming array not a slice: %s. Actual type: %v",
				arrayKey, reflect.TypeOf(a))
		}

		arrays[arrayKey] = a

		oneLen := reflect.ValueOf(a).Len()
		if oneLen < minLen {
			minLen = oneLen
		}
	}

	var maxIter, concurrency int64

	maxIterAny, ok := nodes.TakeMapValue(in, compose.FieldPath{MaxBatchSizeKey})
	if !ok {
		return nil, fmt.Errorf("incoming max iteration not present in input: %s", in)
	}

	maxIter = maxIterAny.(int64)
	if maxIter == 0 {
		maxIter = 100
	}

	concurrencyAny, ok := nodes.TakeMapValue(in, compose.FieldPath{ConcurrentSizeKey})
	if !ok {
		return nil, fmt.Errorf("incoming concurrency not present in input: %s", in)
	}

	concurrency = concurrencyAny.(int64)
	if concurrency == 0 {
		concurrency = 10
	}

	if minLen > int(maxIter) {
		minLen = int(maxIter)
	}

	output := b.initOutput(minLen)
	if minLen == 0 {
		return output, nil
	}

	getIthInput := func(i int) (map[string]any, map[string]any, error) {
		input := make(map[string]any)

		for k, v := range in { // carry over other values
			if k != MaxBatchSizeKey && k != ConcurrentSizeKey {
				input[k] = v
			}
		}

		input[string(b.config.BatchNodeKey)+"#index"] = int64(i)

		items := make(map[string]any)
		for arrayKey, array := range arrays {
			ele := reflect.ValueOf(array).Index(i).Interface()
			items[arrayKey] = []any{ele}
			currentKey := string(b.config.BatchNodeKey) + "#" + arrayKey

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

	setIthOutput := func(i int, taskOutput map[string]any) error {
		for k, source := range b.outputs {
			fromValue, _ := nodes.TakeMapValue(taskOutput, append(compose.FieldPath{string(source.Ref.FromNodeKey)},
				source.Ref.FromPath...))

			toArray, ok := nodes.TakeMapValue(output, compose.FieldPath{k})
			if !ok {
				return fmt.Errorf("key not present in outer workflow's output: %s", k)
			}

			toArray.([]any)[i] = fromValue
		}

		return nil
	}

	options := &nodes.NestedWorkflowOptions{}
	for _, opt := range opts {
		opt(options)
	}

	var existingCState *nodes.NestedWorkflowState
	err = compose.ProcessState(ctx, func(ctx context.Context, getter nodes.NestedWorkflowAware) error {
		var e error
		existingCState, _, e = getter.GetNestedWorkflowState(b.config.BatchNodeKey)
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
	}

	ctx, cancelFn := context.WithCancelCause(ctx)
	var (
		wg                  sync.WaitGroup
		mu                  sync.Mutex
		index2Done          = map[int]bool{}
		index2InterruptInfo = map[int]*compose.InterruptInfo{}
		resumed             = map[int]bool{}
	)

	ithTask := func(i int) {
		defer wg.Done()

		if existingCState != nil {
			if existingCState.Index2Done[i] == true {
				return
			}

			if existingCState.Index2InterruptInfo[i] != nil {
				if len(options.GetResumeIndexes()) > 0 {
					if _, ok := options.GetResumeIndexes()[i]; !ok {
						// previously interrupted, but not resumed this time, skip
						return
					}
				}
			}

			mu.Lock()
			resumed[i] = true
			mu.Unlock()
		}

		select {
		case <-ctx.Done():
			return // canceled by normal error, abort
		default:
		}

		mu.Lock()
		if len(index2InterruptInfo) > 0 { // already has interrupted index, abort
			mu.Unlock()
			return
		}
		mu.Unlock()

		input, items, err := getIthInput(i)
		if err != nil {
			cancelFn(err)
			return
		}

		subCtx, subCheckpointID := execute.InheritExeCtxWithBatchInfo(ctx, i, items)

		ithOpts := slices.Clone(options.GetOptsForNested())
		mu.Lock()
		ithOpts = append(ithOpts, options.GetOptsForIndexed(i)...)
		mu.Unlock()
		if subCheckpointID != "" {
			logs.CtxInfof(ctx, "[testInterrupt] prepare %d th run for batch node %s, subCheckPointID %s",
				i, b.config.BatchNodeKey, subCheckpointID)
			ithOpts = append(ithOpts, compose.WithCheckPointID(subCheckpointID))
		}

		mu.Lock()
		if len(options.GetResumeIndexes()) > 0 {
			stateModifier, ok := options.GetResumeIndexes()[i]
			mu.Unlock()
			if ok {
				fmt.Println("has state modifier for ith run: ", i, ", checkpointID: ", subCheckpointID)
				ithOpts = append(ithOpts, compose.WithStateModifier(stateModifier))
			}
		} else {
			mu.Unlock()
		}

		// if the innerWorkflow has output emitter that requires stream output, then we need to stream the inner workflow
		// the output then needs to be concatenated.
		taskOutput, err := b.config.InnerWorkflow.Invoke(subCtx, input, ithOpts...)
		if err != nil {
			info, ok := compose.ExtractInterruptInfo(err)
			if !ok {
				cancelFn(err)
				return
			}

			mu.Lock()
			index2InterruptInfo[i] = info
			mu.Unlock()
			return
		}

		if err = setIthOutput(i, taskOutput); err != nil {
			cancelFn(err)
			return
		}

		mu.Lock()
		index2Done[i] = true
		mu.Unlock()
	}

	wg.Add(minLen)
	if minLen < int(concurrency) {
		for i := 1; i < minLen; i++ {
			go ithTask(i)
		}
		ithTask(0)
	} else {
		taskChan := make(chan int, concurrency)
		for i := 0; i < int(concurrency); i++ {
			safego.Go(ctx, func() {
				for i := range taskChan {
					ithTask(i)
				}
			})
		}
		for i := 0; i < minLen; i++ {
			taskChan <- i
		}
		close(taskChan)
	}

	wg.Wait()

	if context.Cause(ctx) != nil {
		if errors.Is(context.Cause(ctx), context.Canceled) {
			return nil, context.Canceled // canceled by Eino workflow engine
		}
		return nil, context.Cause(ctx) // normal error, just throw it out
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
		}
	} else {
		for i := range index2Done {
			compState.Index2Done[i] = index2Done[i]
		}
		for i := range index2InterruptInfo {
			compState.Index2InterruptInfo[i] = index2InterruptInfo[i]
		}
		compState.FullOutput = output
	}

	if len(index2InterruptInfo) > 0 { // this invocation of batch.Execute has new interruptions
		iEvent := &entity.InterruptEvent{
			NodeKey:             b.config.BatchNodeKey,
			NodeType:            entity.NodeTypeBatch,
			NestedInterruptInfo: index2InterruptInfo, // only emit the newly generated interruptInfo
		}

		err := compose.ProcessState(ctx, func(ctx context.Context, setter nodes.NestedWorkflowAware) error {
			if e := setter.SaveNestedWorkflowState(b.config.BatchNodeKey, compState); e != nil {
				return e
			}

			return setter.SetInterruptEvent(b.config.BatchNodeKey, iEvent)
		})
		if err != nil {
			return nil, err
		}

		fmt.Println("save interruptEvent in state within batch: ", iEvent)
		fmt.Println("save composite info in state within batch: ", compState)

		return nil, compose.InterruptAndRerun
	} else {
		err := compose.ProcessState(ctx, func(ctx context.Context, setter nodes.NestedWorkflowAware) error {
			if e := setter.SaveNestedWorkflowState(b.config.BatchNodeKey, compState); e != nil {
				return e
			}

			if existingCState == nil {
				return nil
			}

			// although this invocation does not have new interruptions,
			// this batch node previously have interrupts yet to be resumed.
			// we overwrite the interrupt events, keeping only the interrupts yet to be resumed.
			return setter.SetInterruptEvent(b.config.BatchNodeKey, &entity.InterruptEvent{
				NodeKey:             b.config.BatchNodeKey,
				NodeType:            entity.NodeTypeBatch,
				NestedInterruptInfo: existingCState.Index2InterruptInfo,
			})
		})
		if err != nil {
			return nil, err
		}

		fmt.Println("save composite info in state within batch: ", compState)
	}

	if existingCState != nil && len(existingCState.Index2InterruptInfo) > 0 {
		logs.CtxInfof(ctx, "no interrupt thrown this round, but has historical interrupt events yet to be resumed, "+
			"nodeKey: %v. indexes: %v", b.config.BatchNodeKey, maps.Keys(existingCState.Index2InterruptInfo))
		return nil, compose.InterruptAndRerun // interrupt again to wait for resuming of previously interrupted index runs
	}

	return output, nil
}

func (b *Batch) ToCallbackInput(_ context.Context, in map[string]any) (map[string]any, error) {
	trimmed := make(map[string]any, len(b.config.InputArrays))
	for _, arrayKey := range b.config.InputArrays {
		if v, ok := in[arrayKey]; ok {
			trimmed[arrayKey] = v
		}
	}
	return trimmed, nil
}
