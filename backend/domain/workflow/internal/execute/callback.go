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

package execute

import (
	"context"
	"errors"
	"fmt"
	"io"
	"reflect"
	"slices"
	"strconv"
	"time"

	"github.com/coze-dev/coze-studio/backend/pkg/sonic"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	callbacks2 "github.com/cloudwego/eino/utils/callbacks"

	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type NodeHandler struct {
	nodeKey    vo.NodeKey
	nodeName   string
	ch         chan<- *Event
	resumePath []string

	resumeEvent *entity.InterruptEvent

	terminatePlan *vo.TerminatePlan
}

type WorkflowHandler struct {
	ch                 chan<- *Event
	rootWorkflowBasic  *entity.WorkflowBasic
	rootExecuteID      int64
	subWorkflowBasic   *entity.WorkflowBasic
	nodeCount          int32
	requireCheckpoint  bool
	resumeEvent        *entity.InterruptEvent
	exeCfg             workflowModel.ExecuteConfig
	rootTokenCollector *TokenCollector
}

type ToolHandler struct {
	ch   chan<- *Event
	info entity.FunctionInfo
}

func NewRootWorkflowHandler(wb *entity.WorkflowBasic, executeID int64, requireCheckpoint bool,
	ch chan<- *Event, resumedEvent *entity.InterruptEvent, exeCfg workflowModel.ExecuteConfig, nodeCount int32,
) callbacks.Handler {
	return &WorkflowHandler{
		ch:                ch,
		rootWorkflowBasic: wb,
		rootExecuteID:     executeID,
		requireCheckpoint: requireCheckpoint,
		resumeEvent:       resumedEvent,
		exeCfg:            exeCfg,
		nodeCount:         nodeCount,
	}
}

func NewSubWorkflowHandler(parent *WorkflowHandler, subWB *entity.WorkflowBasic,
	resumedEvent *entity.InterruptEvent, nodeCount int32,
) callbacks.Handler {
	return &WorkflowHandler{
		ch:                parent.ch,
		rootWorkflowBasic: parent.rootWorkflowBasic,
		rootExecuteID:     parent.rootExecuteID,
		requireCheckpoint: parent.requireCheckpoint,
		subWorkflowBasic:  subWB,
		resumeEvent:       resumedEvent,
		nodeCount:         nodeCount,
	}
}

func (w *WorkflowHandler) getRootWorkflowID() int64 {
	if w.rootWorkflowBasic != nil {
		return w.rootWorkflowBasic.ID
	}
	return 0
}

func (w *WorkflowHandler) getSubWorkflowID() int64 {
	if w.subWorkflowBasic != nil {
		return w.subWorkflowBasic.ID
	}
	return 0
}

func NewNodeHandler(key string, name string, ch chan<- *Event, resumeEvent *entity.InterruptEvent, plan *vo.TerminatePlan) callbacks.Handler {
	var resumePath []string
	if resumeEvent != nil {
		resumePath = slices.Clone(resumeEvent.NodePath)
	}

	return &NodeHandler{
		nodeKey:       vo.NodeKey(key),
		nodeName:      name,
		ch:            ch,
		resumePath:    resumePath,
		resumeEvent:   resumeEvent,
		terminatePlan: plan,
	}
}

func NewToolHandler(ch chan<- *Event, info entity.FunctionInfo) callbacks.Handler {
	th := &ToolHandler{
		ch:   ch,
		info: info,
	}
	return callbacks2.NewHandlerHelper().Tool(&callbacks2.ToolCallbackHandler{
		OnStart:               th.OnStart,
		OnEnd:                 th.OnEnd,
		OnEndWithStreamOutput: th.OnEndWithStreamOutput,
		OnError:               th.OnError,
	}).Handler()
}

func (w *WorkflowHandler) initWorkflowCtx(ctx context.Context) (context.Context, bool) {
	var (
		err    error
		newCtx context.Context
		resume bool
	)
	if w.subWorkflowBasic == nil {
		if w.resumeEvent != nil {
			resume = true
			newCtx, err = restoreWorkflowCtx(ctx, w)
			if err != nil {
				logs.Errorf("failed to restore root execute context: %v", err)
				return ctx, false
			}
		} else {
			newCtx, err = PrepareRootExeCtx(ctx, w)
			if err != nil {
				logs.Errorf("failed to prepare root exe context: %v", err)
				return ctx, false
			}
		}
	} else {
		if w.resumeEvent == nil {
			resume = false
		} else {
			resumePath := w.resumeEvent.NodePath

			c := GetExeCtx(ctx)
			if c == nil {
				panic("nil execute context")
			}
			if c.NodeCtx == nil {
				panic("sub workflow exe ctx must under a parent node ctx")
			}

			path := c.NodeCtx.NodePath
			if len(path) > len(resumePath) {
				resume = false
			} else {
				resume = true
				for i := 0; i < len(path); i++ {
					if path[i] != resumePath[i] {
						resume = false
						break
					}
				}
			}
		}

		if resume {
			newCtx, err = restoreWorkflowCtx(ctx, w)
			if err != nil {
				logs.Errorf("failed to restore sub execute context: %v", err)
				return ctx, false
			}
		} else {
			newCtx, err = PrepareSubExeCtx(ctx, w.subWorkflowBasic, w.requireCheckpoint)
			if err != nil {
				logs.Errorf("failed to prepare root exe context: %v", err)
				return ctx, false
			}
		}
	}

	return newCtx, resume
}

func (w *WorkflowHandler) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	if info.Component != compose.ComponentOfWorkflow || (info.Name != strconv.FormatInt(w.getRootWorkflowID(), 10) &&
		info.Name != strconv.FormatInt(w.getSubWorkflowID(), 10)) {
		return ctx
	}

	newCtx, resumed := w.initWorkflowCtx(ctx)

	if w.subWorkflowBasic == nil {
		// check if already canceled
		canceled, err := workflow.GetRepository().GetWorkflowCancelFlag(newCtx, w.rootExecuteID)
		if err != nil {
			logs.Errorf("failed to get workflow cancel flag: %v", err)
		}

		if canceled {
			cancelCtx, cancelFn := context.WithCancel(newCtx)
			cancelFn()
			return cancelCtx
		}
	}

	if resumed {
		c := GetExeCtx(newCtx)
		w.ch <- &Event{
			Type:    WorkflowResume,
			Context: c,
		}
		return newCtx
	}

	c := GetExeCtx(newCtx)
	w.ch <- &Event{
		Type:      WorkflowStart,
		Context:   c,
		Input:     input.(map[string]any),
		nodeCount: w.nodeCount,
	}

	return newCtx
}

