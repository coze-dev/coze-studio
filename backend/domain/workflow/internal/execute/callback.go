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
	"strings"
	"time"

	"github.com/coze-dev/coze-studio/backend/pkg/sonic"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	callbacks2 "github.com/cloudwego/eino/utils/callbacks"

	workflow2 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
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
	exeCfg             vo.ExecuteConfig
	rootTokenCollector *TokenCollector
}

type ToolHandler struct {
	ch   chan<- *Event
	info entity.FunctionInfo
}

func NewRootWorkflowHandler(wb *entity.WorkflowBasic, executeID int64, requireCheckpoint bool,
	ch chan<- *Event, resumedEvent *entity.InterruptEvent, exeCfg vo.ExecuteConfig, nodeCount int32,
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
		Type:      WorkflowSuccess,
		Context:   c,
		Output:    output.(map[string]any),
		RawOutput: output.(map[string]any),
		Duration:  time.Since(time.UnixMilli(c.StartTime)),
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
	ieStore, ok := interruptInfo.State.(nodes.InterruptEventStore)
	if !ok {
		return nil, errors.New("failed to extract interrupt event store from interrupt info")
	}

	for _, nodeKey := range interruptInfo.RerunNodes {
		interruptE, ok, err := ieStore.GetInterruptEvent(vo.NodeKey(nodeKey))
		if err != nil {
			logs.Errorf("failed to extract interrupt event from node key: %v", err)
			continue
		}

		if !ok {
			extra := interruptInfo.RerunNodesExtra[nodeKey]
			if extra == nil {
				continue
			}
			interruptE, ok = extra.(*entity.InterruptEvent)
			if !ok {
				logs.Errorf("failed to extract tool interrupt event from node key: %v", err)
				continue
			}
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

				if _, ok := schema.GetSourceName(e); ok {
					continue
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

	e := &Event{
		Type:    NodeStart,
		Context: c,
		Input:   input.(map[string]any),
		extra:   &entity.NodeExtra{},
	}

	if c.SubWorkflowCtx == nil {
		e.extra.CurrentSubExecuteID = c.RootExecuteID
	} else {
		e.extra.CurrentSubExecuteID = c.SubExecuteID
	}

	n.ch <- e

	return newCtx
}

func (n *NodeHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	if info.Component != compose.ComponentOfLambda || info.Name != string(n.nodeKey) {
		return ctx
	}

	var (
		outputMap, rawOutputMap, customExtra map[string]any
		errInfo                              vo.WorkflowError
		ok                                   bool
	)

	outputMap, ok = output.(map[string]any)
	if ok {
		rawOutputMap = outputMap
	} else {
		structuredOutput, ok := output.(*nodes.StructuredCallbackOutput)
		if !ok {
			return ctx
		}
		outputMap = structuredOutput.Output
		rawOutputMap = structuredOutput.RawOutput
		customExtra = structuredOutput.Extra
		errInfo = structuredOutput.Error
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
		RawOutput: rawOutputMap,
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

	if c.NodeType == entity.NodeTypeOutputEmitter {
		e.Answer = output.(map[string]any)["output"].(string)
	} else if c.NodeType == entity.NodeTypeExit && *c.TerminatePlan == vo.UseAnswerContent {
		e.Answer = output.(map[string]any)["output"].(string)
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

	switch t := entity.NodeType(info.Type); t {
	case entity.NodeTypeExit:
		terminatePlan := n.terminatePlan
		if terminatePlan == nil {
			terminatePlan = ptr.Of(vo.ReturnVariables)
		}
		if *terminatePlan == vo.UseAnswerContent {
			e.extra = &entity.NodeExtra{
				ResponseExtra: map[string]any{
					"terminal_plan": workflow2.TerminatePlanType_USESETTING,
				},
			}
			e.outputExtractor = func(o map[string]any) string {
				str, ok := o["output"].(string)
				if ok {
					return str
				}
				return fmt.Sprint(o["output"])
			}
		}
	case entity.NodeTypeOutputEmitter:
		e.outputExtractor = func(o map[string]any) string {
			str, ok := o["output"].(string)
			if ok {
				return str
			}
			return fmt.Sprint(o["output"])
		}
	case entity.NodeTypeInputReceiver:
		e.Input = outputMap
	default:
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

	// currently Exit, OutputEmitter can potentially trigger this.
	// VariableAggregator can also potentially trigger this.
	// we may receive nodes.KeyIsFinished from the stream, which should be discarded when concatenating the map.
	if info.Type != string(entity.NodeTypeExit) &&
		info.Type != string(entity.NodeTypeOutputEmitter) &&
		info.Type != string(entity.NodeTypeVariableAggregator) {
		panic(fmt.Sprintf("impossible, node type= %s", info.Type))
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
	if entity.NodeType(info.Type) == entity.NodeTypeExit {
		terminatePlan := n.terminatePlan
		if terminatePlan == nil {
			terminatePlan = ptr.Of(vo.ReturnVariables)
		}
		if *terminatePlan == vo.UseAnswerContent {
			e.extra = &entity.NodeExtra{
				ResponseExtra: map[string]any{
					"terminal_plan": workflow2.TerminatePlanType_USESETTING,
				},
			}
		}
	}
	n.ch <- e

	safego.Go(ctx, func() {
		defer input.Close()
		fullInput := make(map[string]any)
		var previous map[string]any
		for {
			chunk, e := input.Recv()
			if e != nil {
				if e == io.EOF {
					break
				}

				if _, ok := schema.GetSourceName(e); ok {
					continue
				}

				logs.Errorf("node OnStartWithStreamInput failed to receive stream output: %v", e)
				_ = n.OnError(newCtx, info, e)
				return
			}
			previous = fullInput
			fullInput, e = nodes.ConcatTwoMaps(fullInput, chunk.(map[string]any))
			if e != nil {
				logs.Errorf("failed to concat two maps: %v", e)
				return
			}

			if info.Type == string(entity.NodeTypeVariableAggregator) {
				if !reflect.DeepEqual(fullInput, previous) {
					n.ch <- &Event{
						Type:    NodeStreamingInput,
						Context: c,
						Input:   fullInput,
					}
				}
			}
		}
		n.ch <- &Event{
			Type:    NodeStreamingInput,
			Context: c,
			Input:   fullInput,
		}
	})

	return newCtx
}

func (n *NodeHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo, output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
	if info.Component != compose.ComponentOfLambda || info.Name != string(n.nodeKey) {
		output.Close()
		return ctx
	}

	c := GetExeCtx(ctx)

	switch t := entity.NodeType(info.Type); t {
	case entity.NodeTypeLLM:
		safego.Go(ctx, func() {
			defer output.Close()
			fullOutput := make(map[string]any)
			fullRawOutput := make(map[string]any)
			var warning error
			for {
				chunk, e := output.Recv()
				if e != nil {
					if e == io.EOF {
						break
					}

					logs.Errorf("node OnEndWithStreamOutput failed to receive stream output: %v", e)
					_ = n.OnError(ctx, info, e)
					return
				}
				so := chunk.(*nodes.StructuredCallbackOutput)
				fullOutput, e = nodes.ConcatTwoMaps(fullOutput, so.Output)
				if e != nil {
					logs.Errorf("failed to concat two maps: %v", e)
					_ = n.OnError(ctx, info, e)
					return
				}

				fullRawOutput, e = nodes.ConcatTwoMaps(fullRawOutput, so.RawOutput)
				if e != nil {
					logs.Errorf("failed to concat two maps: %v", e)
					_ = n.OnError(ctx, info, e)
					return
				}

				if so.Error != nil {
					warning = so.Error
				}
			}

			e := &Event{
				Type:      NodeEndStreaming,
				Context:   c,
				Output:    fullOutput,
				RawOutput: fullRawOutput,
				Duration:  time.Since(time.UnixMilli(c.StartTime)),
				Err:       warning,
				extra:     &entity.NodeExtra{},
			}

			if c.TokenCollector != nil {
				usage := c.TokenCollector.wait()
				e.Token = &TokenInfo{
					InputToken:  int64(usage.PromptTokens),
					OutputToken: int64(usage.CompletionTokens),
					TotalToken:  int64(usage.TotalTokens),
				}
			}

			if c.SubWorkflowCtx == nil {
				e.extra.CurrentSubExecuteID = c.RootExecuteID
			} else {
				e.extra.CurrentSubExecuteID = c.SubExecuteID
			}

			// TODO: hard-coded string
			if _, ok := fullOutput["output"]; ok {
				if len(fullOutput) == 1 {
					e.outputExtractor = func(o map[string]any) string {
						if o["output"] == nil {
							return ""
						}
						return o["output"].(string)
					}
				} else if len(fullOutput) == 2 {
					if reasoning, ok := fullOutput["reasoning_content"]; ok {
						e.outputExtractor = func(o map[string]any) string {
							if o["output"] == nil {
								return ""
							}
							return o["output"].(string)
						}

						if reasoning != nil {
							e.extra.ResponseExtra = map[string]any{
								"reasoning_content": fullOutput["reasoning_content"].(string),
							}
						}
					}
				}
			}

			n.ch <- e
		})
	case entity.NodeTypeVariableAggregator:
		safego.Go(ctx, func() {
			defer output.Close()

			extra := &entity.NodeExtra{}
			if c.SubWorkflowCtx == nil {
				extra.CurrentSubExecuteID = c.RootExecuteID
			} else {
				extra.CurrentSubExecuteID = c.SubExecuteID
			}

			extra.ResponseExtra = make(map[string]any)

			fullOutput := &nodes.StructuredCallbackOutput{
				Output:    make(map[string]any),
				RawOutput: make(map[string]any),
			}
			var (
				previous *nodes.StructuredCallbackOutput
				first    = true
			)
			for {
				chunk, e := output.Recv()
				if e != nil {
					if e == io.EOF {
						break
					}

					logs.Errorf("node OnEndWithStreamOutput failed to receive stream output: %v", e)
					_ = n.OnError(ctx, info, e)
					return
				}
				previous = fullOutput

				fullOutputMap, e := nodes.ConcatTwoMaps(fullOutput.Output, chunk.(*nodes.StructuredCallbackOutput).Output)
				if e != nil {
					logs.Errorf("failed to concat two maps: %v", e)
					_ = n.OnError(ctx, info, e)
					return
				}

				fullRawOutput, e := nodes.ConcatTwoMaps(fullOutput.RawOutput, chunk.(*nodes.StructuredCallbackOutput).RawOutput)
				if e != nil {
					logs.Errorf("failed to concat two maps: %v", e)
					_ = n.OnError(ctx, info, e)
					return
				}

				if first {
					extra.ResponseExtra = chunk.(*nodes.StructuredCallbackOutput).Extra
				}

				fullOutput = &nodes.StructuredCallbackOutput{
					Output:    fullOutputMap,
					RawOutput: fullRawOutput,
				}

				if !reflect.DeepEqual(fullOutput, previous) {
					deltaEvent := &Event{
						Type:      NodeStreamingOutput,
						Context:   c,
						Output:    fullOutput.Output,
						RawOutput: fullOutput.RawOutput,
					}
					if first {
						deltaEvent.extra = extra
						first = false
					}
					n.ch <- deltaEvent
				}
			}

			e := &Event{
				Type:      NodeEndStreaming,
				Context:   c,
				Output:    fullOutput.Output,
				RawOutput: fullOutput.RawOutput,
				Duration:  time.Since(time.UnixMilli(c.StartTime)),
			}

			n.ch <- e
		})
	case entity.NodeTypeExit, entity.NodeTypeOutputEmitter, entity.NodeTypeSubWorkflow:
		consumer := func(ctx context.Context) context.Context {
			defer output.Close()
			fullOutput := make(map[string]any)
			var firstEvent, previousEvent, secondPreviousEvent *Event
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
								Output:    fullOutput,
								StreamEnd: true,
							}
						}
						break
					}
					if _, ok := schema.GetSourceName(err); ok {
						continue
					}
					logs.Errorf("node OnEndWithStreamOutput failed to receive stream output: %v", err)
					return n.OnError(ctx, info, err)
				}

				if secondPreviousEvent != nil {
					n.ch <- secondPreviousEvent
				}

				fullOutput, err = nodes.ConcatTwoMaps(fullOutput, chunk.(map[string]any))
				if err != nil {
					logs.Errorf("failed to concat two maps: %v", err)
					return n.OnError(ctx, info, err)
				}

				deltaEvent := &Event{
					Type:    NodeStreamingOutput,
					Context: c,
					Output:  fullOutput,
				}

				if delta, ok := chunk.(map[string]any)["output"]; ok {
					if entity.NodeType(info.Type) == entity.NodeTypeOutputEmitter {
						deltaEvent.Answer = strings.TrimSuffix(delta.(string), nodes.KeyIsFinished)
						deltaEvent.outputExtractor = func(o map[string]any) string {
							str, ok := o["output"].(string)
							if ok {
								return str
							}
							return fmt.Sprint(o["output"])
						}
					} else if n.terminatePlan != nil && *n.terminatePlan == vo.UseAnswerContent {
						deltaEvent.Answer = strings.TrimSuffix(delta.(string), nodes.KeyIsFinished)
						deltaEvent.outputExtractor = func(o map[string]any) string {
							str, ok := o["output"].(string)
							if ok {
								return str
							}
							return fmt.Sprint(o["output"])
						}
					}
				}

				if firstEvent == nil { // prioritize sending the first event asap.
					firstEvent = deltaEvent
					n.ch <- firstEvent
				} else {
					secondPreviousEvent = previousEvent
					previousEvent = deltaEvent
				}
			}

			e := &Event{
				Type:      NodeEndStreaming,
				Context:   c,
				Output:    fullOutput,
				RawOutput: fullOutput,
				Duration:  time.Since(time.UnixMilli(c.StartTime)),
				extra:     &entity.NodeExtra{},
			}

			if answer, ok := fullOutput["output"]; ok {
				if entity.NodeType(info.Type) == entity.NodeTypeOutputEmitter {
					e.Answer = answer.(string)
					e.outputExtractor = func(o map[string]any) string {
						str, ok := o["output"].(string)
						if ok {
							return str
						}
						return fmt.Sprint(o["output"])
					}
				} else if n.terminatePlan != nil && *n.terminatePlan == vo.UseAnswerContent {
					e.Answer = answer.(string)
					e.outputExtractor = func(o map[string]any) string {
						str, ok := o["output"].(string)
						if ok {
							return str
						}
						return fmt.Sprint(o["output"])
					}
				}
			}

			if c.SubWorkflowCtx == nil {
				e.extra.CurrentSubExecuteID = c.RootExecuteID
			} else {
				e.extra.CurrentSubExecuteID = c.SubExecuteID
			}

			if t == entity.NodeTypeExit {
				terminatePlan := n.terminatePlan
				if terminatePlan == nil {
					terminatePlan = ptr.Of(vo.ReturnVariables)
				}
				if *terminatePlan == vo.UseAnswerContent {
					e.extra.ResponseExtra = map[string]any{
						"terminal_plan": workflow2.TerminatePlanType_USESETTING,
					}
				}
			}

			n.ch <- e

			return ctx
		}

		if c.NodeType == entity.NodeTypeExit {
			go consumer(ctx) // handles Exit node asynchronously to keep the typewriter effect for workflow tool returning directly
			return ctx
		} else if c.NodeType == entity.NodeTypeOutputEmitter || c.NodeType == entity.NodeTypeSubWorkflow {
			return consumer(ctx)
		}
	default:
		panic(fmt.Sprintf("impossible, node type= %s", info.Type))
	}

	return ctx
}

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

	t.ch <- &Event{
		Type:    FunctionCall,
		Context: GetExeCtx(ctx),
		functionCall: &entity.FunctionCallInfo{
			FunctionInfo: t.info,
			CallID:       compose.GetToolCallID(ctx),
			Arguments:    args,
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

	t.ch <- &Event{
		Type:    ToolResponse,
		Context: GetExeCtx(ctx),
		toolResponse: &entity.ToolResponseInfo{
			FunctionInfo: t.info,
			CallID:       compose.GetToolCallID(ctx),
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
					CallID:       compose.GetToolCallID(ctx),
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
		functionCall: &entity.FunctionCallInfo{
			FunctionInfo: t.info,
			CallID:       compose.GetToolCallID(ctx),
		},
		Err: err,
	}
	return ctx
}
