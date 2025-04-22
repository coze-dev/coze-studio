package execute

import (
	"context"
	"strconv"
	"time"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/batch"
)

type NodeHandler struct {
	NodeKey string
	ch      chan<- *Event
}

type workflowHandler struct {
	ch            chan<- *Event
	workflowID    int64
	subWorkflowID int64
	subExecutorID int64
}

func NewWorkflowHandler(workflowID int64, ch chan<- *Event) callbacks.Handler {
	return &workflowHandler{
		ch:         ch,
		workflowID: workflowID,
	}
}

func NewNodeHandler(key string, ch chan<- *Event) callbacks.Handler {
	return &NodeHandler{
		NodeKey: key,
		ch:      ch,
	}
}

func (w *workflowHandler) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	if w.subExecutorID == 0 {
		c := GetExecuteContext(ctx)
		w.ch <- &Event{
			Type:       WorkflowStart,
			WorkflowID: c.WorkflowID,
			SpaceID:    c.SpaceID,
			ExecutorID: c.ExecuteID,
			Input:      input.(map[string]any),
		}
	} else {
		var c *Context
		ctx, c = PrepareSubExecuteContext(ctx, w.subWorkflowID, w.subExecutorID)
		w.ch <- &Event{
			Type:          WorkflowStart,
			WorkflowID:    c.WorkflowID,
			SpaceID:       c.SpaceID,
			ExecutorID:    c.ExecuteID,
			SubExecutorID: c.SubExecuteID,
			Input:         input.(map[string]any),
		}
	}

	return ctx
}

func (w *workflowHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	c := GetExecuteContext(ctx)
	w.ch <- &Event{
		Type:          WorkflowSuccess,
		WorkflowID:    c.WorkflowID,
		SpaceID:       c.SpaceID,
		ExecutorID:    c.ExecuteID,
		SubExecutorID: c.SubExecuteID,
		Output:        output.(map[string]any),
	}

	return ctx
}

func (w *workflowHandler) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	c := GetExecuteContext(ctx)
	w.ch <- &Event{
		Type:          WorkflowFailed,
		WorkflowID:    c.WorkflowID,
		SpaceID:       c.SpaceID,
		ExecutorID:    c.ExecuteID,
		SubExecutorID: c.SubExecuteID,
		Err: &ErrorInfo{
			Level: LevelError,
			Err:   err,
		},
	}

	return ctx
}

func (w *workflowHandler) OnStartWithStreamInput(ctx context.Context, info *callbacks.RunInfo, input *schema.StreamReader[callbacks.CallbackInput]) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	if w.subExecutorID == 0 {
		c := GetExecuteContext(ctx)
		w.ch <- &Event{
			Type:       WorkflowStart,
			WorkflowID: c.WorkflowID,
			SpaceID:    c.SpaceID,
			ExecutorID: c.ExecuteID,
			InputStream: schema.StreamReaderWithConvert(input, func(t callbacks.CallbackInput) (map[string]any, error) {
				return t.(map[string]any), nil
			}),
		}
	} else {
		var c *Context
		ctx, c = PrepareSubExecuteContext(ctx, w.subWorkflowID, w.subExecutorID)
		w.ch <- &Event{
			Type:          WorkflowStart,
			WorkflowID:    c.WorkflowID,
			SpaceID:       c.SpaceID,
			ExecutorID:    c.ExecuteID,
			SubExecutorID: c.SubExecuteID,
			InputStream: schema.StreamReaderWithConvert(input, func(t callbacks.CallbackInput) (map[string]any, error) {
				return t.(map[string]any), nil
			}),
		}
	}

	return ctx
}

func (w *workflowHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo, output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
	if info.Component != compose.ComponentOfWorkflow || info.Name != strconv.FormatInt(w.workflowID, 10) {
		return ctx
	}

	c := GetExecuteContext(ctx)
	w.ch <- &Event{
		Type:          WorkflowSuccess,
		WorkflowID:    c.WorkflowID,
		SpaceID:       c.SpaceID,
		ExecutorID:    c.ExecuteID,
		SubExecutorID: c.SubExecuteID,
		OutputStream: schema.StreamReaderWithConvert(output, func(t callbacks.CallbackOutput) (any, error) {
			return t.(map[string]any), nil
		}),
	}

	return ctx
}

type tsKey struct{}

func (n *NodeHandler) OnStart(ctx context.Context, info *callbacks.RunInfo, input callbacks.CallbackInput) context.Context {
	if info.Component != compose.ComponentOfLambda {
		return ctx
	}

	c := GetExecuteContext(ctx)
	e := &Event{
		Type:          NodeStart,
		WorkflowID:    c.WorkflowID,
		SpaceID:       c.SpaceID,
		ExecutorID:    c.ExecuteID,
		SubExecutorID: c.SubExecuteID,
		NodeKey:       n.NodeKey,
		NodeName:      info.Name,
		NodeType:      entity.NodeType(info.Type),
		Input:         input.(map[string]any),
	}

	bInfo := batch.GetBatchInfo(ctx)
	if bInfo != nil {
		e.Batch = &BatchInfo{
			Index: bInfo["index"].(int),
			Items: bInfo["items"].(map[string]any),
		}
	}

	now := time.Now()
	ctx = context.WithValue(ctx, tsKey{}, now)

	n.ch <- e

	return ctx
}

