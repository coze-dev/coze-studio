package execute

import (
	"context"
	"errors"
	"fmt"
	"io"
	"strconv"
	"time"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"golang.org/x/exp/maps"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type NodeHandler struct {
	nodeKey vo.NodeKey
	ch      chan<- *Event
	resume  bool
}

type workflowHandler struct {
	ch                chan<- *Event
	workflowID        int64
	spaceID           int64
	rootExecuteID     int64
	subWorkflowID     int64
	nodeCount         int32
	resume            bool
	requireCheckpoint bool
	version           string
	projectID         *int64
}

func NewWorkflowHandler(workflowID int64, ch chan<- *Event) callbacks.Handler {
	return &workflowHandler{
		ch:         ch,
		workflowID: workflowID,
	}
}

func NewRootWorkflowHandler(workflowID, spaceID, executeID int64, nodeCount int32, resume, requireCheckpoint bool,
	version string, projectID *int64, ch chan<- *Event) callbacks.Handler {
	return &workflowHandler{
		ch:                ch,
		workflowID:        workflowID,
		spaceID:           spaceID,
		rootExecuteID:     executeID,
		nodeCount:         nodeCount,
		resume:            resume,
		requireCheckpoint: requireCheckpoint,
		version:           version,
		projectID:         projectID,
	}
}

func NewNodeHandler(key string, ch chan<- *Event) callbacks.Handler {
	return &NodeHandler{
		nodeKey: vo.NodeKey(key),
		ch:      ch,
	}
}

func NewNodeResumeHandler(key string, ch chan<- *Event) callbacks.Handler {
	return &NodeHandler{
		nodeKey: vo.NodeKey(key),
		ch:      ch,
		resume:  true,
	}
}

func (w *workflowHandler) initWorkflowCtx(ctx context.Context) context.Context {
	var (
		err    error
		newCtx context.Context
	)
	if w.subWorkflowID == 0 {
		if w.resume {
			newCtx, err = restoreWorkflowCtx(ctx)
			if err != nil {
				logs.Errorf("failed to restore root execute context: %v", err)
				return ctx
			}
		} else {
			newCtx, err = PrepareRootExeCtx(ctx, w.workflowID, w.spaceID, w.rootExecuteID, w.nodeCount, w.requireCheckpoint, w.version, w.projectID)
			if err != nil {
				logs.Errorf("failed to prepare root exe context: %v", err)
				return ctx
			}
		}
	} else {
		if w.resume {
			newCtx, err = restoreWorkflowCtx(ctx)
			if err != nil {
				logs.Errorf("failed to restore sub execute context: %v", err)
				return ctx
			}
		} else {
			newCtx, err = PrepareSubExeCtx(ctx, w.subWorkflowID, w.nodeCount, w.version, w.projectID)
			if err != nil {
				logs.Errorf("failed to prepare root exe context: %v", err)
				return ctx
			}
		}
	}

	return newCtx
}

func (w *workflowHandler) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	ctx = w.initWorkflowCtx(ctx)

	if w.resume {
		return ctx
	}

	c := getExeCtx(ctx)
	w.ch <- &Event{
		Type:    WorkflowStart,
		Context: c,
		Input:   input.(map[string]any),
	}

	return ctx
}

func (w *workflowHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	c := getExeCtx(ctx)
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

func (w *workflowHandler) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	c := getExeCtx(ctx)

	interruptInfo, ok := compose.ExtractInterruptInfo(err)
	if ok {
		if w.subWorkflowID != 0 { // TODO: only handle root workflow for now
			return ctx
		}

		if len(interruptInfo.RerunNodes) == 0 {
			return ctx
		}

		ieStore, ok := interruptInfo.State.(nodes.InterruptEventStore)
		if !ok {
			logs.Errorf("failed to extract interrupt event store from interrupt info")
			return ctx
		}

		var interruptEvents []*entity.InterruptEvent
		for _, nodeKey := range interruptInfo.RerunNodes {
			interruptE, ok, err := ieStore.GetInterruptEvent(vo.NodeKey(nodeKey))
			if err != nil {
				logs.Errorf("failed to extract interrupt event from node key: %v", err)
				continue
			}

			if !ok {
				logs.Errorf("failed to extract interrupt event from node key: %v", err)
				continue
			}
			interruptEvents = append(interruptEvents, interruptE)
		}

		w.ch <- &Event{
			Type:            WorkflowInterrupt,
			Context:         c,
			InterruptEvents: interruptEvents,
		}

		return ctx
	}

	e := &Event{
		Type:     WorkflowFailed,
		Context:  c,
		Duration: time.Since(time.UnixMilli(c.StartTime)),
		Err: &ErrorInfo{
			Level: LevelError,
			Err:   err,
		},
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

func (w *workflowHandler) OnStartWithStreamInput(ctx context.Context, info *callbacks.RunInfo,
	input *schema.StreamReader[callbacks.CallbackInput]) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		input.Close()
		return ctx
	}

	ctx = w.initWorkflowCtx(ctx)

	if w.resume {
		input.Close()
		return ctx
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
			return ctx
		}
		fullInput, e = concatTwoMaps(fullInput, chunk.(map[string]any))
		if e != nil {
			logs.Errorf("failed to concat two maps: %v", e)
			return ctx
		}
	}
	c := getExeCtx(ctx)
	w.ch <- &Event{
		Type:    WorkflowStart,
		Context: c,
		Input:   fullInput,
	}
	return ctx
}

