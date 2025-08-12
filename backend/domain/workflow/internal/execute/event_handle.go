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
	"reflect"
	"strconv"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// safeSend safely sends a message through StreamWriter, recovering from any send-on-closed-channel panics
func safeSend(ctx context.Context, sw *schema.StreamWriter[*entity.Message], msg *entity.Message, err error) {
	if sw == nil {
		return
	}
	
	defer func() {
		if panicErr := recover(); panicErr != nil {
			logs.CtxDebugf(ctx, "failed to send message via stream writer (likely closed channel): %v", panicErr)
		}
	}()
	
	sw.Send(msg, err)
}

func setRootWorkflowSuccess(ctx context.Context, event *Event, repo workflow.Repository,
	sw *schema.StreamWriter[*entity.Message]) (err error) {
	exeID := event.RootCtx.RootExecuteID
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
		return fmt.Errorf("failed to save workflow execution when successful: %v", err)
	} else if updatedRows == 0 {
		return fmt.Errorf("failed to update workflow execution to success for execution id %d, current status is %v", exeID, currentStatus)
	}

	rootWkID := event.RootWorkflowBasic.ID
	exeCfg := event.ExeCfg
	if exeCfg.Mode == vo.ExecuteModeDebug {
		if err := repo.UpdateWorkflowDraftTestRunSuccess(ctx, rootWkID); err != nil {
			return fmt.Errorf("failed to save workflow draft test run success: %v", err)
		}
	}

	if sw != nil {
		safeSend(ctx, sw, &entity.Message{
			StateMessage: &entity.StateMessage{
				ExecuteID: event.RootExecuteID,
				EventID:   event.GetResumedEventID(),
				Status:    entity.WorkflowSuccess,
				Usage: ternary.IFElse(event.Token == nil, nil, &entity.TokenUsage{
					InputTokens:  event.GetInputTokens(),
					OutputTokens: event.GetOutputTokens(),
				}),
			},
		}, nil)
	}
	return nil
}

type terminateSignal string

const (
	noTerminate     terminateSignal = "no_terminate"
	workflowSuccess terminateSignal = "workflowSuccess"
	workflowAbort   terminateSignal = "workflowAbort"
	lastNodeDone    terminateSignal = "lastNodeDone"
)