func (w *WorkflowHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	if info.Component != compose.ComponentOfWorkflow || (info.Name != strconv.FormatInt(w.getRootWorkflowID(), 10) &&
		info.Name != strconv.FormatInt(w.getSubWorkflowID(), 10)) {
		return ctx
	}

	c := GetExeCtx(ctx)
	e := &Event{
		Type:     WorkflowSuccess,
		Context:  c,
		Output:   output.(map[string]any),
		Duration: time.Since(time.UnixMilli(c.StartTime)),
	}

	if c.TokenCollector != nil {
		usage := c.TokenCollector.wait()
		e.Token = &TokenInfo{
			InputToken:  int64(usage.PromptTokens),
			OutputToken: int64(usage.CompletionTokens),
			TotalToken:  int64(usage.TotalTokens),
		}
	}

	w.ch <- e

	return ctx
}

const InterruptEventIndexPrefix = "interrupt_event_index_"

func extractInterruptEvents(interruptInfo *compose.InterruptInfo, prefixes ...string) (interruptEvents []*entity.InterruptEvent, err error) {
	for _, nodeKey := range interruptInfo.RerunNodes {

		extra := interruptInfo.RerunNodesExtra[nodeKey]
		if extra == nil {
			continue
		}
		interruptE, ok := extra.(*entity.InterruptEvent)
		if !ok {
			logs.Errorf("failed to extract tool interrupt event from node key: %v", err)
			continue
		}

		if len(interruptE.NestedInterruptInfo) == 0 && interruptE.SubWorkflowInterruptInfo == nil {
			interruptE.NodePath = append(prefixes, string(interruptE.NodeKey))
			interruptEvents = append(interruptEvents, interruptE)
		} else if len(interruptE.NestedInterruptInfo) > 0 {
			for index := range interruptE.NestedInterruptInfo {
				indexedPrefixes := append(prefixes, string(interruptE.NodeKey), InterruptEventIndexPrefix+strconv.Itoa(index))
				indexedIEvents, err := extractInterruptEvents(interruptE.NestedInterruptInfo[index], indexedPrefixes...)
				if err != nil {
					return nil, err
				}
				interruptEvents = append(interruptEvents, indexedIEvents...)
			}
		} else if interruptE.SubWorkflowInterruptInfo != nil {
			appendedPrefix := append(prefixes, string(interruptE.NodeKey))
			subWorkflowIEvents, err := extractInterruptEvents(interruptE.SubWorkflowInterruptInfo, appendedPrefix...)
			if err != nil {
				return nil, err
			}
			interruptEvents = append(interruptEvents, subWorkflowIEvents...)
		}
	}

	for graphKey, subGraphInfo := range interruptInfo.SubGraphs {
		newPrefix := append(prefixes, graphKey)
		subInterruptEvents, subErr := extractInterruptEvents(subGraphInfo, newPrefix...)
		if subErr != nil {
			return nil, subErr
		}

		interruptEvents = append(interruptEvents, subInterruptEvents...)
	}

	return interruptEvents, nil
}

