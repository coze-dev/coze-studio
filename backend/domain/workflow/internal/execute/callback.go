package execute

import (
	"context"
	"fmt"
	"io"
	"strconv"
	"time"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"golang.org/x/exp/maps"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type NodeHandler struct {
	NodeKey nodes.NodeKey
	ch      chan<- *Event
}

type workflowHandler struct {
	ch            chan<- *Event
	workflowID    int64
	subWorkflowID int64
}

func NewWorkflowHandler(workflowID int64, ch chan<- *Event) callbacks.Handler {
	return &workflowHandler{
		ch:         ch,
		workflowID: workflowID,
	}
}

func NewNodeHandler(key string, ch chan<- *Event) callbacks.Handler {
	return &NodeHandler{
		NodeKey: nodes.NodeKey(key),
		ch:      ch,
	}
}

func (w *workflowHandler) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	startT := time.Now()

	c := GetExeCtx(ctx)
	w.ch <- &Event{
		Type:    WorkflowStart,
		Context: c,
		Input:   input.(map[string]any),
	}

	return context.WithValue(ctx, tsKey{}, startT)
}

func (w *workflowHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	startT := ctx.Value(tsKey{}).(time.Time)

	c := GetExeCtx(ctx)
	e := &Event{
		Type:     WorkflowSuccess,
		Context:  c,
		Output:   output.(map[string]any),
		Duration: time.Since(startT),
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

	startT := ctx.Value(tsKey{}).(time.Time)

	c := GetExeCtx(ctx)
	e := &Event{
		Type:     WorkflowFailed,
		Context:  c,
		Duration: time.Since(startT),
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

func (w *workflowHandler) OnStartWithStreamInput(ctx context.Context, info *callbacks.RunInfo, input *schema.StreamReader[callbacks.CallbackInput]) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		input.Close()
		return ctx
	}

	// consumes the stream synchronously because a workflow can only have Invoke or Stream.
	startT := time.Now()
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
	c := GetExeCtx(ctx)
	w.ch <- &Event{
		Type:    WorkflowStart,
		Context: c,
		Input:   fullInput,
	}
	return context.WithValue(ctx, tsKey{}, startT)
}

func (w *workflowHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo, output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		output.Close()
		return ctx
	}

	// consumes the stream synchronously because the Exit node has already processed this stream synchronously.
	startT := ctx.Value(tsKey{}).(time.Time)

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

	c := GetExeCtx(ctx)
	e := &Event{
		Type:     WorkflowSuccess,
		Context:  c,
		Duration: time.Since(startT),
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

type tsKey struct{}

func (n *NodeHandler) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	if info.Component != compose.ComponentOfLambda {
		return ctx
	}

	newCtx, err := PrepareNodeExeCtx(ctx, n.NodeKey, info.Name, nodes.NodeType(info.Type))
	if err != nil {
		logs.Errorf("failed to prepare node exe context: %v", err)
		return ctx
	}

	e := &Event{
		Type:    NodeStart,
		Context: GetExeCtx(newCtx),
		Input:   input.(map[string]any),
	}

	now := time.Now()
	newCtx = context.WithValue(newCtx, tsKey{}, now)

	n.ch <- e

	return newCtx
}

func (n *NodeHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	if info.Component != compose.ComponentOfLambda {
		return ctx
	}

	c := GetExeCtx(ctx)
	startTS := ctx.Value(tsKey{}).(time.Time)
	now := time.Now()
	e := &Event{
		Type:     NodeEnd,
		Context:  c,
		Duration: now.Sub(startTS),
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

	c := GetExeCtx(ctx)
	startTS := ctx.Value(tsKey{}).(time.Time)
	now := time.Now()
	e := &Event{
		Type:     NodeError,
		Context:  c,
		Duration: now.Sub(startTS),
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
	if info.Type != string(nodes.NodeTypeExit) && info.Type != string(nodes.NodeTypeOutputEmitter) {
		panic(fmt.Sprintf("impossible, node type= %s", info.Type))
	}

	newCtx, err := PrepareNodeExeCtx(ctx, n.NodeKey, info.Name, nodes.NodeType(info.Type))
	if err != nil {
		logs.Errorf("failed to prepare node exe context: %v", err)
		return ctx
	}

	now := time.Now()
	newCtx = context.WithValue(newCtx, tsKey{}, now)

	c := GetExeCtx(newCtx)
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

	return newCtx
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

	c := GetExeCtx(ctx)
	startTS := ctx.Value(tsKey{}).(time.Time)
	e := &Event{
		Type:    NodeEnd,
		Context: c,
	}

	switch nodes.NodeType(info.Type) {
	case nodes.NodeTypeLLM, nodes.NodeTypeVariableAggregator:
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
			e.Duration = time.Since(startTS)

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
	case nodes.NodeTypeExit, nodes.NodeTypeOutputEmitter:
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
		e.Duration = time.Since(startTS)

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
