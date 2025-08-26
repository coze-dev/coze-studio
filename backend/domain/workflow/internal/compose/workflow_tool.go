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
	"strings"

	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	wf "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

const answerKey = "output"

type invokableWorkflow struct {
	workflowTool
	invoke func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (map[string]any, error)
}

type workflowTool struct {
	info          *schema.ToolInfo
	wfEntity      *entity.Workflow
	sc            *schema2.WorkflowSchema
	repo          wf.Repository
	terminatePlan vo.TerminatePlan
}

func NewInvokableWorkflow(info *schema.ToolInfo,
	invoke func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (map[string]any, error),
	terminatePlan vo.TerminatePlan,
	wfEntity *entity.Workflow,
	sc *schema2.WorkflowSchema,
	repo wf.Repository,
) wf.ToolFromWorkflow {
	return &invokableWorkflow{
		workflowTool: workflowTool{
			info:          info,
			wfEntity:      wfEntity,
			sc:            sc,
			repo:          repo,
			terminatePlan: terminatePlan,
		},
		invoke: invoke,
	}
}

func (i *invokableWorkflow) Info(_ context.Context) (*schema.ToolInfo, error) {
	return i.info, nil
}

func resumeOnce(rInfo *entity.ResumeRequest, callID string, allIEs map[string]*entity.ToolInterruptEvent) {
	if rInfo != nil {
		rInfo.Resumed = true
	}

	if allIEs != nil {
		delete(allIEs, callID)
	}
}

func (wt *workflowTool) prepare(ctx context.Context, rInfo *entity.ResumeRequest, argumentsInJSON string, opts ...tool.Option) (
	cancelCtx context.Context, executeID int64, input map[string]any, callOpts []einoCompose.Option, err error) {
	cfg := execute.GetExecuteConfig(opts...)

	var runOpts []WorkflowRunnerOption
	if rInfo != nil && !rInfo.Resumed {
		runOpts = append(runOpts, WithResumeReq(rInfo))
	} else {
		runOpts = append(runOpts, WithInput(argumentsInJSON))
	}
	if container := execute.GetParentStreamContainer(opts...); container != nil {
		sr, sw := schema.Pipe[*entity.Message](10)
		container.AddChild(sr)
		runOpts = append(runOpts, WithStreamWriter(sw))
	}

	var ws *nodes.ConversionWarnings

	if (rInfo == nil || rInfo.Resumed) && len(wt.wfEntity.InputParams) > 0 {
		if err = sonic.UnmarshalString(argumentsInJSON, &input); err != nil {
			err = vo.WrapError(errno.ErrSerializationDeserializationFail, err)
			return
		}

		var entryNode *schema2.NodeSchema
		for _, node := range wt.sc.Nodes {
			if node.Type == entity.NodeTypeEntry {
				entryNode = node
				break
			}
		}
		if entryNode == nil {
			panic("entry node not found in tool workflow")
		}
		input, ws, err = nodes.ConvertInputs(ctx, input, entryNode.OutputTypes)
		if err != nil {
			return
		} else if ws != nil {
			logs.CtxWarnf(ctx, "convert inputs warnings: %v", *ws)
		}
	}

	cancelCtx, executeID, callOpts, _, err = NewWorkflowRunner(wt.wfEntity.GetBasic(), wt.sc, cfg, runOpts...).Prepare(ctx)
	return
}

func (i *invokableWorkflow) InvokableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (string, error) {
	rInfo, allIEs := execute.GetResumeRequest(opts...)
	var (
		previouslyInterrupted bool
		callID                = einoCompose.GetToolCallID(ctx)
		previousExecuteID     int64
	)
	for interruptedCallID := range allIEs {
		if callID == interruptedCallID {
			previouslyInterrupted = true
			previousExecuteID = allIEs[interruptedCallID].ExecuteID
			break
		}
	}

	if previouslyInterrupted && rInfo.ExecuteID != previousExecuteID {
		logs.Infof("previous interrupted call ID: %s, previous execute ID: %d, current execute ID: %d. Not resuming, interrupt immediately", callID, previousExecuteID, rInfo.ExecuteID)
		return "", einoCompose.InterruptAndRerun
	}

	defer resumeOnce(rInfo, callID, allIEs)

	cancelCtx, executeID, in, callOpts, err := i.prepare(ctx, rInfo, argumentsInJSON, opts...)
	if err != nil {
		return "", err
	}

	out, err := i.invoke(cancelCtx, in, callOpts...)
	if err != nil {
		if _, ok := einoCompose.ExtractInterruptInfo(err); ok {
			firstIE, found, err := i.repo.GetFirstInterruptEvent(ctx, executeID)
			if err != nil {
				return "", err
			}
			if !found {
				return "", fmt.Errorf("interrupt event does not exist, wfExeID: %d", executeID)
			}

			return "", einoCompose.NewInterruptAndRerunErr(&entity.ToolInterruptEvent{
				ToolCallID:     einoCompose.GetToolCallID(ctx),
				ToolName:       i.info.Name,
				ExecuteID:      executeID,
				InterruptEvent: firstIE,
			})
		}
		return "", err
	}

	if i.terminatePlan == vo.ReturnVariables {
		return sonic.MarshalString(out)
	}

	content, ok := out[answerKey]
	if !ok {
		return "", fmt.Errorf("no answer found when terminate plan is use answer content. out: %v", out)
	}

	contentStr, ok := content.(string)
	if !ok {
		return "", fmt.Errorf("answer content is not string. content: %v", content)
	}

	if strings.HasSuffix(contentStr, nodes.KeyIsFinished) {
		contentStr = strings.TrimSuffix(contentStr, nodes.KeyIsFinished)
	}

	return contentStr, nil
}

