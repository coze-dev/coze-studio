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

package compose

import (
	"context"
	"fmt"
	"runtime/debug"
	"strconv"
	"strings"

	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	wf "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/qa"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type WorkflowRunner struct {
	basic        *entity.WorkflowBasic
	input        string
	resumeReq    *entity.ResumeRequest
	schema       *schema2.WorkflowSchema
	streamWriter *schema.StreamWriter[*entity.Message]
	config       vo.ExecuteConfig

	executeID      int64
	eventChan      chan *execute.Event
	interruptEvent *entity.InterruptEvent
}

type workflowRunOptions struct {
	input              string
	resumeReq          *entity.ResumeRequest
	streamWriter       *schema.StreamWriter[*entity.Message]
	rootTokenCollector *execute.TokenCollector
}

type WorkflowRunnerOption func(*workflowRunOptions)

func WithInput(input string) WorkflowRunnerOption {
	return func(opts *workflowRunOptions) {
		opts.input = input
	}
}
func WithResumeReq(resumeReq *entity.ResumeRequest) WorkflowRunnerOption {
	return func(opts *workflowRunOptions) {
		opts.resumeReq = resumeReq
	}
}
func WithStreamWriter(sw *schema.StreamWriter[*entity.Message]) WorkflowRunnerOption {
	return func(opts *workflowRunOptions) {
		opts.streamWriter = sw
	}
}

func NewWorkflowRunner(b *entity.WorkflowBasic, sc *schema2.WorkflowSchema, config vo.ExecuteConfig, opts ...WorkflowRunnerOption) *WorkflowRunner {
	options := &workflowRunOptions{}
	for _, opt := range opts {
		opt(options)
	}

	return &WorkflowRunner{
		basic:        b,
		input:        options.input,
		resumeReq:    options.resumeReq,
		schema:       sc,
		streamWriter: options.streamWriter,
		config:       config,
	}
}

func (r *WorkflowRunner) Prepare(ctx context.Context) (
	context.Context,
	int64,
	[]einoCompose.Option,
	<-chan *execute.Event,
	error,
) {
	var (
		err       error
		executeID int64
		repo      = wf.GetRepository()
		resumeReq = r.resumeReq
		wb        = r.basic
		sc        = r.schema
		sw        = r.streamWriter
		config    = r.config
	)

	if r.resumeReq == nil {
		executeID, err = repo.GenID(ctx)
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

	r.executeID = executeID
	r.eventChan = eventChan
	r.interruptEvent = interruptEvent

	ctx, composeOpts, err := r.designateOptions(ctx)
	if err != nil {
		return ctx, 0, nil, nil, err
	}

	if interruptEvent != nil {
		var stateOpt einoCompose.Option
		stateModifier := GenStateModifierByEventType(interruptEvent.EventType,
			interruptEvent.NodeKey, resumeReq.ResumeData, r.config)

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
		} else if interruptEvent.EventType == entity.InterruptEventLLM &&
			interruptEvent.ToolInterruptEvent.EventType == entity.InterruptEventQuestion {
			modifiedData, err := qa.AppendInterruptData(interruptEvent.ToolInterruptEvent.InterruptData, resumeReq.ResumeData)
			if err != nil {
				return ctx, 0, nil, nil, fmt.Errorf("failed to append interrupt data for LLM node: %w", err)
			}
			interruptEvent.ToolInterruptEvent.InterruptData = modifiedData
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
		var logID string
		logID, _ = ctx.Value("log-id").(string)

		wfExec := &entity.WorkflowExecution{
			ID:                     executeID,
			WorkflowID:             wb.ID,
			Version:                wb.Version,
			SpaceID:                wb.SpaceID,
			ExecuteConfig:          config,
			Status:                 entity.WorkflowRunning,
			Input:                  ptr.Of(r.input),
			RootExecutionID:        executeID,
			NodeCount:              sc.NodeCount(),
			CurrentResumingEventID: ptr.Of(int64(0)),
			CommitID:               wb.CommitID,
			LogID:                  logID,
		}

		if err = repo.CreateWorkflowExecution(ctx, wfExec); err != nil {
			return ctx, 0, nil, nil, err
		}
	}

	cancelCtx, cancelFn := context.WithCancel(ctx)
	var timeoutFn context.CancelFunc
	if s := execute.GetStaticConfig(); s != nil {
		timeout := ternary.IFElse(config.TaskType == vo.TaskTypeBackground, s.BackgroundRunTimeout, s.ForegroundRunTimeout)
		if timeout > 0 {
			cancelCtx, timeoutFn = context.WithTimeout(cancelCtx, timeout)
		}
	}

	lastEventChan := make(chan *execute.Event, 1)
	go func() {
		defer func() {
			if panicErr := recover(); panicErr != nil {
				logs.CtxErrorf(ctx, "panic when handling execute event: %v", safego.NewPanicErr(panicErr, debug.Stack()))
			}
		}()
		defer func() {
			if sw != nil {
				// Safely close the stream writer by recovering from any potential panic
				// This prevents "close of closed channel" panics in concurrent scenarios
				func() {
					defer func() {
						if closeErr := recover(); closeErr != nil {
							logs.CtxDebugf(ctx, "stream writer already closed: %v", closeErr)
						}
					}()
					sw.Close()
				}()
			}
		}()

		// this goroutine should not use the cancelCtx because it needs to be alive to receive workflow cancel events
		lastEventChan <- execute.HandleExecuteEvent(ctx, executeID, eventChan, cancelFn, timeoutFn,
			repo, sw, config)
		close(lastEventChan)
	}()

	return cancelCtx, executeID, composeOpts, lastEventChan, nil
}