func handleEvent(ctx context.Context, event *Event, repo workflow.Repository,
	sw *schema.StreamWriter[*entity.Message], // when this workflow's caller needs to receive intermediate results
) (signal terminateSignal, err error) {
	switch event.Type {
	case WorkflowStart:
		exeID := event.RootCtx.RootExecuteID
		var parentNodeID *string
		var parentNodeExecuteID *int64
		wb := event.RootWorkflowBasic
		if event.SubWorkflowCtx != nil {
			exeID = event.SubExecuteID
			parentNodeID = ptr.Of(string(event.NodeCtx.NodeKey))
			parentNodeExecuteID = ptr.Of(event.NodeCtx.NodeExecuteID)
			wb = event.SubWorkflowBasic
		}

		if parentNodeID != nil { // root workflow execution has already been created
			var logID string
			logID, _ = ctx.Value("log-id").(string)

			wfExec := &entity.WorkflowExecution{
				ID:                  exeID,
				WorkflowID:          wb.ID,
				Version:             wb.Version,
				SpaceID:             wb.SpaceID,
				ExecuteConfig:       event.ExeCfg,
				Status:              entity.WorkflowRunning,
				Input:               ptr.Of(mustMarshalToString(event.Input)),
				RootExecutionID:     event.RootExecuteID,
				ParentNodeID:        parentNodeID,
				ParentNodeExecuteID: parentNodeExecuteID,
				NodeCount:           event.nodeCount,
				CommitID:            wb.CommitID,
				LogID:               logID,
			}

			if err = repo.CreateWorkflowExecution(ctx, wfExec); err != nil {
				return noTerminate, fmt.Errorf("failed to create workflow execution: %v", err)
			}

			nodeExec := &entity.NodeExecution{
				ID: event.NodeExecuteID,
				SubWorkflowExecution: &entity.WorkflowExecution{
					ID: exeID,
				},
			}
			if err = repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
				return noTerminate, fmt.Errorf("failed to update subworkflow node execution with subExecuteID: %v", err)
			}
		} else if sw != nil {
			safeSend(ctx, sw, &entity.Message{
				StateMessage: &entity.StateMessage{
					ExecuteID: event.RootExecuteID,
					EventID:   event.GetResumedEventID(),
					SpaceID:   event.Context.RootCtx.RootWorkflowBasic.SpaceID,
					Status:    entity.WorkflowRunning,
				},
			}, nil)
		}

		if len(wb.Version) == 0 {
			if err = repo.CreateSnapshotIfNeeded(ctx, wb.ID, wb.CommitID); err != nil {
				return noTerminate, fmt.Errorf("failed to create snapshot: %v", err)
			}
		}
	case WorkflowSuccess:
		// sub workflow, no need to wait for exit node to be done
		if event.SubWorkflowCtx != nil {
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
				return noTerminate, fmt.Errorf("failed to save workflow execution when successful: %v", err)
			} else if updatedRows == 0 {
				return noTerminate, fmt.Errorf("failed to update workflow execution to success for execution id %d, current status is %v", exeID, currentStatus)
			}

			return noTerminate, nil
		}

		return workflowSuccess, nil
	case WorkflowFailed:
		exeID := event.RootCtx.RootExecuteID
		wfID := event.RootCtx.RootWorkflowBasic.ID
		if event.SubWorkflowCtx != nil {
			exeID = event.SubExecuteID
			wfID = event.SubWorkflowBasic.ID
		}

		logs.CtxErrorf(ctx, "workflow execution failed: %v", event.Err)

		wfExec := &entity.WorkflowExecution{
			ID:       exeID,
			Duration: event.Duration,
			Status:   entity.WorkflowFailed,
			TokenInfo: &entity.TokenUsage{
				InputTokens:  event.GetInputTokens(),
				OutputTokens: event.GetOutputTokens(),
			},
		}

		var wfe vo.WorkflowError
		if !errors.As(event.Err, &wfe) {
			if errors.Is(event.Err, context.DeadlineExceeded) {
				wfe = vo.WorkflowTimeoutErr
			} else if errors.Is(event.Err, context.Canceled) {
				wfe = vo.CancelErr
			} else {
				wfe = vo.WrapError(errno.ErrWorkflowExecuteFail, event.Err, errorx.KV("cause", vo.UnwrapRootErr(event.Err).Error()))
			}
		}

		if cause := errors.Unwrap(event.Err); cause != nil {
			logs.CtxErrorf(ctx, "workflow %d for exeID %d returns err: %v, cause: %v",
				wfID, exeID, event.Err, cause)
		} else {
			logs.CtxErrorf(ctx, "workflow %d for exeID %d returns err: %v",
				wfID, exeID, event.Err)
		}

		errMsg := wfe.Msg()[:min(1000, len(wfe.Msg()))]
		wfExec.ErrorCode = ptr.Of(strconv.Itoa(int(wfe.Code())))
		wfExec.FailReason = ptr.Of(errMsg)

		var (
			updatedRows   int64
			currentStatus entity.WorkflowExecuteStatus
		)
		if updatedRows, currentStatus, err = repo.UpdateWorkflowExecution(ctx, wfExec, []entity.WorkflowExecuteStatus{entity.WorkflowRunning}); err != nil {
			return noTerminate, fmt.Errorf("failed to save workflow execution when failed: %v", err)
		} else if updatedRows == 0 {
			return noTerminate, fmt.Errorf("failed to update workflow execution to failed for execution id %d, current status is %v", exeID, currentStatus)
		}

		if event.SubWorkflowCtx == nil {
			if sw != nil {
				safeSend(ctx, sw, &entity.Message{
					StateMessage: &entity.StateMessage{
						ExecuteID: event.RootExecuteID,
						EventID:   event.GetResumedEventID(),
						Status:    entity.WorkflowFailed,
						Usage:     wfExec.TokenInfo,
						LastError: wfe,
					},
				}, nil)
			}
			return workflowAbort, nil
		}
	case WorkflowInterrupt:
		if event.done != nil {
			defer close(event.done)
		}

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
			return noTerminate, fmt.Errorf("failed to save workflow execution when interrupted: %v", err)
		} else if updatedRows == 0 {
			return noTerminate, fmt.Errorf("failed to update workflow execution to interrupted for execution id %d, current status is %v", exeID, currentStatus)
		}

		if event.RootCtx.ResumeEvent != nil {
			needPop := false
			for _, ie := range event.InterruptEvents {
				if ie.NodeKey == event.RootCtx.ResumeEvent.NodeKey {
					if reflect.DeepEqual(ie.NodePath, event.RootCtx.ResumeEvent.NodePath) {
						needPop = true
					}
				}
			}

			if needPop {
				// the current resuming node emits an interrupt event again
				// need to remove the previous interrupt event because the node is not 'END', but 'Error',
				// so it didn't remove the previous interrupt OnEnd
				deletedEvent, deleted, err := repo.PopFirstInterruptEvent(ctx, exeID)
				if err != nil {
					return noTerminate, err
				}

				if !deleted {
					return noTerminate, fmt.Errorf("interrupt events does not exist, wfExeID: %d", exeID)
				}

				if deletedEvent.ID != event.RootCtx.ResumeEvent.ID {
					return noTerminate, fmt.Errorf("interrupt event id mismatch when deleting, expect: %d, actual: %d",
						event.RootCtx.ResumeEvent.ID, deletedEvent.ID)
				}
			}
		}

		// TODO: there maybe time gap here

		if err := repo.SaveInterruptEvents(ctx, event.RootExecuteID, event.InterruptEvents); err != nil {
			return noTerminate, fmt.Errorf("failed to save interrupt events: %v", err)
		}

		if sw != nil && event.SubWorkflowCtx == nil { // only send interrupt event when is root workflow
			firstIE, found, err := repo.GetFirstInterruptEvent(ctx, event.RootExecuteID)
			if err != nil {
				return noTerminate, fmt.Errorf("failed to get first interrupt event: %v", err)
			}

			if !found {
				return noTerminate, fmt.Errorf("interrupt event does not exist, wfExeID: %d", event.RootExecuteID)
			}

			nodeKey := firstIE.NodeKey

			safeSend(ctx, sw, &entity.Message{
				DataMessage: &entity.DataMessage{
					ExecuteID: event.RootExecuteID,
					Role:      schema.Assistant,
					Type:      entity.Answer,
					Content:   firstIE.InterruptData, // TODO: may need to extract from InterruptData the actual info for user
					NodeID:    string(nodeKey),
					NodeType:  firstIE.NodeType,
					NodeTitle: firstIE.NodeTitle,
					Last:      true,
				},
			}, nil)

			safeSend(ctx, sw, &entity.Message{
				StateMessage: &entity.StateMessage{
					ExecuteID:      event.RootExecuteID,
					EventID:        event.GetResumedEventID(),
					Status:         entity.WorkflowInterrupted,
					InterruptEvent: firstIE,
				},
			}, nil)
		}

		return workflowAbort, nil
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

		if err = repo.CancelAllRunningNodes(ctx, exeID); err != nil {
			logs.CtxErrorf(ctx, err.Error())
		}

		if updatedRows, currentStatus, err = repo.UpdateWorkflowExecution(ctx, wfExec, []entity.WorkflowExecuteStatus{entity.WorkflowRunning,
			entity.WorkflowInterrupted}); err != nil {
			return noTerminate, fmt.Errorf("failed to save workflow execution when canceled: %v", err)
		} else if updatedRows == 0 {
			return noTerminate, fmt.Errorf("failed to update workflow execution to canceled for execution id %d, current status is %v", exeID, currentStatus)
		}

		if event.SubWorkflowCtx == nil {
			if sw != nil {
				safeSend(ctx, sw, &entity.Message{
					StateMessage: &entity.StateMessage{
						ExecuteID: event.RootExecuteID,
						EventID:   event.GetResumedEventID(),
						Status:    entity.WorkflowCancel,
						Usage:     wfExec.TokenInfo,
						LastError: vo.CancelErr,
					},
				}, nil)
			}
			return workflowAbort, nil
		}
	case WorkflowResume:
		if sw == nil || event.SubWorkflowCtx != nil {
			return noTerminate, nil
		}

		safeSend(ctx, sw, &entity.Message{
			StateMessage: &entity.StateMessage{
				ExecuteID: event.RootExecuteID,
				EventID:   event.GetResumedEventID(),
				SpaceID:   event.RootWorkflowBasic.SpaceID,
				Status:    entity.WorkflowRunning,
			},
		}, nil)
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
			Extra:     event.extra,
		}
		if event.BatchInfo != nil {
			nodeExec.Index = event.BatchInfo.Index
			nodeExec.Items = ptr.Of(mustMarshalToString(event.BatchInfo.Items))
			nodeExec.ParentNodeID = ptr.Of(string(event.BatchInfo.CompositeNodeKey))
		}
		if err = repo.CreateNodeExecution(ctx, nodeExec); err != nil {
			return noTerminate, fmt.Errorf("failed to create node execution: %v", err)
		}
	case NodeEnd, NodeEndStreaming:
		nodeExec := &entity.NodeExecution{
			ID:       event.NodeExecuteID,
			Status:   entity.NodeSuccess,
			Duration: event.Duration,
			TokenInfo: &entity.TokenUsage{
				InputTokens:  event.GetInputTokens(),
				OutputTokens: event.GetOutputTokens(),
			},
			Extra: event.extra,
		}

		if event.Err != nil {
			var wfe vo.WorkflowError
			if !errors.As(event.Err, &wfe) {
				panic("node end: event.Err is not a WorkflowError")
			}

			if cause := errors.Unwrap(event.Err); cause != nil {
				logs.CtxWarnf(ctx, "node %s for exeID %d end with warning: %v, cause: %v",
					event.NodeKey, event.NodeExecuteID, event.Err, cause)
			} else {
				logs.CtxWarnf(ctx, "node %s for exeID %d end with warning: %v",
					event.NodeKey, event.NodeExecuteID, event.Err)
			}
			nodeExec.ErrorInfo = ptr.Of(wfe.Msg())
			nodeExec.ErrorLevel = ptr.Of(string(wfe.Level()))
		}

		if event.outputExtractor != nil {
			nodeExec.Output = ptr.Of(event.outputExtractor(event.Output))
			nodeExec.RawOutput = ptr.Of(event.outputExtractor(event.RawOutput))
		} else {
			nodeExec.Output = ptr.Of(mustMarshalToString(event.Output))
			nodeExec.RawOutput = ptr.Of(mustMarshalToString(event.RawOutput))
		}

		fcInfos := getFCInfos(ctx, event.NodeKey)
		if len(fcInfos) > 0 {
			if nodeExec.Extra.ResponseExtra == nil {
				nodeExec.Extra.ResponseExtra = map[string]any{}
			}
			nodeExec.Extra.ResponseExtra["fc_called_detail"] = &entity.FCCalledDetail{
				FCCalledList: make([]*entity.FCCalled, 0, len(fcInfos)),
			}
			for _, fcInfo := range fcInfos {
				nodeExec.Extra.ResponseExtra["fc_called_detail"].(*entity.FCCalledDetail).FCCalledList = append(nodeExec.Extra.ResponseExtra["fc_called_detail"].(*entity.FCCalledDetail).FCCalledList, &entity.FCCalled{
					Input:  fcInfo.inputString(),
					Output: fcInfo.outputString(),
				})
			}
		}

		if event.Input != nil {
			nodeExec.Input = ptr.Of(mustMarshalToString(event.Input))
		}

		if event.NodeCtx.ResumingEvent != nil {
			firstIE, found, err := repo.GetFirstInterruptEvent(ctx, event.RootCtx.RootExecuteID)
			if err != nil {
				return noTerminate, err
			}

			if found && firstIE.ID == event.NodeCtx.ResumingEvent.ID {
				deletedEvent, deleted, err := repo.PopFirstInterruptEvent(ctx, event.RootCtx.RootExecuteID)
				if err != nil {
					return noTerminate, err
				}

				if !deleted {
					return noTerminate, fmt.Errorf("node end: interrupt events does not exist, wfExeID: %d", event.RootCtx.RootExecuteID)
				}

				if deletedEvent.ID != event.NodeCtx.ResumingEvent.ID {
					return noTerminate, fmt.Errorf("interrupt event id mismatch when deleting, expect: %d, actual: %d",
						event.RootCtx.ResumeEvent.ID, deletedEvent.ID)
				}
			}
		}

		if event.NodeCtx.SubWorkflowExeID > 0 {
			nodeExec.SubWorkflowExecution = &entity.WorkflowExecution{
				ID: event.NodeCtx.SubWorkflowExeID,
			}
		}

		if err = repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
			return noTerminate, fmt.Errorf("failed to save node execution: %v", err)
		}

		if sw != nil && event.Type == NodeEnd {
			var content string
			switch event.NodeType {
			case entity.NodeTypeOutputEmitter:
				content = event.Answer
			case entity.NodeTypeExit:
				if event.Context.SubWorkflowCtx != nil {
					// if the exit node belongs to a sub workflow, do not send data message
					return noTerminate, nil
				}

				if *event.Context.NodeCtx.TerminatePlan == vo.ReturnVariables {
					content = mustMarshalToString(event.Output)
				} else {
					content = event.Answer
				}
			default:
				return noTerminate, nil
			}

			safeSend(ctx, sw, &entity.Message{
				DataMessage: &entity.DataMessage{
					ExecuteID: event.RootExecuteID,
					Role:      schema.Assistant,
					Type:      entity.Answer,
					Content:   content,
					NodeID:    string(event.NodeKey),
					NodeType:  event.NodeType,
					NodeTitle: event.NodeName,
					Last:      true,
					Usage: ternary.IFElse(event.Token == nil, nil, &entity.TokenUsage{
						InputTokens:  event.GetInputTokens(),
						OutputTokens: event.GetOutputTokens(),
					}),
				},
			}, nil)
		}

		if event.NodeType == entity.NodeTypeExit && event.SubWorkflowCtx == nil {
			return lastNodeDone, nil
		}
	case NodeStreamingOutput:
		nodeExec := &entity.NodeExecution{
			ID:    event.NodeExecuteID,
			Extra: event.extra,
		}

		if event.outputExtractor != nil {
			nodeExec.Output = ptr.Of(event.outputExtractor(event.Output))
		} else {
			nodeExec.Output = ptr.Of(mustMarshalToString(event.Output))
		}

		if err = repo.UpdateNodeExecutionStreaming(ctx, nodeExec); err != nil {
			return noTerminate, fmt.Errorf("failed to save node execution: %v", err)
		}

		if sw == nil {
			return noTerminate, nil
		}

		if event.NodeType == entity.NodeTypeExit {
			if event.Context.SubWorkflowCtx != nil {
				return noTerminate, nil
			}
		} else if event.NodeType == entity.NodeTypeVariableAggregator {
			return noTerminate, nil
		}

		safeSend(ctx, sw, &entity.Message{
			DataMessage: &entity.DataMessage{
				ExecuteID: event.RootExecuteID,
				Role:      schema.Assistant,
				Type:      entity.Answer,
				Content:   event.Answer,
				NodeID:    string(event.NodeKey),
				NodeType:  event.NodeType,
				NodeTitle: event.NodeName,
				Last:      event.StreamEnd,
			},
		}, nil)
	case NodeStreamingInput:
		nodeExec := &entity.NodeExecution{
			ID:    event.NodeExecuteID,
			Input: ptr.Of(mustMarshalToString(event.Input)),
		}
		if err = repo.UpdateNodeExecution(ctx, nodeExec); err != nil {
			return noTerminate, fmt.Errorf("failed to save node execution: %v", err)
		}

	case NodeError:
		var errorInfo, errorLevel string
		var wfe vo.WorkflowError
		if !errors.As(event.Err, &wfe) {
			if errors.Is(event.Err, context.DeadlineExceeded) {
				wfe = vo.NodeTimeoutErr
			} else if errors.Is(event.Err, context.Canceled) {
				wfe = vo.CancelErr
			} else {
				wfe = vo.WrapError(errno.ErrWorkflowExecuteFail, event.Err, errorx.KV("cause", vo.UnwrapRootErr(event.Err).Error()))
			}
		}

		if cause := errors.Unwrap(event.Err); cause != nil {
			logs.CtxErrorf(ctx, "node %s for exeID %d returns err: %v, cause: %v",
				event.NodeKey, event.NodeExecuteID, event.Err, cause)
		} else {
			logs.CtxErrorf(ctx, "node %s for exeID %d returns err: %v",
				event.NodeKey, event.NodeExecuteID, event.Err)
		}

		errorInfo = wfe.Msg()[:min(1000, len(wfe.Msg()))]
		errorLevel = string(wfe.Level())

		if event.Context == nil || event.Context.NodeCtx == nil {
			return noTerminate, fmt.Errorf("nil event context")
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
			return noTerminate, fmt.Errorf("failed to save node execution: %v", err)
		}
	case FunctionCall:
		cacheFunctionCall(ctx, event)
		if sw == nil {
			return noTerminate, nil
		}
		safeSend(ctx, sw, &entity.Message{
			DataMessage: &entity.DataMessage{
				ExecuteID:    event.RootExecuteID,
				Role:         schema.Assistant,
				Type:         entity.FunctionCall,
				FunctionCall: event.functionCall,
			},
		}, nil)
	case ToolResponse:
		cacheToolResponse(ctx, event)
		if sw == nil {
			return noTerminate, nil
		}
		safeSend(ctx, sw, &entity.Message{
			DataMessage: &entity.DataMessage{
				ExecuteID:    event.RootExecuteID,
				Role:         schema.Tool,
				Type:         entity.ToolResponse,
				Last:         true,
				ToolResponse: event.toolResponse,
			},
		}, nil)
	case ToolStreamingResponse:
		cacheToolStreamingResponse(ctx, event)
		if sw == nil {
			return noTerminate, nil
		}
		safeSend(ctx, sw, &entity.Message{
			DataMessage: &entity.DataMessage{
				ExecuteID:    event.RootExecuteID,
				Role:         schema.Tool,
				Type:         entity.ToolResponse,
				Last:         event.StreamEnd,
				ToolResponse: event.toolResponse,
			},
		}, nil)
	case ToolError:
		// TODO: optimize this log
		logs.CtxErrorf(ctx, "received tool error event: %v", event)
	default:
		panic("unimplemented event type: " + event.Type)
	}

	return noTerminate, nil
}

