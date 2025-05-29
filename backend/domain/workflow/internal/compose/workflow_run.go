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
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/llm"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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
	error,
) {
	var (
		err       error
		executeID int64
	)

	if resumeReq == nil {
		executeID, err = wf.GetRepository().GenID(ctx)
		if err != nil {
			return ctx, 0, nil, fmt.Errorf("failed to generate workflow execute ID: %w", err)
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
			return ctx, 0, nil, err
		}

		if !found {
			return ctx, 0, nil, fmt.Errorf("interrupt event does not exist, id: %d", resumeReq.EventID)
		}

		if interruptEvent.ID != resumeReq.EventID {
			return ctx, 0, nil, fmt.Errorf("interrupt event id mismatch, expect: %d, actual: %d", resumeReq.EventID, interruptEvent.ID)
		}

	}

	composeOpts, err := DesignateOptions(ctx, wb, sc, executeID, eventChan, interruptEvent, sw, config)
	if err != nil {
		return ctx, 0, nil, err
	}

	if interruptEvent != nil {
		if interruptEvent.ToolWorkflowExecuteID == 0 {
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
		} else {
			if len(interruptEvent.NodePath) == 0 {
				panic("impossible: resuming tool interrupt, resume path is empty")
			}

			// this interrupt event is within the workflow tool under LLM Node, no need to generate StateModifier
			// instead, generate the tool.Option that carries the ResumeRequest for the tool workflow
			resumeOpt := einoCompose.WithToolsNodeOption(
				einoCompose.WithToolOption(
					execute.WithResume(
						&entity.ResumeRequest{
							ExecuteID:  interruptEvent.ToolWorkflowExecuteID,
							EventID:    interruptEvent.ID,
							ResumeData: resumeReq.ResumeData,
						})))
			resumeOpt = einoCompose.WithLambdaOption(
				llm.WithNestedWorkflowOptions(
					nodes.WithOptsForNested(resumeOpt))).
				DesignateNode(interruptEvent.NodePath[len(interruptEvent.NodePath)-1])
			if len(interruptEvent.NodePath) > 1 {
				for i := len(interruptEvent.NodePath) - 2; i >= 0; i-- {
					path := interruptEvent.NodePath[i]
					if strings.HasPrefix(path, execute.InterruptEventIndexPrefix) {
						indexStr := path[len(execute.InterruptEventIndexPrefix):]
						index, err := strconv.Atoi(indexStr)
						if err != nil {
							return ctx, 0, nil, fmt.Errorf("failed to parse index: %w", err)
						}

						i--
						parentNodeKey := interruptEvent.NodePath[i]
						resumeOpt = WrapOptWithIndex(resumeOpt, vo.NodeKey(parentNodeKey), index)
					} else {
						resumeOpt = WrapOpt(resumeOpt, vo.NodeKey(path))
					}
				}
			}

			composeOpts = append(composeOpts, resumeOpt)
		}

		deletedEvent, deleted, err := repo.PopFirstInterruptEvent(ctx, executeID)
		if err != nil {
			return ctx, 0, nil, err
		}

		if !deleted {
			return ctx, 0, nil, fmt.Errorf("interrupt events does not exist, wfExeID: %d", executeID)
		}

		if deletedEvent.ID != resumeReq.EventID {
			return ctx, 0, nil, fmt.Errorf("interrupt event id mismatch when deleting, expect: %d, actual: %d",
				resumeReq.EventID, deletedEvent.ID)
		}

		success, currentStatus, err := repo.TryLockWorkflowExecution(ctx, executeID, resumeReq.EventID)
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
			WorkflowIdentity: wb.WorkflowIdentity,
			SpaceID:          wb.SpaceID,
			ExecuteConfig:    config,
			Status:           entity.WorkflowRunning,
			Input:            ptr.Of(in),
			RootExecutionID:  executeID,
			ProjectID:        wb.ProjectID,
			NodeCount:        wb.NodeCount,
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
		execute.HandleExecuteEvent(ctx, eventChan, cancelFn, cancelSignalChan, clearFn, wf.GetRepository(), sw)
	}()

	return cancelCtx, executeID, composeOpts, nil
}
