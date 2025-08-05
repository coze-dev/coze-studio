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
)

const answerKey = "output"

type invokableWorkflow struct {
	info          *schema.ToolInfo
	invoke        func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (map[string]any, error)
	terminatePlan vo.TerminatePlan
	wfEntity      *entity.Workflow
	sc            *schema2.WorkflowSchema
	repo          wf.Repository
}

func NewInvokableWorkflow(info *schema.ToolInfo,
	invoke func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (map[string]any, error),
	terminatePlan vo.TerminatePlan,
	wfEntity *entity.Workflow,
	sc *schema2.WorkflowSchema,
	repo wf.Repository,
) wf.ToolFromWorkflow {
	return &invokableWorkflow{
		info:          info,
		invoke:        invoke,
		terminatePlan: terminatePlan,
		wfEntity:      wfEntity,
		sc:            sc,
		repo:          repo,
	}
}

func (i *invokableWorkflow) Info(_ context.Context) (*schema.ToolInfo, error) {
	return i.info, nil
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

	cfg := execute.GetExecuteConfig(opts...)

	var runOpts []WorkflowRunnerOption
	if rInfo != nil {
		runOpts = append(runOpts, WithResumeReq(rInfo))
	} else {
		runOpts = append(runOpts, WithInput(argumentsInJSON))
	}
	if sw := execute.GetIntermediateStreamWriter(opts...); sw != nil {
		runOpts = append(runOpts, WithStreamWriter(sw))
	}

	var (
		cancelCtx context.Context
		executeID int64
		callOpts  []einoCompose.Option
		in        map[string]any
		err       error
		ws        *nodes.ConversionWarnings
	)

	if rInfo == nil {
		if err = sonic.UnmarshalString(argumentsInJSON, &in); err != nil {
			return "", err
		}

		var entryNode *schema2.NodeSchema
		for _, node := range i.sc.Nodes {
			if node.Type == entity.NodeTypeEntry {
				entryNode = node
				break
			}
		}
		if entryNode == nil {
			panic("entry node not found in tool workflow")
		}
		in, ws, err = nodes.ConvertInputs(ctx, in, entryNode.OutputTypes)
		if err != nil {
			return "", err
		} else if ws != nil {
			logs.CtxWarnf(ctx, "convert inputs warnings: %v", *ws)
		}
	}

	cancelCtx, executeID, callOpts, _, err = NewWorkflowRunner(i.wfEntity.GetBasic(), i.sc, cfg, runOpts...).Prepare(ctx)
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
	info          *schema.ToolInfo
	stream        func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error)
	terminatePlan vo.TerminatePlan
	wfEntity      *entity.Workflow
	sc            *schema2.WorkflowSchema
	repo          wf.Repository
}

func NewStreamableWorkflow(info *schema.ToolInfo,
	stream func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error),
	terminatePlan vo.TerminatePlan,
	wfEntity *entity.Workflow,
	sc *schema2.WorkflowSchema,
	repo wf.Repository,
) wf.ToolFromWorkflow {
	return &streamableWorkflow{
		info:          info,
		stream:        stream,
		terminatePlan: terminatePlan,
		wfEntity:      wfEntity,
		sc:            sc,
		repo:          repo,
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

	cfg := execute.GetExecuteConfig(opts...)

	var runOpts []WorkflowRunnerOption
	if rInfo != nil {
		runOpts = append(runOpts, WithResumeReq(rInfo))
	} else {
		runOpts = append(runOpts, WithInput(argumentsInJSON))
	}
	if sw := execute.GetIntermediateStreamWriter(opts...); sw != nil {
		runOpts = append(runOpts, WithStreamWriter(sw))
	}

	var (
		cancelCtx context.Context
		executeID int64
		callOpts  []einoCompose.Option
		in        map[string]any
		err       error
		ws        *nodes.ConversionWarnings
	)

	if rInfo == nil {
		if err = sonic.UnmarshalString(argumentsInJSON, &in); err != nil {
			return nil, err
		}

		var entryNode *schema2.NodeSchema
		for _, node := range s.sc.Nodes {
			if node.Type == entity.NodeTypeEntry {
				entryNode = node
				break
			}
		}
		if entryNode == nil {
			panic("entry node not found in tool workflow")
		}
		in, ws, err = nodes.ConvertInputs(ctx, in, entryNode.OutputTypes)
		if err != nil {
			return nil, err
		} else if ws != nil {
			logs.CtxWarnf(ctx, "convert inputs warnings: %v", *ws)
		}
	}

	cancelCtx, executeID, callOpts, _, err = NewWorkflowRunner(s.wfEntity.GetBasic(), s.sc, cfg, runOpts...).Prepare(ctx)
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
