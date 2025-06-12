package compose

import (
	"context"
	"fmt"
	"runtime/debug"
	"strconv"
	"strings"

	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	wf "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/qa"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/safego"
)

func Prepare(ctx context.Context,
	in string,
	wb *entity.WorkflowBasic,
	resumeReq *entity.ResumeRequest,
	repo wf.Repository,
	sc *WorkflowSchema,
	sw *schema.StreamWriter[*entity.Message],
	config vo.ExecuteConfig,
) (
	context.Context,
	int64,
	[]einoCompose.Option,
	<-chan *execute.Event,
	error,
) {
	var (
		err       error
		executeID int64
	)

	if resumeReq == nil {
		executeID, err = wf.GetRepository().GenID(ctx)
		if err != nil {
			return ctx, 0, nil, nil, fmt.Errorf("failed to generate workflow execute ID: %w", err)
		}
	} else {
		executeID = resumeReq.ExecuteID
	}

	eventChan := make(chan *execute.Event)

	var (
		interruptEvent *entity.InterruptEvent
		found          bool
	)

	if resumeReq != nil {
		interruptEvent, found, err = repo.GetFirstInterruptEvent(ctx, executeID)
		if err != nil {
			return ctx, 0, nil, nil, err
		}

		if !found {
			return ctx, 0, nil, nil, fmt.Errorf("interrupt event does not exist, id: %d", resumeReq.EventID)
		}

		if interruptEvent.ID != resumeReq.EventID {
			return ctx, 0, nil, nil, fmt.Errorf("interrupt event id mismatch, expect: %d, actual: %d", resumeReq.EventID, interruptEvent.ID)
		}

	}

	composeOpts, err := DesignateOptions(ctx, wb, sc, executeID, eventChan, interruptEvent, sw, config)
	if err != nil {
		return ctx, 0, nil, nil, err
	}

	if interruptEvent != nil {
		var stateOpt einoCompose.Option
		stateModifier := GenStateModifierByEventType(interruptEvent.EventType,
			interruptEvent.NodeKey, resumeReq.ResumeData)

		if len(interruptEvent.NodePath) == 1 {
			// this interrupt event is within the top level workflow
			stateOpt = einoCompose.WithStateModifier(stateModifier)
		} else {
			currentI := len(interruptEvent.NodePath) - 2
			path := interruptEvent.NodePath[currentI]
			if strings.HasPrefix(path, execute.InterruptEventIndexPrefix) {
				// this interrupt event is within a composite node
				indexStr := path[len(execute.InterruptEventIndexPrefix):]
				index, err := strconv.Atoi(indexStr)
				if err != nil {
					return ctx, 0, nil, nil, fmt.Errorf("failed to parse index: %w", err)
				}

				currentI--
				parentNodeKey := interruptEvent.NodePath[currentI]
				stateOpt = einoCompose.WithLambdaOption(
					nodes.WithResumeIndex(index, stateModifier)).DesignateNode(parentNodeKey)
			} else { // this interrupt event is within a sub workflow
				subWorkflowNodeKey := interruptEvent.NodePath[currentI]
				stateOpt = einoCompose.WithLambdaOption(
					nodes.WithResumeIndex(0, stateModifier)).DesignateNode(subWorkflowNodeKey)
			}

			for i := currentI - 1; i >= 0; i-- {
				path := interruptEvent.NodePath[i]
				if strings.HasPrefix(path, execute.InterruptEventIndexPrefix) {
					indexStr := path[len(execute.InterruptEventIndexPrefix):]
					index, err := strconv.Atoi(indexStr)
					if err != nil {
						return ctx, 0, nil, nil, fmt.Errorf("failed to parse index: %w", err)
					}

					i--
					parentNodeKey := interruptEvent.NodePath[i]
					stateOpt = WrapOptWithIndex(stateOpt, vo.NodeKey(parentNodeKey), index)
				} else {
					stateOpt = WrapOpt(stateOpt, vo.NodeKey(path))
				}
			}
		}

		composeOpts = append(composeOpts, stateOpt)

		if interruptEvent.EventType == entity.InterruptEventQuestion {
			modifiedData, err := qa.AppendInterruptData(interruptEvent.InterruptData, resumeReq.ResumeData)
			if err != nil {
				return ctx, 0, nil, nil, fmt.Errorf("failed to append interrupt data: %w", err)
			}
			interruptEvent.InterruptData = modifiedData
			if err = repo.UpdateFirstInterruptEvent(ctx, executeID, interruptEvent); err != nil {
				return ctx, 0, nil, nil, fmt.Errorf("failed to update interrupt event: %w", err)
			}
		}

		success, currentStatus, err := repo.TryLockWorkflowExecution(ctx, executeID, resumeReq.EventID)
		if err != nil {
			return ctx, 0, nil, nil, fmt.Errorf("try lock workflow execution unexpected err: %w", err)
		}

		if !success {
			return ctx, 0, nil, nil, fmt.Errorf("workflow execution lock failed, current status is %v, executeID: %d", currentStatus, executeID)
		}

		logs.CtxInfof(ctx, "resuming with eventID: %d, executeID: %d, nodeKey: %s", interruptEvent.ID,
			executeID, interruptEvent.NodeKey)
	}

	if interruptEvent == nil {
		wfExec := &entity.WorkflowExecution{
			ID:                     executeID,
			WorkflowIdentity:       wb.WorkflowIdentity,
			SpaceID:                wb.SpaceID,
			ExecuteConfig:          config,
			Status:                 entity.WorkflowRunning,
			Input:                  ptr.Of(in),
			RootExecutionID:        executeID,
			NodeCount:              wb.NodeCount,
			CurrentResumingEventID: ptr.Of(int64(0)),
		}

		if err = repo.CreateWorkflowExecution(ctx, wfExec); err != nil {
			return ctx, 0, nil, nil, err
		}
	}

	cancelSignalChan, clearFn, err := repo.SubscribeWorkflowCancelSignal(ctx, executeID)
	if err != nil {
		return ctx, 0, nil, nil, err
	}

	cancelCtx, cancelFn := context.WithCancel(ctx)
	var timeoutFn context.CancelFunc
	if s := execute.GetStaticConfig(); s != nil {
		timeout := ternary.IFElse(config.TaskType == vo.TaskTypeBackground, s.BackgroundRunTimeout, s.ForegroundRunTimeout)
		if timeout > 0 {
			cancelCtx, timeoutFn = context.WithTimeout(cancelCtx, timeout)
		}
	}

	cancelCtx = execute.InitExecutedNodesCounter(cancelCtx)

	lastEventChan := make(chan *execute.Event, 1)
	go func() {
		defer func() {
			if panicErr := recover(); panicErr != nil {
				logs.CtxErrorf(ctx, "panic when handling execute event: %v", safego.NewPanicErr(panicErr, debug.Stack()))
			}
		}()
		defer func() {
			if sw != nil {
				sw.Close()
			}
		}()

		// this goroutine should not use the cancelCtx because it needs to be alive to receive workflow cancel events
		lastEventChan <- execute.HandleExecuteEvent(ctx, eventChan, cancelFn, timeoutFn,
			cancelSignalChan, clearFn, wf.GetRepository(), sw, config)
		close(lastEventChan)
	}()

	return cancelCtx, executeID, composeOpts, lastEventChan, nil
}