type fcCacheKey struct{}
type fcInfo struct {
	input  *entity.FunctionCallInfo
	output *entity.ToolResponseInfo
}

func HandleExecuteEvent(ctx context.Context,
	wfExeID int64,
	eventChan <-chan *Event,
	cancelFn context.CancelFunc,
	timeoutFn context.CancelFunc,
	repo workflow.Repository,
	sw *schema.StreamWriter[*entity.Message],
	exeCfg vo.ExecuteConfig,
) (event *Event) {
	var (
		wfSuccessEvent *Event
		lastNodeIsDone bool
		cancelled      bool
	)

	ctx = context.WithValue(ctx, fcCacheKey{}, make(map[vo.NodeKey]map[string]*fcInfo))

	handler := func(event *Event) *Event {
		var (
			nodeType entity.NodeType
			nodeKey  vo.NodeKey
		)
		if event.Context.NodeCtx != nil {
			nodeType = event.Context.NodeCtx.NodeType
			nodeKey = event.Context.NodeCtx.NodeKey
		}

		logs.CtxInfof(ctx, "receiving event type= %v, workflowID= %v, nodeType= %v, nodeKey = %s",
			event.Type, event.RootWorkflowBasic.ID, nodeType, nodeKey)

		signal, err := handleEvent(ctx, event, repo, sw)
		if err != nil {
			logs.CtxErrorf(ctx, "failed to handle event: %v", err)
		}

		switch signal {
		case noTerminate:
			// continue to next event
		case workflowAbort:
			return event
		case workflowSuccess: // workflow success, wait for exit node to be done
			wfSuccessEvent = event
			if lastNodeIsDone || exeCfg.Mode == vo.ExecuteModeNodeDebug {
				if err = setRootWorkflowSuccess(ctx, wfSuccessEvent, repo, sw); err != nil {
					logs.CtxErrorf(ctx, "failed to set root workflow success for workflow %d: %v",
						wfSuccessEvent.RootWorkflowBasic.ID, err)
				}
				return wfSuccessEvent
			}
		case lastNodeDone: // exit node done, wait for workflow success
			lastNodeIsDone = true
			if wfSuccessEvent != nil {
				if err = setRootWorkflowSuccess(ctx, wfSuccessEvent, repo, sw); err != nil {
					logs.CtxErrorf(ctx, "failed to set root workflow success: %v", err)
				}
				return wfSuccessEvent
			}
		default:
		}

		return nil
	}

	if exeCfg.Cancellable {
		// Add cancellation check timer
		cancelTicker := time.NewTicker(cancelCheckInterval)
		defer func() {
			if event != nil && event.Context != nil && event.Context.RootWorkflowBasic != nil {
				logs.CtxInfof(ctx, "[handleExecuteEvent] finish, returned event type: %v, workflow id: %d",
					event.Type, event.Context.RootWorkflowBasic.ID)
			} else {
				logs.CtxInfof(ctx, "[handleExecuteEvent] finish, no event or workflow context available, workflow id: %d", wfExeID)
			}
			cancelTicker.Stop() // Clean up timer
			if timeoutFn != nil {
				timeoutFn()
			}
			cancelFn()
		}()

		for {
			select {
			case <-cancelTicker.C:
				if cancelled {
					continue
				}

				// Check cancellation status in Redis
				isCancelled, err := repo.GetWorkflowCancelFlag(ctx, wfExeID)
				if err != nil {
					logs.CtxErrorf(ctx, "failed to check cancellation status for workflow %d: %v", wfExeID, err)
					continue
				}

				if isCancelled {
					cancelled = true
					logs.CtxInfof(ctx, "workflow %d cancellation detected", wfExeID)
					cancelFn()
				}
			case event = <-eventChan:
				if terminalE := handler(event); terminalE != nil {
					return terminalE
				}
			}
		}
	} else {
		defer func() {
			if event != nil && event.Context != nil && event.Context.RootWorkflowBasic != nil {
				logs.CtxInfof(ctx, "[handleExecuteEvent] finish, returned event type: %v, workflow id: %d",
					event.Type, event.Context.RootWorkflowBasic.ID)
			} else {
				logs.CtxInfof(ctx, "[handleExecuteEvent] finish, no event or workflow context available, workflow id: %d", wfExeID)
			}
			if timeoutFn != nil {
				timeoutFn()
			}
			cancelFn()
		}()

		for e := range eventChan {
			event = e // Assign to function-scoped variable so defer can access it
			if terminalE := handler(e); terminalE != nil {
				return terminalE
			}
		}
	}

	panic("unreachable")
}