func (w *WorkflowHandler) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	if info.Component != compose.ComponentOfWorkflow || (info.Name != strconv.FormatInt(w.getRootWorkflowID(), 10) &&
		info.Name != strconv.FormatInt(w.getSubWorkflowID(), 10)) {
		return ctx
	}

	c := GetExeCtx(ctx)

	interruptInfo, ok := compose.ExtractInterruptInfo(err)
	if ok {
		if w.subWorkflowBasic != nil {
			return ctx
		}

		interruptEvents, err := extractInterruptEvents(interruptInfo)
		if err != nil {
			logs.Errorf("failed to extract interrupt events: %v", err)
			return ctx
		}

		for _, interruptEvent := range interruptEvents {
			logs.CtxInfof(ctx, "emit interrupt event id= %d, eventType= %d, nodeID= %s", interruptEvent.ID,
				interruptEvent.EventType, interruptEvent.NodeKey)
		}

		done := make(chan struct{})

		w.ch <- &Event{
			Type:            WorkflowInterrupt,
			Context:         c,
			InterruptEvents: interruptEvents,
			done:            done,
		}

		<-done

		return ctx
	}

	if errors.Is(err, context.Canceled) {
		e := &Event{
			Type:     WorkflowCancel,
			Context:  c,
			Duration: time.Since(time.UnixMilli(c.StartTime)),
		}

		if c.TokenCollector != nil {
			usage := c.TokenCollector.wait()
			e.Token = &TokenInfo{
				InputToken:  int64(usage.PromptTokens),
				OutputToken: int64(usage.CompletionTokens),
				TotalToken:  int64(usage.TotalTokens),
			}
		}
		w.ch <- e
		return ctx
	}

	logs.CtxErrorf(ctx, "workflow failed: %v", err)

	e := &Event{
		Type:     WorkflowFailed,
		Context:  c,
		Duration: time.Since(time.UnixMilli(c.StartTime)),
		Err:      err,
	}

	if c.TokenCollector != nil {
		usage := c.TokenCollector.wait()
		e.Token = &TokenInfo{
			InputToken:  int64(usage.PromptTokens),
			OutputToken: int64(usage.CompletionTokens),
			TotalToken:  int64(usage.TotalTokens),
		}
	}

	w.ch <- e

	return ctx
}

func (w *WorkflowHandler) OnStartWithStreamInput(ctx context.Context, info *callbacks.RunInfo,
	input *schema.StreamReader[callbacks.CallbackInput],
) context.Context {
	if info.Component != compose.ComponentOfWorkflow || (info.Name != strconv.FormatInt(w.getRootWorkflowID(), 10) &&
		info.Name != strconv.FormatInt(w.getSubWorkflowID(), 10)) {
		input.Close()
		return ctx
	}

	newCtx, resumed := w.initWorkflowCtx(ctx)

	if w.subWorkflowBasic == nil {
		// check if already canceled
		canceled, err := workflow.GetRepository().GetWorkflowCancelFlag(newCtx, w.rootExecuteID)
		if err != nil {
			logs.Errorf("failed to get workflow cancel flag: %v", err)
		}

		if canceled {
			input.Close()
			cancelCtx, cancelFn := context.WithCancel(newCtx)
			cancelFn()
			return cancelCtx
		}
	}

	if resumed {
		input.Close()
		c := GetExeCtx(newCtx)
		w.ch <- &Event{
			Type:    WorkflowResume,
			Context: c,
		}
		return newCtx
	}

	// consumes the stream synchronously because a workflow can only have Invoke or Stream.
	defer input.Close()
	fullInput := make(map[string]any)
	for {
		chunk, e := input.Recv()
		if e != nil {
			if e == io.EOF {
				break
			}
			logs.Errorf("failed to receive stream input: %v", e)
			return newCtx
		}
		fullInput, e = nodes.ConcatTwoMaps(fullInput, chunk.(map[string]any))
		if e != nil {
			logs.Errorf("failed to concat two maps: %v", e)
			return newCtx
		}
	}
	c := GetExeCtx(newCtx)
	w.ch <- &Event{
		Type:      WorkflowStart,
		Context:   c,
		Input:     fullInput,
		nodeCount: w.nodeCount,
	}
	return newCtx
}

func (w *WorkflowHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo,
	output *schema.StreamReader[callbacks.CallbackOutput],
) context.Context {
	if info.Component != compose.ComponentOfWorkflow || (info.Name != strconv.FormatInt(w.getRootWorkflowID(), 10) &&
		info.Name != strconv.FormatInt(w.getSubWorkflowID(), 10)) {
		output.Close()
		return ctx
	}

	safego.Go(ctx, func() {
		defer output.Close()
		fullOutput := make(map[string]any)
		for {
			chunk, e := output.Recv()
			if e != nil {
				if e == io.EOF {
					break
				}

				logs.Errorf("workflow OnEndWithStreamOutput failed to receive stream output: %v", e)
				_ = w.OnError(ctx, info, e)
				return
			}
			fullOutput, e = nodes.ConcatTwoMaps(fullOutput, chunk.(map[string]any))
			if e != nil {
				logs.Errorf("failed to concat two maps: %v", e)
				return
			}
		}

		c := GetExeCtx(ctx)
		e := &Event{
			Type:     WorkflowSuccess,
			Context:  c,
			Duration: time.Since(time.UnixMilli(c.StartTime)),
			Output:   fullOutput,
		}

		if c.TokenCollector != nil {
			usage := c.TokenCollector.wait()
			e.Token = &TokenInfo{
				InputToken:  int64(usage.PromptTokens),
				OutputToken: int64(usage.CompletionTokens),
				TotalToken:  int64(usage.TotalTokens),
			}
		}
		w.ch <- e
	})

	return ctx
}