func (w *workflowHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo,
	output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		output.Close()
		return ctx
	}

	// consumes the stream synchronously because the Exit node has already processed this stream synchronously.
	defer output.Close()
	fullOutput := make(map[string]any)
	for {
		chunk, e := output.Recv()
		if e != nil {
			if e == io.EOF {
				break
			}
			logs.Errorf("failed to receive stream output: %v", e)
			return ctx
		}
		fullOutput, e = concatTwoMaps(fullOutput, chunk.(map[string]any))
		if e != nil {
			logs.Errorf("failed to concat two maps: %v", e)
			return ctx
		}
	}

	c := getExeCtx(ctx)
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

	return ctx
}

func (n *NodeHandler) initNodeCtx(ctx context.Context, name string, typ entity.NodeType) context.Context {
	var (
		err    error
		newCtx context.Context
	)
	if n.resume == true {
		newCtx, err = restoreNodeCtx(ctx, n.nodeKey)
		if err != nil {
			logs.Errorf("failed to restore node execute context: %v", err)
			return ctx
		}
	} else {
		newCtx, err = PrepareNodeExeCtx(ctx, n.nodeKey, name, typ)
		if err != nil {
			logs.Errorf("failed to prepare node execute context: %v", err)
			return ctx
		}
	}

	return newCtx
}

func (n *NodeHandler) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	if info.Component != compose.ComponentOfLambda {
		return ctx
	}

	ctx = n.initNodeCtx(ctx, info.Name, entity.NodeType(info.Type))

	if n.resume {
		return ctx
	}

	e := &Event{
		Type:    NodeStart,
		Context: getExeCtx(ctx),
		Input:   input.(map[string]any),
	}

	n.ch <- e

	return ctx
}