func (i *invokableWorkflow) TerminatePlan() vo.TerminatePlan {
	return i.terminatePlan
}

func (i *invokableWorkflow) GetWorkflow() *entity.Workflow {
	return i.wfEntity
}

type streamableWorkflow struct {
	workflowTool
	stream func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error)
}

func NewStreamableWorkflow(info *schema.ToolInfo,
	stream func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error),
	terminatePlan vo.TerminatePlan,
	wfEntity *entity.Workflow,
	sc *schema2.WorkflowSchema,
	repo wf.Repository,
) wf.ToolFromWorkflow {
	return &streamableWorkflow{
		workflowTool: workflowTool{
			info:          info,
			wfEntity:      wfEntity,
			sc:            sc,
			repo:          repo,
			terminatePlan: terminatePlan,
		},
		stream: stream,
	}
}

func (s *streamableWorkflow) Info(_ context.Context) (*schema.ToolInfo, error) {
	return s.info, nil
}

func (s *streamableWorkflow) StreamableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (*schema.StreamReader[string], error) {
	rInfo, allIEs := execute.GetResumeRequest(opts...)
	var (
		previouslyInterrupted bool
		callID                = einoCompose.GetToolCallID(ctx)
		previousExecuteID     int64
	)
	for interruptedCallID := range allIEs {
		if callID == interruptedCallID {
			previouslyInterrupted = true
			previousExecuteID = allIEs[interruptedCallID].ExecuteID
			break
		}
	}

	if previouslyInterrupted && rInfo.ExecuteID != previousExecuteID {
		logs.Infof("previous interrupted call ID: %s, previous execute ID: %d, current execute ID: %d. Not resuming, interrupt immediately", callID, previousExecuteID, rInfo.ExecuteID)
		return nil, einoCompose.InterruptAndRerun
	}

	defer resumeOnce(rInfo, callID, allIEs)

	cancelCtx, executeID, in, callOpts, err := s.prepare(ctx, rInfo, argumentsInJSON, opts...)
	if err != nil {
		return nil, err
	}

	outStream, err := s.stream(cancelCtx, in, callOpts...)
	if err != nil {
		if _, ok := einoCompose.ExtractInterruptInfo(err); ok {
			firstIE, found, err := s.repo.GetFirstInterruptEvent(ctx, executeID)
			if err != nil {
				return nil, err
			}
			if !found {
				return nil, fmt.Errorf("interrupt event does not exist, wfExeID: %d", executeID)
			}

			return nil, einoCompose.NewInterruptAndRerunErr(&entity.ToolInterruptEvent{
				ToolCallID:     einoCompose.GetToolCallID(ctx),
				ToolName:       s.info.Name,
				ExecuteID:      executeID,
				InterruptEvent: firstIE,
			})
		}
		return nil, err
	}

	return schema.StreamReaderWithConvert(outStream, func(in map[string]any) (string, error) {
		content, ok := in["output"]
		if !ok {
			return "", fmt.Errorf("no output found when stream plan is use output content. out: %v", in)
		}

		contentStr, ok := content.(string)
		if !ok {
			return "", fmt.Errorf("output content is not string. content: %v", content)
		}

		if strings.HasSuffix(contentStr, nodes.KeyIsFinished) {
			contentStr = strings.TrimSuffix(contentStr, nodes.KeyIsFinished)
		}

		return contentStr, nil
	}), nil
}

func (s *streamableWorkflow) TerminatePlan() vo.TerminatePlan {
	return s.terminatePlan
}

func (s *streamableWorkflow) GetWorkflow() *entity.Workflow {
	return s.wfEntity
}