func (n *NodeHandler) initNodeCtx(ctx context.Context, typ entity.NodeType) (context.Context, bool) {
	var (
		err             error
		newCtx          context.Context
		resume          bool // whether this node is on the resume path
		exactlyResuming bool // whether this node is the exact node resuming
	)

	if len(n.resumePath) == 0 {
		resume = false
	} else {
		c := GetExeCtx(ctx)

		if c == nil {
			panic("nil execute context")
		}

		if c.NodeCtx == nil { // top level node
			resume = n.resumePath[0] == string(n.nodeKey)
			exactlyResuming = resume && len(n.resumePath) == 1
		} else {
			path := slices.Clone(c.NodeCtx.NodePath)
			// immediate inner node under composite node
			if c.BatchInfo != nil && c.BatchInfo.CompositeNodeKey == c.NodeCtx.NodeKey {
				path = append(path, InterruptEventIndexPrefix+strconv.Itoa(c.BatchInfo.Index))
			}
			path = append(path, string(n.nodeKey))

			if len(path) > len(n.resumePath) {
				resume = false
			} else {
				resume = true
				for i := 0; i < len(path); i++ {
					if path[i] != n.resumePath[i] {
						resume = false
						break
					}
				}

				if resume && len(path) == len(n.resumePath) {
					exactlyResuming = true
				}
			}
		}
	}

	if resume {
		newCtx, err = restoreNodeCtx(ctx, n.nodeKey, n.resumeEvent, exactlyResuming)
		if err != nil {
			logs.Errorf("failed to restore node execute context: %v", err)
			return ctx, resume
		}
		var resumeEventID int64
		if c := GetExeCtx(newCtx); c != nil && c.RootCtx.ResumeEvent != nil {
			resumeEventID = c.RootCtx.ResumeEvent.ID
		}
		logs.CtxInfof(ctx, "[restoreNodeCtx] restored nodeKey= %s, root.resumeEventID= %d", n.nodeKey, resumeEventID)
	} else {
		// even if this node is not on the resume path, it could still restore from checkpoint,
		// for example:
		// this workflow has parallel interrupts, this node is one of them(or along the path of one of them),
		// but not resumed this time
		restoredCtx, restored := tryRestoreNodeCtx(ctx, n.nodeKey)
		if restored {
			logs.CtxInfof(ctx, "[tryRestoreNodeCtx] restored, nodeKey= %s", n.nodeKey)
			newCtx = restoredCtx
			return newCtx, true
		}

		newCtx, err = PrepareNodeExeCtx(ctx, n.nodeKey, n.nodeName, typ, n.terminatePlan)
		if err != nil {
			logs.Errorf("failed to prepare node execute context: %v", err)
			return ctx, resume
		}
	}

	return newCtx, resume
}

func (n *NodeHandler) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	if info.Component != compose.ComponentOfLambda || info.Name != string(n.nodeKey) {
		return ctx
	}

	newCtx, resumed := n.initNodeCtx(ctx, entity.NodeType(info.Type))

	if resumed {
		return newCtx
	}

	c := GetExeCtx(newCtx)

	if c == nil {
		panic("nil node context")
	}

	var responseExtra map[string]any

	inputMap, ok := input.(map[string]any)
	if !ok {
		sInput, ok := input.(*nodes.StructuredCallbackInput)
		if !ok {
			panic(fmt.Errorf("unexpected callback input  type: %T", input))
		}

		inputMap = sInput.Input
		responseExtra = sInput.Extra
	}

	e := &Event{
		Type:    NodeStart,
		Context: c,
		Input:   inputMap,
		extra:   &entity.NodeExtra{},
	}

	if c.SubWorkflowCtx == nil {
		e.extra.CurrentSubExecuteID = c.RootExecuteID
	} else {
		e.extra.CurrentSubExecuteID = c.SubExecuteID
	}

	if responseExtra != nil {
		e.extra.ResponseExtra = responseExtra
	}

	n.ch <- e

	return newCtx
}

