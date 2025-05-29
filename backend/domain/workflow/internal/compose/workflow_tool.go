package compose

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	wf "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

const answerKey = "output"

type invokableWorkflow struct {
	info          *schema.ToolInfo
	invoke        func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (map[string]any, error)
	terminatePlan vo.TerminatePlan
	wfEntity      *entity.Workflow
	sc            *WorkflowSchema
	repo          wf.Repository
}

func NewInvokableWorkflow(info *schema.ToolInfo,
	invoke func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (map[string]any, error),
	terminatePlan vo.TerminatePlan,
	wfEntity *entity.Workflow,
	sc *WorkflowSchema,
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
	rInfo := execute.GetResumeRequest(opts...)
	cfg := execute.GetExecuteConfig(opts...)

	var (
		cancelCtx context.Context
		executeID int64
		callOpts  []einoCompose.Option
		in        map[string]any
		err       error
	)
	if rInfo != nil {
		cancelCtx, executeID, callOpts, err = Prepare(ctx, "", i.wfEntity.GetBasic(int32(len(i.sc.GetAllNodes()))),
			rInfo, i.repo, i.sc,
			execute.GetIntermediateStreamWriter(opts...), cfg)
		if err != nil {
			return "", err
		}
	} else {
		in = make(map[string]any)
		if err := sonic.UnmarshalString(argumentsInJSON, &in); err != nil {
			return "", err
		}

		cancelCtx, executeID, callOpts, err = Prepare(ctx, argumentsInJSON, i.wfEntity.GetBasic(int32(len(i.sc.GetAllNodes()))),
			nil, i.repo, i.sc,
			execute.GetIntermediateStreamWriter(opts...), cfg)
		if err != nil {
			return "", err
		}
	}

	out, err := i.invoke(cancelCtx, in, callOpts...)
	if err != nil {
		if _, ok := einoCompose.ExtractInterruptInfo(err); ok {
			count := 0
			for {
				wfExe, found, err := i.repo.GetWorkflowExecution(ctx, executeID)
				if err != nil {
					return "", err
				}

				if !found {
					return "", fmt.Errorf("workflow execution does not exist, id: %d", executeID)
				}

				if wfExe.Status == entity.WorkflowInterrupted {
					break
				}

				time.Sleep(5 * time.Millisecond)
				count++

				if count >= 10 {
					return "", fmt.Errorf("workflow execution %d is not interrupted, status is %v, cannot resume", executeID, wfExe.Status)
				}
			}

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
	sc            *WorkflowSchema
	repo          wf.Repository
}

func NewStreamableWorkflow(info *schema.ToolInfo,
	stream func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error),
	terminatePlan vo.TerminatePlan,
	wfEntity *entity.Workflow,
	sc *WorkflowSchema,
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
	rInfo := execute.GetResumeRequest(opts...)
	cfg := execute.GetExecuteConfig(opts...)

	var (
		cancelCtx context.Context
		executeID int64
		callOpts  []einoCompose.Option
		in        map[string]any
		err       error
	)
	if rInfo != nil {
		cancelCtx, executeID, callOpts, err = Prepare(ctx, "", s.wfEntity.GetBasic(int32(len(s.sc.GetAllNodes()))),
			rInfo, s.repo, s.sc,
			execute.GetIntermediateStreamWriter(opts...), cfg)
		if err != nil {
			return nil, err
		}
	} else {
		in = make(map[string]any)
		if err := sonic.UnmarshalString(argumentsInJSON, &in); err != nil {
			return nil, err
		}

		cancelCtx, executeID, callOpts, err = Prepare(ctx, argumentsInJSON, s.wfEntity.GetBasic(int32(len(s.sc.GetAllNodes()))),
			nil, s.repo, s.sc,
			execute.GetIntermediateStreamWriter(opts...), cfg)
		if err != nil {
			return nil, err
		}
	}

	outStream, err := s.stream(cancelCtx, in, callOpts...)
	if err != nil {
		if _, ok := einoCompose.ExtractInterruptInfo(err); ok {
			count := 0
			for {
				wfExe, found, err := s.repo.GetWorkflowExecution(ctx, executeID)
				if err != nil {
					return nil, err
				}

				if !found {
					return nil, fmt.Errorf("workflow execution does not exist, id: %d", executeID)
				}

				if wfExe.Status == entity.WorkflowInterrupted {
					break
				}

				time.Sleep(5 * time.Millisecond)
				count++

				if count >= 10 {
					return nil, fmt.Errorf("workflow execution %d is not interrupted, status is %v, cannot resume", executeID, wfExe.Status)
				}
			}

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
			if len(contentStr) == 0 {
				return "", schema.ErrNoValue
			}
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
