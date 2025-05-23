package execute

import (
	"context"
	"errors"
	"fmt"

	"github.com/bytedance/sonic"
	"github.com/redis/go-redis/v9"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func handleEvent(ctx context.Context, event *Event, repo workflow.Repository) (terminate bool, err error) {
	switch event.Type {
	case WorkflowStart:
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
			if err = repo.CreateWorkflowExecution(ctx, wfExec); err != nil {
				return false, fmt.Errorf("failed to create workflow execution: %v", err)
			}
		}
	case WorkflowSuccess:
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

		var (
			updatedRows   int64
			currentStatus entity.WorkflowExecuteStatus
		)
		if updatedRows, currentStatus, err = repo.UpdateWorkflowExecution(ctx, wfExec, []entity.WorkflowExecuteStatus{entity.WorkflowRunning}); err != nil {
			return false, fmt.Errorf("failed to save workflow execution when successful: %v", err)
		} else if updatedRows == 0 {
			return false, fmt.Errorf("failed to update workflow execution to success for execution id %d, current status is %v", exeID, currentStatus)
		}

		if event.SubWorkflowCtx == nil {
			rootWkID := event.RootCtx.WorkflowID
			// TODO need to know whether it is a debug run mode
			if err = repo.UpdateWorkflowDraftTestRunSuccess(ctx, rootWkID); err != nil {
				return false, fmt.Errorf("failed to save workflow draft test run success: %v", err)
			}
			return true, nil
		}
	case WorkflowFailed:
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

		var (
			updatedRows   int64
			currentStatus entity.WorkflowExecuteStatus
		)
		if updatedRows, currentStatus, err = repo.UpdateWorkflowExecution(ctx, wfExec, []entity.WorkflowExecuteStatus{entity.WorkflowRunning}); err != nil {
			return false, fmt.Errorf("failed to save workflow execution when failed: %v", err)
		} else if updatedRows == 0 {
			return false, fmt.Errorf("failed to update workflow execution to failed for execution id %d, current status is %v", exeID, currentStatus)
		}

		if event.SubWorkflowCtx == nil {
			return true, nil
		}
	case WorkflowInterrupt:
		exeID := event.RootCtx.RootExecuteID
		if event.SubWorkflowCtx != nil {
			exeID = event.SubExecuteID
		}
		wfExec := &entity.WorkflowExecution{
			ID:     exeID,
			Status: entity.WorkflowInterrupted,
		}

		var (
			updatedRows   int64
			currentStatus entity.WorkflowExecuteStatus
		)
		if updatedRows, currentStatus, err = repo.UpdateWorkflowExecution(ctx, wfExec, []entity.WorkflowExecuteStatus{entity.WorkflowRunning}); err != nil {
			return false, fmt.Errorf("failed to save workflow execution when interrupted: %v", err)
		} else if updatedRows == 0 {
			return false, fmt.Errorf("failed to update workflow execution to interrupted for execution id %d, current status is %v", exeID, currentStatus)
		}

		if err := repo.SaveInterruptEvents(ctx, event.RootExecuteID, event.InterruptEvents); err != nil {
			return false, fmt.Errorf("failed to save interrupt events: %v", err)
		}

		return true, nil
	case WorkflowCancel:
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

		var (
			updatedRows   int64
			currentStatus entity.WorkflowExecuteStatus
		)
		if updatedRows, currentStatus, err = repo.UpdateWorkflowExecution(ctx, wfExec, []entity.WorkflowExecuteStatus{entity.WorkflowRunning,
			entity.WorkflowInterrupted}); err != nil {
			return false, fmt.Errorf("failed to save workflow execution when canceled: %v", err)
		} else if updatedRows == 0 {
			return false, fmt.Errorf("failed to update workflow execution to canceled for execution id %d, current status is %v", exeID, currentStatus)
		}

		if event.SubWorkflowCtx == nil {
			return true, nil
		}
	case NodeStart:
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
		if err = repo.CreateNodeExecution(ctx, nodeExec); err != nil {
			return false, fmt.Errorf("failed to create node execution: %v", err)
		}
	case NodeEnd:
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
		if err = repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
			return false, fmt.Errorf("failed to save node execution: %v", err)
		}
	case NodeStreamingOutput:
		nodeExec := &entity.NodeExecution{
			ID:     event.NodeExecuteID,
			Output: ptr.Of(mustMarshalToString(event.Output)),
		}
		if err = repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
			return false, fmt.Errorf("failed to save node execution: %v", err)
		}
	case NodeStreamingInput:
		nodeExec := &entity.NodeExecution{
			ID:    event.NodeExecuteID,
			Input: ptr.Of(mustMarshalToString(event.Input)),
		}
		if err = repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
			return false, fmt.Errorf("failed to save node execution: %v", err)
		}

	case NodeError:
		var errorInfo, errorLevel string
		if errors.Is(event.Err.Err, context.Canceled) {
			errorInfo = "workflow cancel by user"
			errorLevel = string(LevelPending)
		} else {
			errorInfo = event.Err.Err.Error()[:min(100, len(event.Err.Err.Error()))]
			errorLevel = string(LevelError)
		}

		nodeExec := &entity.NodeExecution{
			ID:         event.NodeExecuteID,
			Status:     entity.NodeFailed,
			ErrorInfo:  ptr.Of(errorInfo),
			ErrorLevel: ptr.Of(errorLevel),
			Duration:   event.Duration,
			TokenInfo: &entity.TokenUsage{
				InputTokens:  event.GetInputTokens(),
				OutputTokens: event.GetOutputTokens(),
			},
		}
		if err = repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
			return false, fmt.Errorf("failed to save node execution: %v", err)
		}
	default:
		panic("unimplemented event type: " + event.Type)
	}

	return false, nil
}

func HandleExecuteEvent(ctx context.Context, eventChan <-chan *Event, cancelFn context.CancelFunc,
	cancelSignalChan <-chan *redis.Message, clearFn func(), repo workflow.Repository) {
	defer clearFn()

	for {
		select {
		case <-cancelSignalChan:
			cancelFn()
		case event := <-eventChan:
			if terminal, err := handleEvent(ctx, event, repo); err != nil {
				logs.Error("failed to handle event: %v", err)
			} else if terminal {
				return
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