func (n *NodeHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	if info.Component != compose.ComponentOfLambda || info.Name != string(n.nodeKey) {
		return ctx
	}

	var (
		outputMap, customExtra, input map[string]any
		errInfo                       vo.WorkflowError
		ok                            bool
		answer, outputStr, rawOutput  *string
	)

	outputMap, ok = output.(map[string]any)
	if !ok {
		structuredOutput, ok := output.(*nodes.StructuredCallbackOutput)
		if !ok {
			return ctx
		}
		outputMap = structuredOutput.Output
		rawOutput = structuredOutput.RawOutput
		customExtra = structuredOutput.Extra
		errInfo = structuredOutput.Error
		input = structuredOutput.Input
		answer = structuredOutput.Answer
		outputStr = structuredOutput.OutputStr
	}

	c := GetExeCtx(ctx)
	startTime := time.UnixMilli(c.StartTime)
	duration := time.Since(startTime)
	_ = duration
	e := &Event{
		Type:      NodeEnd,
		Context:   c,
		Duration:  time.Since(time.UnixMilli(c.StartTime)),
		Output:    outputMap,
		RawOutput: rawOutput,
		Err:       errInfo,
		extra:     &entity.NodeExtra{},
	}

	if c.TokenCollector != nil && entity.NodeMetaByNodeType(c.NodeType).MayUseChatModel {
		usage := c.TokenCollector.wait()
		e.Token = &TokenInfo{
			InputToken:  int64(usage.PromptTokens),
			OutputToken: int64(usage.CompletionTokens),
			TotalToken:  int64(usage.TotalTokens),
		}
	}

	if answer != nil {
		e.Answer = nodes.TrimKeyFinishedMarker(*answer)
	}

	if outputStr != nil {
		e.outputStr = ptr.Of(nodes.TrimKeyFinishedMarker(*outputStr))
	}

	if len(customExtra) > 0 {
		if e.extra.ResponseExtra == nil {
			e.extra.ResponseExtra = map[string]any{}
		}

		for k := range customExtra {
			e.extra.ResponseExtra[k] = customExtra[k]
		}
	}

	if c.SubWorkflowCtx == nil {
		e.extra.CurrentSubExecuteID = c.RootExecuteID
	} else {
		e.extra.CurrentSubExecuteID = c.SubExecuteID
	}

	if input != nil {
		e.Input = input
	}

	n.ch <- e

	return ctx
}

func (n *NodeHandler) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	if info.Component != compose.ComponentOfLambda || info.Name != string(n.nodeKey) {
		return ctx
	}

	c := GetExeCtx(ctx)

	if _, ok := compose.IsInterruptRerunError(err); ok { // current node interrupts
		if err := compose.ProcessState[ExeContextStore](ctx, func(ctx context.Context, state ExeContextStore) error {
			if state == nil {
				return errors.New("state is nil")
			}

			logs.CtxInfof(ctx, "[SetNodeCtx] nodeKey= %s", n.nodeKey)
			return state.SetNodeCtx(n.nodeKey, c)
		}); err != nil {
			logs.Errorf("failed to process state: %v", err)
		}

		return ctx
	}

	if errors.Is(err, context.Canceled) {
		if c == nil || c.NodeCtx == nil {
			return ctx
		}

		e := &Event{
			Type:     NodeError,
			Context:  c,
			Duration: time.Since(time.UnixMilli(c.StartTime)),
			Err:      err,
		}

		if c.TokenCollector != nil {
			usage := c.TokenCollector.wait()
			e.Token = &TokenInfo{
				InputToken:  int64(usage.PromptTokens),
				OutputToken: int64(usage.CompletionTokens),
				TotalToken:  int64(usage.TotalTokens),
			}
		}
		n.ch <- e
		return ctx
	}

	e := &Event{
		Type:     NodeError,
		Context:  c,
		Duration: time.Since(time.UnixMilli(c.StartTime)),
		Err:      err,
	}

	if c.TokenCollector != nil {
		usage := c.TokenCollector.wait()
		e.Token = &TokenInfo{
			InputToken:  int64(usage.PromptTokens),
			OutputToken: int64(usage.CompletionTokens),
			TotalToken:  int64(usage.TotalTokens),
		}
	}

	n.ch <- e

	return ctx
}

