package service

import (
	"context"

	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
)

type asToolImpl struct {
	repo workflow.Repository
}

func (a *asToolImpl) WithMessagePipe() (einoCompose.Option, *schema.StreamReader[*entity.Message]) {
	return execute.WithMessagePipe()
}

func (a *asToolImpl) WithExecuteConfig(cfg vo.ExecuteConfig) einoCompose.Option {
	return einoCompose.WithToolsNodeOption(einoCompose.WithToolOption(execute.WithExecuteConfig(cfg)))
}

func (a *asToolImpl) WithResumeToolWorkflow(resumingEvent *entity.ToolInterruptEvent, resumeData string,
	allInterruptEvents map[string]*entity.ToolInterruptEvent) einoCompose.Option {
	return einoCompose.WithToolsNodeOption(
		einoCompose.WithToolOption(
			execute.WithResume(&entity.ResumeRequest{
				ExecuteID:  resumingEvent.ExecuteID,
				EventID:    resumingEvent.ID,
				ResumeData: resumeData,
			}, allInterruptEvents)))
}

func (a *asToolImpl) WorkflowAsModelTool(ctx context.Context, policies []*vo.GetPolicy) (tools []tool.BaseTool, err error) {
	for _, id := range policies {
		t, err := a.repo.WorkflowAsTool(ctx, *id, vo.WorkflowToolConfig{})
		if err != nil {
			return nil, err
		}
		tools = append(tools, t)
	}

	return tools, nil
}
