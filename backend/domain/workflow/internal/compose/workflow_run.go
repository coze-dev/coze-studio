package compose

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	einoCompose "github.com/cloudwego/eino/compose"

	wf "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func Prepare(ctx context.Context,
	in string,
	id entity.WorkflowIdentity,
	spaceID int64,
	projectID *int64,
	executeID int64,
	eventID int64,
	resumeData string,
	repo wf.Repository,
	sc *WorkflowSchema,
) (
	context.Context,
	int64,
	[]einoCompose.Option,
	error,
) {
	var err error

	if executeID == 0 {
		executeID, err = wf.GetRepository().GenID(ctx)
		if err != nil {
			return ctx, 0, nil, fmt.Errorf("failed to generate workflow execute ID: %w", err)
		}
	}

	eventChan := make(chan *execute.Event)

	var (
		interruptEvent *entity.InterruptEvent
		found          bool
	)

	if eventID != 0 {
		interruptEvent, found, err = repo.GetFirstInterruptEvent(ctx, executeID)
		if err != nil {
			return ctx, 0, nil, err
		}

		if !found {
			return ctx, 0, nil, fmt.Errorf("interrupt event does not exist, id: %d", eventID)
		}

		if interruptEvent.ID != eventID {
			return ctx, 0, nil, fmt.Errorf("interrupt event id mismatch, expect: %d, actual: %d", eventID, interruptEvent.ID)
		}

	}

	composeOpts := DesignateOptions(id.ID, spaceID, id.Version, projectID,
		sc, executeID, eventChan, interruptEvent)

	if interruptEvent != nil {
		var stateOpt einoCompose.Option
		stateModifier := GenStateModifierByEventType(interruptEvent.EventType,
			interruptEvent.NodeKey, resumeData)

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
					return ctx, 0, nil, fmt.Errorf("failed to parse index: %w", err)
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
						return ctx, 0, nil, fmt.Errorf("failed to parse index: %w", err)
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

		deletedEvent, deleted, err := repo.PopFirstInterruptEvent(ctx, executeID)
		if err != nil {
			return ctx, 0, nil, err
		}

		if !deleted {
			return ctx, 0, nil, fmt.Errorf("interrupt events does not exist, wfExeID: %d", executeID)
		}

		if deletedEvent.ID != eventID {
			return ctx, 0, nil, fmt.Errorf("interrupt event id mismatch when deleting, expect: %d, actual: %d",
				eventID, deletedEvent.ID)
		}

		success, currentStatus, err := repo.TryLockWorkflowExecution(ctx, executeID, eventID)
		if err != nil {
			return ctx, 0, nil, fmt.Errorf("try lock workflow execution unexpected err: %w", err)
		}

		if !success {
			return ctx, 0, nil, fmt.Errorf("workflow execution lock failed, current status is %v, executeID: %d", currentStatus, executeID)
		}

		fmt.Println("resume workflow with event: ", deletedEvent)
	}

	if interruptEvent == nil {
		wfExec := &entity.WorkflowExecution{
			ID:               executeID,
			WorkflowIdentity: id,
			SpaceID:          spaceID,
			// TODO: how to know whether it's a debug run or release run? Version alone is not sufficient.
			// TODO: fill operator information
			Status:          entity.WorkflowRunning,
			Input:           ptr.Of(in),
			RootExecutionID: executeID,
			ProjectID:       projectID,
			NodeCount:       int32(len(sc.GetAllNodes())),
		}

		if err = repo.CreateWorkflowExecution(ctx, wfExec); err != nil {
			return ctx, 0, nil, err
		}
	}

	cancelSignalChan, clearFn, err := repo.SubscribeWorkflowCancelSignal(ctx, executeID)
	if err != nil {
		return ctx, 0, nil, err
	}

	cancelCtx, cancelFn := context.WithCancel(ctx)

	go func() {
		// this goroutine should not use the cancelCtx because it needs to be alive to receive workflow cancel events
		execute.HandleExecuteEvent(ctx, eventChan, cancelFn, cancelSignalChan, clearFn, wf.GetRepository())
	}()

	return cancelCtx, executeID, composeOpts, nil
}