func (n *NodeHandler) OnStartWithStreamInput(ctx context.Context, info *callbacks.RunInfo, input *schema.StreamReader[callbacks.CallbackInput]) context.Context {
	if info.Component != compose.ComponentOfLambda || info.Name != string(n.nodeKey) {
		input.Close()
		return ctx
	}

	newCtx, resumed := n.initNodeCtx(ctx, entity.NodeType(info.Type))

	if resumed {
		input.Close()
		return newCtx
	}

	c := GetExeCtx(newCtx)
	if c == nil {
		panic("nil node context")
	}

	e := &Event{
		Type:    NodeStart,
		Context: c,
	}
	n.ch <- e

	safego.Go(ctx, func() {
		defer input.Close()
		var (
			inputList  []map[string]any
			sInputList []*nodes.StructuredCallbackInput
			first      bool
		)

		for {
			chunk, e := input.Recv()
			if e != nil {
				if e == io.EOF {
					break
				}

				logs.Errorf("node OnStartWithStreamInput failed to receive stream output: %v", e)
				_ = n.OnError(newCtx, info, e)
				return
			}

			inputMap, ok := chunk.(map[string]any)
			if ok {
				inputList = append(inputList, inputMap)
			} else {
				sInput, ok := chunk.(*nodes.StructuredCallbackInput)
				if !ok {
					panic(fmt.Errorf("wrong callback input type: %T", chunk))
				}

				sInputList = append(sInputList, sInput)
			}

			if !first {
				first = true
				if len(sInputList) > 0 {
					e := &Event{
						Type:    NodeStreamingInput,
						Context: c,
						Input:   sInputList[0].Input,
					}

					if sInputList[0].Extra != nil {
						e.extra = &entity.NodeExtra{
							ResponseExtra: sInputList[0].Extra,
						}
					}

					n.ch <- e
				} else {
					n.ch <- &Event{
						Type:    NodeStreamingInput,
						Context: c,
						Input:   inputList[0],
					}
				}
			}
		}

		if len(sInputList) > 0 {
			sInput, err := nodes.ConcatStructuredCallbackInputs(sInputList)
			if err != nil {
				_ = n.OnError(newCtx, info, err)
				return
			}

			e := &Event{
				Type:    NodeStreamingInput,
				Context: c,
				Input:   sInput.Input,
			}

			if sInput.Extra != nil {
				e.extra = &entity.NodeExtra{
					ResponseExtra: sInput.Extra,
				}
			}

			n.ch <- e
		} else {
			inputR, err := nodes.ConcatMaps(reflect.ValueOf(inputList))
			if err != nil {
				_ = n.OnError(newCtx, info, err)
				return
			}

			n.ch <- &Event{
				Type:    NodeStreamingInput,
				Context: c,
				Input:   inputR.Interface().(map[string]any),
			}
		}
	})

	return newCtx
}

func buildStreamEndEvent(c *Context, mapChunks []map[string]any,
	structuredChunks []*nodes.StructuredCallbackOutput) (*Event, error) {
	var (
		tokenInfo *TokenInfo
		extra     = &entity.NodeExtra{}
		err       error
	)

	if c.TokenCollector != nil && entity.NodeMetaByNodeType(c.NodeType).MayUseChatModel {
		usage := c.TokenCollector.wait()
		tokenInfo = &TokenInfo{
			InputToken:  int64(usage.PromptTokens),
			OutputToken: int64(usage.CompletionTokens),
			TotalToken:  int64(usage.TotalTokens),
		}
	}

	if c.SubWorkflowCtx == nil {
		extra.CurrentSubExecuteID = c.RootExecuteID
	} else {
		extra.CurrentSubExecuteID = c.SubExecuteID
	}

	if len(mapChunks) > 0 {
		var outputMap map[string]any
		if len(mapChunks) == 1 {
			outputMap = mapChunks[0]
		} else {
			m, err := nodes.ConcatMaps(reflect.ValueOf(mapChunks))
			if err != nil {
				return nil, err
			}
			outputMap = m.Interface().(map[string]any)
		}

		e := &Event{
			Type:     NodeEndStreaming,
			Context:  c,
			Output:   outputMap,
			Duration: time.Since(time.UnixMilli(c.StartTime)),
			Token:    tokenInfo,
			extra:    extra,
		}

		return e, nil
	}

	var fullStructuredOutput *nodes.StructuredCallbackOutput
	if len(structuredChunks) == 1 {
		fullStructuredOutput = structuredChunks[0]
	} else {
		fullStructuredOutput, err = nodes.ConcatStructuredCallbackOutputs(structuredChunks)
		if err != nil {
			return nil, err
		}
	}

	e := &Event{
		Type:      NodeEndStreaming,
		Context:   c,
		Output:    fullStructuredOutput.Output,
		RawOutput: fullStructuredOutput.RawOutput,
		Duration:  time.Since(time.UnixMilli(c.StartTime)),
		Token:     tokenInfo,
		Err:       fullStructuredOutput.Error,
	}

	extra.ResponseExtra = fullStructuredOutput.Extra
	e.extra = extra

	if fullStructuredOutput.Answer != nil {
		e.Answer = nodes.TrimKeyFinishedMarker(*fullStructuredOutput.Answer)
	}

	if fullStructuredOutput.OutputStr != nil {
		e.outputStr = ptr.Of(nodes.TrimKeyFinishedMarker(*fullStructuredOutput.OutputStr))
	}

	return e, nil
}

