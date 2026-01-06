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

package service

import (
	"context"

	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
)

type asToolImpl struct {
	repo workflow.Repository
}

func (a *asToolImpl) WithMessagePipe() (einoCompose.Option, *schema.StreamReader[*entity.Message], func()) {
	return execute.WithMessagePipe()
}

func (a *asToolImpl) WithExecuteConfig(cfg workflowModel.ExecuteConfig) einoCompose.Option {
	return einoCompose.WithToolsNodeOption(einoCompose.WithToolOption(execute.WithExecuteConfig(cfg)))
}

func (a *asToolImpl) WithResumeToolWorkflow(resumingEvent *entity.ToolInterruptEvent, resumeData string,
	allInterruptEvents map[string]*entity.ToolInterruptEvent) einoCompose.Option {
	toolCallID2ExeID := make(map[string]int64, len(allInterruptEvents))
	for callID, event := range allInterruptEvents {
		toolCallID2ExeID[callID] = event.ExecuteID
	}
	return einoCompose.WithToolsNodeOption(
		einoCompose.WithToolOption(
			execute.WithResume(&entity.ResumeRequest{
				ExecuteID:  resumingEvent.ExecuteID,
				EventID:    resumingEvent.ID,
				ResumeData: resumeData,
			}, toolCallID2ExeID)))
}

func (a *asToolImpl) WorkflowAsModelTool(ctx context.Context, policies []*vo.GetPolicy) (tools []workflow.ToolFromWorkflow, err error) {
	for _, id := range policies {
		t, err := a.repo.WorkflowAsTool(ctx, *id, vo.WorkflowToolConfig{})
		if err != nil {
			return nil, err
		}
		tools = append(tools, t)
	}

	return tools, nil
}