func mustMarshalToString[T any](m map[string]T) string {
	if len(m) == 0 {
		return "{}"
	}

	b, err := sonic.ConfigStd.MarshalToString(m) // keep the order of the keys
	if err != nil {
		panic(err)
	}
	return b
}

func cacheFunctionCall(ctx context.Context, event *Event) {
	c := ctx.Value(fcCacheKey{}).(map[vo.NodeKey]map[string]*fcInfo)
	if _, ok := c[event.NodeKey]; !ok {
		c[event.NodeKey] = make(map[string]*fcInfo)
	}
	c[event.NodeKey][event.functionCall.CallID] = &fcInfo{
		input: event.functionCall,
	}
}

func cacheToolResponse(ctx context.Context, event *Event) {
	c := ctx.Value(fcCacheKey{}).(map[vo.NodeKey]map[string]*fcInfo)
	if _, ok := c[event.NodeKey]; !ok {
		c[event.NodeKey] = make(map[string]*fcInfo)
	}

	c[event.NodeKey][event.toolResponse.CallID].output = event.toolResponse
}

func cacheToolStreamingResponse(ctx context.Context, event *Event) {
	c := ctx.Value(fcCacheKey{}).(map[vo.NodeKey]map[string]*fcInfo)
	if _, ok := c[event.NodeKey]; !ok {
		c[event.NodeKey] = make(map[string]*fcInfo)
	}
	if c[event.NodeKey][event.toolResponse.CallID].output == nil {
		c[event.NodeKey][event.toolResponse.CallID].output = event.toolResponse
	}
	c[event.NodeKey][event.toolResponse.CallID].output.Response += event.toolResponse.Response
}

func getFCInfos(ctx context.Context, nodeKey vo.NodeKey) map[string]*fcInfo {
	c := ctx.Value(fcCacheKey{}).(map[vo.NodeKey]map[string]*fcInfo)
	return c[nodeKey]
}

func (f *fcInfo) inputString() string {
	if f.input == nil {
		return ""
	}

	m, err := sonic.MarshalString(f.input)

	if err != nil {
		panic(err)
	}
	return m
}

func (f *fcInfo) outputString() string {
	if f.output == nil {
		return ""
	}

	return f.output.Response
}