func (n *NodeHandler) OnEnd(ctx context.Context, info *callbacks.RunInfo, output callbacks.CallbackOutput) context.Context {
	if info.Component != compose.ComponentOfLambda {
		return ctx
	}

	c := GetExecuteContext(ctx)
	startTS := ctx.Value(tsKey{}).(time.Time)
	now := time.Now()
	e := &Event{
		Type:          NodeEnd,
		WorkflowID:    c.WorkflowID,
		SpaceID:       c.SpaceID,
		ExecutorID:    c.ExecuteID,
		SubExecutorID: c.SubExecuteID,
		NodeKey:       n.NodeKey,
		NodeName:      info.Name,
		NodeType:      entity.NodeType(info.Type),
		Duration:      now.Sub(startTS),
		Output:        output,
	}

	switch entity.NodeType(info.Type) {
	case entity.NodeTypeLLM:
		usage := nodes.WaitTokenCollector(ctx)
		e.Token = &TokenInfo{
			InputToken:  usage.PromptTokens,
			OutputToken: usage.CompletionTokens,
			TotalToken:  usage.TotalTokens,
		}
	default:
	}

	n.ch <- e

	return ctx
}

func (n *NodeHandler) OnError(ctx context.Context, info *callbacks.RunInfo, err error) context.Context {
	if info.Component != compose.ComponentOfLambda {
		return ctx
	}

	c := GetExecuteContext(ctx)
	startTS := ctx.Value(tsKey{}).(time.Time)
	now := time.Now()
	e := &Event{
		Type:          NodeError,
		WorkflowID:    c.WorkflowID,
		SpaceID:       c.SpaceID,
		ExecutorID:    c.ExecuteID,
		SubExecutorID: c.SubExecuteID,
		NodeKey:       n.NodeKey,
		NodeName:      info.Name,
		NodeType:      entity.NodeType(info.Type),
		Duration:      now.Sub(startTS),
		Err: &ErrorInfo{
			Level: LevelError, // TODO: handle interrupt error as well as warn level errors
			Err:   err,
		},
	}

	switch entity.NodeType(info.Type) {
	case entity.NodeTypeLLM:
		usage := nodes.WaitTokenCollector(ctx)
		e.Token = &TokenInfo{
			InputToken:  usage.PromptTokens,
			OutputToken: usage.CompletionTokens,
			TotalToken:  usage.TotalTokens,
		}
	default:
	}

	n.ch <- e

	return ctx
}

func (n *NodeHandler) OnStartWithStreamInput(ctx context.Context, info *callbacks.RunInfo, input *schema.StreamReader[callbacks.CallbackInput]) context.Context {
	if info.Component != compose.ComponentOfLambda {
		input.Close()
		return ctx
	}

	c := GetExecuteContext(ctx)
	e := &Event{
		Type:          NodeStart,
		WorkflowID:    c.WorkflowID,
		SpaceID:       c.SpaceID,
		ExecutorID:    c.ExecuteID,
		SubExecutorID: c.SubExecuteID,
		NodeKey:       n.NodeKey,
		NodeName:      info.Name,
		NodeType:      entity.NodeType(info.Type),
		InputStream: schema.StreamReaderWithConvert(input, func(t callbacks.CallbackInput) (map[string]any, error) {
			return t.(map[string]any), nil
		}),
	}

	bInfo := batch.GetBatchInfo(ctx)
	if bInfo != nil {
		e.Batch = &BatchInfo{
			Index: bInfo["index"].(int),
			Items: bInfo["items"].(map[string]any),
		}
	}

	now := time.Now()
	ctx = context.WithValue(ctx, tsKey{}, now)

	n.ch <- e

	return ctx
}

func (n *NodeHandler) OnEndWithStreamOutput(ctx context.Context, info *callbacks.RunInfo, output *schema.StreamReader[callbacks.CallbackOutput]) context.Context {
	if info.Component != compose.ComponentOfLambda {
		output.Close()
		return ctx
	}

	c := GetExecuteContext(ctx)
	startTS := ctx.Value(tsKey{}).(time.Time)
	now := time.Now()
	e := &Event{
		Type:          NodeEnd,
		WorkflowID:    c.WorkflowID,
		SpaceID:       c.SpaceID,
		ExecutorID:    c.ExecuteID,
		SubExecutorID: c.SubExecuteID,
		NodeKey:       n.NodeKey,
		NodeName:      info.Name,
		NodeType:      entity.NodeType(info.Type),
		Duration:      now.Sub(startTS), // TODO: maybe this duration should wait until the stream is complete?
		OutputStream: schema.StreamReaderWithConvert(output, func(t callbacks.CallbackOutput) (any, error) {
			return t.(any), nil
		}),
	}

	switch entity.NodeType(info.Type) {
	case entity.NodeTypeLLM:
		go func() {
			usage := nodes.WaitTokenCollector(ctx)
			e.Token = &TokenInfo{
				InputToken:  usage.PromptTokens,
				OutputToken: usage.CompletionTokens,
				TotalToken:  usage.TotalTokens,
			}
			n.ch <- e
		}()
	default:
		n.ch <- e
	}

	return ctx
}