func buildStreamDeltaEvent(c *Context, chunk any, accumulated *nodes.StructuredCallbackOutput) (
	delta *Event, newAccumulated *nodes.StructuredCallbackOutput, err error) {
	mapChunk, ok := chunk.(map[string]any)
	if ok {
		fullOutput := mapChunk
		if accumulated != nil {
			if fullOutput, err = nodes.ConcatTwoMaps(fullOutput, accumulated.Output); err != nil {
				return nil, nil, err
			}
		}

		return &Event{
				Type:    NodeStreamingOutput,
				Context: c,
				Output:  fullOutput,
			}, &nodes.StructuredCallbackOutput{
				Output: fullOutput,
			}, nil
	}

	structuredChunk, ok := chunk.(*nodes.StructuredCallbackOutput)
	if !ok {
		return nil, nil, fmt.Errorf("expect map[string]any or "+
			"StructuredCallbackOutput, got %T", chunk)
	}

	if accumulated == nil {
		newAccumulated = structuredChunk
	} else {
		// the streaming delta event should only merge the Output / OutputStr,
		// discard the raw output, and use the answer of the current chunk
		newAccumulated, err = nodes.ConcatStructuredCallbackOutputs([]*nodes.StructuredCallbackOutput{
			accumulated, structuredChunk,
		})
		if err != nil {
			return nil, nil, err
		}
	}

	delta = &Event{
		Type:    NodeStreamingOutput,
		Context: c,
		Output:  newAccumulated.Output,
	}

	if structuredChunk.Answer != nil {
		delta.Answer = nodes.TrimKeyFinishedMarker(*structuredChunk.Answer)
	}

	if newAccumulated.OutputStr != nil {
		delta.outputStr = ptr.Of(nodes.TrimKeyFinishedMarker(*newAccumulated.OutputStr))
	}

	return delta, newAccumulated, nil
}

func (n *NodeHandler) nonIncrementalEndProcessor(c *Context,
	output *schema.StreamReader[callbacks.CallbackOutput]) error {
	defer output.Close()

	var (
		mapChunks        []map[string]any
		structuredChunks []*nodes.StructuredCallbackOutput
	)
	for {
		chunk, e := output.Recv()
		if e != nil {
			if e == io.EOF {
				break
			}

			return e
		}

		if m, ok := chunk.(map[string]any); ok {
			mapChunks = append(mapChunks, m)
		} else if s, ok := chunk.(*nodes.StructuredCallbackOutput); ok {
			structuredChunks = append(structuredChunks, s)
		}
	}

	e, err := buildStreamEndEvent(c, mapChunks, structuredChunks)
	if err != nil {
		return err
	}

	n.ch <- e
	return nil
}

func (n *NodeHandler) incrementalEndProcessor(c *Context,
	output *schema.StreamReader[callbacks.CallbackOutput]) error {
	defer output.Close()
	var (
		firstEvent, previousEvent, secondPreviousEvent *Event
		accumulated                                    = &nodes.StructuredCallbackOutput{}
	)
	for {
		chunk, err := output.Recv()
		if err != nil {
			if err == io.EOF {
				if previousEvent != nil {
					previousEmpty := len(previousEvent.Answer) == 0
					if previousEmpty { // concat the empty previous chunk with the second previous chunk
						if secondPreviousEvent != nil {
							secondPreviousEvent.StreamEnd = true
							n.ch <- secondPreviousEvent
						} else {
							previousEvent.StreamEnd = true
							n.ch <- previousEvent
						}
					} else {
						if secondPreviousEvent != nil {
							n.ch <- secondPreviousEvent
						}

						previousEvent.StreamEnd = true
						n.ch <- previousEvent
					}
				} else { // only sent first event, or no event at all
					n.ch <- &Event{
						Type:      NodeStreamingOutput,
						Context:   c,
						Output:    accumulated.Output,
						outputStr: accumulated.OutputStr,
						StreamEnd: true,
					}
				}
				break
			}
			return err
		}

		if secondPreviousEvent != nil {
			n.ch <- secondPreviousEvent
		}

		if previousEvent != nil {
			secondPreviousEvent = previousEvent
		}

		previousEvent, accumulated, err = buildStreamDeltaEvent(c, chunk, accumulated)
		if err != nil {
			return err
		}

		if firstEvent == nil { // prioritize sending the first event asap.
			firstEvent = previousEvent
			n.ch <- firstEvent
			previousEvent = nil
		}
	}

	e, err := buildStreamEndEvent(c, nil, []*nodes.StructuredCallbackOutput{accumulated})
	if err != nil {
		return err
	}
	n.ch <- e

	return nil
}

