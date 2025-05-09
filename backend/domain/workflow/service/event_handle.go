package service

import (
	"context"
	"fmt"

	"github.com/bytedance/sonic"
	"github.com/redis/go-redis/v9"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (i *impl) handleEvent(ctx context.Context, event *execute.Event) (err error) {
	switch event.Type {
	case execute.WorkflowStart:
		exeID := event.RootCtx.RootExecuteID
		wfID := event.RootCtx.WorkflowID
		var parentNodeID *string
		var parentNodeExecuteID *int64
		nodeCount := event.RootCtx.NodeCount
		version := event.RootCtx.Version
		projectID := event.RootCtx.ProjectID
		if event.SubWorkflowCtx != nil {
			exeID = event.SubExecuteID
			wfID = event.SubWorkflowID
			parentNodeID = ptr.Of(string(event.NodeCtx.NodeKey))
			parentNodeExecuteID = ptr.Of(event.NodeCtx.NodeExecuteID)
			nodeCount = event.SubWorkflowCtx.NodeCount
			version = event.SubWorkflowCtx.Version
			projectID = event.SubWorkflowCtx.ProjectID
		}

		wfExec := &entity.WorkflowExecution{
			ID: exeID,
			WorkflowIdentity: entity.WorkflowIdentity{
				ID:      wfID,
				Version: version,
			},
			SpaceID: event.SpaceID,
			// TODO: how to know whether it's a debug run or release run? Version alone is not sufficient.
			// TODO: fill operator information
			Status:              entity.WorkflowRunning,
			Input:               ptr.Of(mustMarshalToString(event.Input)),
			RootExecutionID:     event.RootExecuteID,
			ParentNodeID:        parentNodeID,
			ParentNodeExecuteID: parentNodeExecuteID,
			ProjectID:           projectID,
			NodeCount:           nodeCount,
		}

		if parentNodeID != nil { // root workflow execution has already been created
			if err = i.repo.CreateWorkflowExecution(ctx, wfExec); err != nil {
				return fmt.Errorf("failed to create workflow execution: %v", err)
			}
		}
	case execute.WorkflowSuccess:
		exeID := event.RootCtx.RootExecuteID
		if event.SubWorkflowCtx != nil {
			exeID = event.SubExecuteID
		}
		wfExec := &entity.WorkflowExecution{
			ID:       exeID,
			Duration: event.Duration,
			Status:   entity.WorkflowSuccess,
			Output:   ptr.Of(mustMarshalToString(event.Output)),
			TokenInfo: &entity.TokenUsage{
				InputTokens:  event.GetInputTokens(),
				OutputTokens: event.GetOutputTokens(),
			},
		}

		if err = i.repo.UpdateWorkflowExecution(ctx, wfExec); err != nil {
			return fmt.Errorf("failed to save workflow execution when successful: %v", err)
		}

		if event.SubWorkflowCtx == nil {
			rootWkID := event.RootCtx.WorkflowID
			// TODO need to know whether it is a debug run mode
			if err = i.repo.UpdateWorkflowDraftTestRunSuccess(ctx, rootWkID); err != nil {
				return fmt.Errorf("failed to save workflow draft test run success: %v", err)
			}
			return
		}
	case execute.WorkflowFailed:
		exeID := event.RootCtx.RootExecuteID
		if event.SubWorkflowCtx != nil {
			exeID = event.SubExecuteID
		}
		wfExec := &entity.WorkflowExecution{
			ID:       exeID,
			Duration: event.Duration,
			Status:   entity.WorkflowFailed,
			TokenInfo: &entity.TokenUsage{
				InputTokens:  event.GetInputTokens(),
				OutputTokens: event.GetOutputTokens(),
			},
			ErrorCode:  ptr.Of(event.Err.Err.Error()[:min(100, len(event.Err.Err.Error()))]), // TODO: where can I get the error codes?
			FailReason: ptr.Of(event.Err.Err.Error()[:min(100, len(event.Err.Err.Error()))]),
		}

		if err = i.repo.UpdateWorkflowExecution(ctx, wfExec); err != nil {
			return fmt.Errorf("failed to save workflow execution when failed: %v", err)
		}

		if event.SubWorkflowCtx == nil {
			return
		}
	case execute.WorkflowInterrupt:
		exeID := event.RootCtx.RootExecuteID
		if event.SubWorkflowCtx != nil {
			exeID = event.SubExecuteID
		}
		wfExec := &entity.WorkflowExecution{
			ID:     exeID,
			Status: entity.WorkflowInterrupted,
		}

		if err = i.repo.UpdateWorkflowExecution(ctx, wfExec); err != nil {
			return fmt.Errorf("failed to save workflow execution when failed: %v", err)
		}

		if err := i.repo.SaveInterruptEvents(ctx, event.RootExecuteID, event.InterruptEvents); err != nil {
			return fmt.Errorf("failed to save interrupt events: %v", err)
		}

		return
	case execute.WorkflowCancel:
		exeID := event.RootCtx.RootExecuteID
		if event.SubWorkflowCtx != nil {
			exeID = event.SubExecuteID
		}
		wfExec := &entity.WorkflowExecution{
			ID:       exeID,
			Duration: event.Duration,
			Status:   entity.WorkflowCancel,
			TokenInfo: &entity.TokenUsage{
				InputTokens:  event.GetInputTokens(),
				OutputTokens: event.GetOutputTokens(),
			},
		}

		if err = i.repo.UpdateWorkflowExecution(ctx, wfExec); err != nil {
			return fmt.Errorf("failed to save workflow execution when failed: %v", err)
		}

		if event.SubWorkflowCtx == nil {
			return
		}
	case execute.NodeStart:
		if event.Context == nil {
			panic("nil event context")
		}

		wfExeID := event.RootCtx.RootExecuteID
		if event.SubWorkflowCtx != nil {
			wfExeID = event.SubExecuteID
		}
		nodeExec := &entity.NodeExecution{
			ID:        event.NodeExecuteID,
			ExecuteID: wfExeID,
			NodeID:    string(event.NodeKey),
			NodeName:  event.NodeName,
			NodeType:  event.NodeType,
			Status:    entity.NodeRunning,
			Input:     ptr.Of(mustMarshalToString(event.Input)),
		}
		if event.BatchInfo != nil {
			nodeExec.Index = event.BatchInfo.Index
			nodeExec.Items = ptr.Of(mustMarshalToString(event.BatchInfo.Items))
			nodeExec.ParentNodeID = ptr.Of(string(event.BatchInfo.CompositeNodeKey))
		}
		if err = i.repo.CreateNodeExecution(ctx, nodeExec); err != nil {
			return fmt.Errorf("failed to create node execution: %v", err)
		}
	case execute.NodeEnd:
		nodeExec := &entity.NodeExecution{
			ID:        event.NodeExecuteID,
			Status:    entity.NodeSuccess,
			Output:    ptr.Of(mustMarshalToString(event.Output)),
			RawOutput: ptr.Of(mustMarshalToString(event.RawOutput)),
			Duration:  event.Duration,
			TokenInfo: &entity.TokenUsage{
				InputTokens:  event.GetInputTokens(),
				OutputTokens: event.GetOutputTokens(),
			},
		}
		if err = i.repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
			return fmt.Errorf("failed to save node execution: %v", err)
		}
	case execute.NodeStreamingOutput:
		nodeExec := &entity.NodeExecution{
			ID:     event.NodeExecuteID,
			Output: ptr.Of(mustMarshalToString(event.Output)),
		}
		if err = i.repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
			return fmt.Errorf("failed to save node execution: %v", err)
		}
	case execute.NodeError:
		nodeExec := &entity.NodeExecution{
			ID:         event.NodeExecuteID,
			Status:     entity.NodeFailed,
			ErrorInfo:  ptr.Of(event.Err.Err.Error()[:min(100, len(event.Err.Err.Error()))]),
			ErrorLevel: ptr.Of(string(execute.LevelError)),
			Duration:   event.Duration,
			TokenInfo: &entity.TokenUsage{
				InputTokens:  event.GetInputTokens(),
				OutputTokens: event.GetOutputTokens(),
			},
		}
		if err = i.repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
			return fmt.Errorf("failed to save node execution: %v", err)
		}
	default:
		panic("unimplemented event type: " + event.Type)
	}

	return nil
}

func (i *impl) handleExecuteEvent(ctx context.Context, eventChan <-chan *execute.Event, cancelFn context.CancelFunc,
	cancelSignalChan <-chan *redis.Message, clearFn func()) {
	defer clearFn()

	// consumes events from eventChan and update database as we go
	var err error
	for {
		select {
		case <-cancelSignalChan:
			cancelFn()
		case event := <-eventChan:
			if err = i.handleEvent(ctx, event); err != nil {
				logs.Error("failed to handle event: %v", err)
			}
		}
	}
}

func mustMarshalToString[T any](m map[string]T) string {
	if len(m) == 0 {
		return ""
	}

	b, err := sonic.MarshalString(m)
	if err != nil {
		panic(err)
	}
	return b
}