func (n *NodeHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	if info.Component != compose.ComponentOfLambda {
		return ctx
	}

	c := getExeCtx(ctx)
	e := &Event{
		Type:     NodeEnd,
		Context:  c,
		Duration: time.Since(time.UnixMilli(c.StartTime)),
		Output:   output.(map[string]any),
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

func (n *NodeHandler) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	if info.Component != compose.ComponentOfLambda {
		return ctx
	}

	c := getExeCtx(ctx)

	if errors.Is(err, compose.InterruptAndRerun) {
		if err := compose.ProcessState[ExeContextStore](ctx, func(ctx context.Context, state ExeContextStore) error {
			if state == nil {
				return errors.New("state is nil")
			}

			return state.SetNodeCtx(n.nodeKey, c)
		}); err != nil {
			logs.Errorf("failed to process state: %v", err)
		}

		return ctx
	}

	e := &Event{
		Type:     NodeError,
		Context:  c,
		Duration: time.Since(time.UnixMilli(c.StartTime)),
		Err: &ErrorInfo{
			Level: LevelError, // TODO: handle interrupt error as well as warn level errors
			Err:   err,
		},
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
	if info.Component != compose.ComponentOfLambda {
		input.Close()
		return ctx
	}

	// currently Exit, OutputEmitter can potentially trigger this.
	// later VariableAggregator can also potentially trigger this.
	// we may receive nodes.KeyIsFinished from the stream, which should be discarded when concatenating the map.
	if info.Type != string(entity.NodeTypeExit) && info.Type != string(entity.NodeTypeOutputEmitter) {
		panic(fmt.Sprintf("impossible, node type= %s", info.Type))
	}

	ctx = n.initNodeCtx(ctx, info.Name, entity.NodeType(info.Type))

	if n.resume {
		input.Close()
		return ctx
	}

	c := getExeCtx(ctx)
	e := &Event{
		Type:    NodeStart,
		Context: c,
	}

	go func() {
		defer input.Close()
		fullInput := make(map[string]any)
		for {
			chunk, e := input.Recv()
			if e != nil {
				if e == io.EOF {
					break
				}
				logs.Errorf("failed to receive stream output: %v", e)
				return
			}
			fullInput, e = concatTwoMaps(fullInput, chunk.(map[string]any))
			if e != nil {
				logs.Errorf("failed to concat two maps: %v", e)
				return
			}
		}

		e.Input = fullInput
		n.ch <- e
	}()

	return ctx
}

func (n *NodeHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo, output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
	if info.Component != compose.ComponentOfLambda {
		output.Close()
		return ctx
	}

	// stream emitters such as LLM node, or VariableAggregator node in the future, can potentially trigger this.
	// when it's triggered in this way, we should consume the stream asynchronously, concat the output, calculate the tokens and duration, then send the event.
	// on the other hand, Exit node and OutputEmitter node can trigger this, but only in a synchronous way:
	// we will consume the stream synchronously and send the event. The event is NodeStreamOutput, and the output is the concatenated map.
	// 1. OutputEmitter: the output stream is empty.
	// 2. Exit: the output stream is a map[string]any with only one key which is 'output'.

	c := getExeCtx(ctx)
	e := &Event{
		Type:    NodeEnd,
		Context: c,
	}

	switch entity.NodeType(info.Type) {
	case entity.NodeTypeLLM, entity.NodeTypeVariableAggregator:
		go func() {
			defer output.Close()
			fullOutput := make(map[string]any)
			for {
				chunk, e := output.Recv()
				if e != nil {
					if e == io.EOF {
						break
					}
					logs.Errorf("failed to receive stream output: %v", e)
					return
				}
				fullOutput, e = concatTwoMaps(fullOutput, chunk.(map[string]any))
				if e != nil {
					logs.Errorf("failed to concat two maps: %v", e)
					return
				}
			}

			e.Output = fullOutput
			e.Duration = time.Since(time.UnixMilli(c.StartTime))

			if c.TokenCollector != nil {
				usage := c.TokenCollector.wait()
				e.Token = &TokenInfo{
					InputToken:  int64(usage.PromptTokens),
					OutputToken: int64(usage.CompletionTokens),
					TotalToken:  int64(usage.TotalTokens),
				}
			}
			n.ch <- e
		}()
	case entity.NodeTypeExit, entity.NodeTypeOutputEmitter:
		// consumes the stream synchronously because the Exit node has already processed this stream synchronously.
		defer output.Close()
		fullOutput := make(map[string]any)
		for {
			chunk, err := output.Recv()
			if err != nil {
				if err == io.EOF {
					break
				}
				logs.Errorf("failed to receive stream output: %v", e)
				return ctx
			}
			fullOutput, err = concatTwoMaps(fullOutput, chunk.(map[string]any))
			if err != nil {
				logs.Errorf("failed to concat two maps: %v", e)
				return ctx
			}
			n.ch <- &Event{
				Type:    NodeStreamingOutput,
				Context: e.Context,
				Output:  fullOutput,
			}
		}

		e.Output = fullOutput
		e.Duration = time.Since(time.UnixMilli(c.StartTime))

		if c.TokenCollector != nil {
			usage := c.TokenCollector.wait()
			e.Token = &TokenInfo{
				InputToken:  int64(usage.PromptTokens),
				OutputToken: int64(usage.CompletionTokens),
				TotalToken:  int64(usage.TotalTokens),
			}
		}
		n.ch <- e
	default:
		panic(fmt.Sprintf("impossible, node type= %s", info.Type))
	}

	return ctx
}

func concatTwoMaps(m1, m2 map[string]any) (map[string]any, error) {
	merged := maps.Clone(m1)
	for k, v := range m2 {
		current, ok := merged[k]
		if !ok {
			if vStr, ok := v.(string); ok {
				if vStr == nodes.KeyIsFinished {
					continue
				}
			}
			merged[k] = v
			continue
		}

		vStr, ok := v.(string)
		if !ok {
			return nil, fmt.Errorf("can only concat string values when concating chunks of map[string]any, actual: %T, key: %s", v, k)
		}

		if vStr == nodes.KeyIsFinished { // discard this terminal signal
			continue
		}

		currentStr, ok := current.(string)
		if !ok {
			return nil, fmt.Errorf("can only concat string values when concating chunks of map[string]any, actual: %T, key: %s", current, k)
		}

		merged[k] = currentStr + vStr
	}
	return merged, nil
}