func (n *NodeHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo, output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
	if info.Component != compose.ComponentOfLambda || info.Name != string(n.nodeKey) {
		output.Close()
		return ctx
	}

	c := GetExeCtx(ctx)

	nodeMeta := entity.NodeMetaByNodeType(c.NodeType)
	if nodeMeta.IncrementalOutput {
		if nodeMeta.BlockEndStream {
			if err := n.incrementalEndProcessor(c, output); err != nil {
				_ = n.OnError(ctx, info, err)
				return ctx
			}
		} else {
			safego.Go(ctx, func() {
				err := n.incrementalEndProcessor(c, output)
				if err != nil {
					_ = n.OnError(ctx, info, err)
					return
				}
			})
		}
	} else {
		if nodeMeta.BlockEndStream {
			if err := n.nonIncrementalEndProcessor(c, output); err != nil {
				_ = n.OnError(ctx, info, err)
				return ctx
			}
		} else {
			safego.Go(ctx, func() {
				if err := n.nonIncrementalEndProcessor(c, output); err != nil {
					_ = n.OnError(ctx, info, err)
					return
				}
			})
		}
	}

	return ctx
}

const (
	ToolCallIDKey     = "call_id"
	ToolFinishChanKey = "tool_finish_chan"
)

func (t *ToolHandler) OnStart(ctx context.Context, info *callbacks.RunInfo,
	input *tool.CallbackInput,
) context.Context {
	if info.Name != t.info.Name {
		return ctx
	}

	var args map[string]any
	if input.ArgumentsInJSON != "" {
		if err := sonic.UnmarshalString(input.ArgumentsInJSON, &args); err != nil {
			logs.Errorf("failed to unmarshal arguments: %v", err)
			return ctx
		}
	}

	var (
		callID         string
		toolFinishChan chan struct{}
	)
	if input.Extra != nil {
		callIDAny, ok := input.Extra[ToolCallIDKey]
		if ok {
			callID = callIDAny.(string)
		}
		toolFinishChanAny, ok := input.Extra[ToolFinishChanKey]
		if ok {
			toolFinishChan = toolFinishChanAny.(chan struct{})
		}
	}

	if len(callID) == 0 {
		callID = compose.GetToolCallID(ctx)
	}

	t.ch <- &Event{
		Type:    FunctionCall,
		Context: GetExeCtx(ctx),
		functionCall: &FunctionCallInfo{
			FunctionCallInfo: &entity.FunctionCallInfo{
				FunctionInfo: t.info,
				CallID:       callID,
				Arguments:    args,
			},
			toolFinishChan: toolFinishChan,
		},
	}

	return ctx
}

func (t *ToolHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo,
	output *tool.CallbackOutput,
) context.Context {
	if info.Name != t.info.Name {
		return ctx
	}

	var callID string
	if output.Extra != nil {
		callIDAny, ok := output.Extra[ToolCallIDKey]
		if ok {
			callID = callIDAny.(string)
		}
	}

	if len(callID) == 0 {
		callID = compose.GetToolCallID(ctx)
	}

	t.ch <- &Event{
		Type:    ToolResponse,
		Context: GetExeCtx(ctx),
		toolResponse: &entity.ToolResponseInfo{
			FunctionInfo: t.info,
			CallID:       callID,
			Response:     output.Response,
		},
	}

	return ctx
}

func (t *ToolHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo,
	output *schema.StreamReader[*tool.CallbackOutput],
) context.Context {
	if info.Name != t.info.Name {
		output.Close()
		return ctx
	}

	safego.Go(ctx, func() {
		c := GetExeCtx(ctx)
		defer output.Close()
		var (
			firstEvent, previousEvent *Event
			fullResponse              string
			callID                    = compose.GetToolCallID(ctx)
		)

		for {
			chunk, e := output.Recv()
			if e != nil {
				if e == io.EOF {
					if previousEvent != nil {
						previousEvent.StreamEnd = true
						t.ch <- previousEvent
					} else {
						t.ch <- &Event{
							Type:      ToolStreamingResponse,
							Context:   c,
							StreamEnd: true,
							toolResponse: &entity.ToolResponseInfo{
								FunctionInfo: t.info,
								CallID:       callID,
							},
						}
					}
					break
				}
				logs.Errorf("tool OnEndWithStreamOutput failed to receive stream output: %v", e)
				_ = t.OnError(ctx, info, e)
				return
			}

			fullResponse += chunk.Response

			if previousEvent != nil {
				t.ch <- previousEvent
			}

			deltaEvent := &Event{
				Type:    ToolStreamingResponse,
				Context: c,
				toolResponse: &entity.ToolResponseInfo{
					FunctionInfo: t.info,
					CallID:       callID,
					Response:     chunk.Response,
				},
			}

			if firstEvent == nil {
				firstEvent = deltaEvent
				t.ch <- firstEvent
			} else {
				previousEvent = deltaEvent
			}
		}
	})

	return ctx
}

func (t *ToolHandler) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	if info.Name != t.info.Name {
		return ctx
	}
	t.ch <- &Event{
		Type:    ToolError,
		Context: GetExeCtx(ctx),
		functionCall: &FunctionCallInfo{
			FunctionCallInfo: &entity.FunctionCallInfo{
				FunctionInfo: t.info,
				CallID:       compose.GetToolCallID(ctx),
			},
		},
		Err: err,
	}
	return ctx
}
