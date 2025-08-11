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

package workflow

import (
	"context"

	"github.com/cloudwego/eino/compose"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	crossworkflow "github.com/coze-dev/coze-studio/backend/crossdomain/contract/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	workflowEntity "github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

var defaultSVC crossworkflow.Workflow

type impl struct {
	DomainSVC workflow.Service
}

func InitDomainService(c workflow.Service) crossworkflow.Workflow {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (i *impl) WorkflowAsModelTool(ctx context.Context, policies []*vo.GetPolicy) ([]workflow.ToolFromWorkflow, error) {
	return i.DomainSVC.WorkflowAsModelTool(ctx, policies)
}

func (i *impl) PublishWorkflow(ctx context.Context, info *vo.PublishPolicy) (err error) {
	return i.DomainSVC.Publish(ctx, info)
}

func (i *impl) DeleteWorkflow(ctx context.Context, id int64) error {
	return i.DomainSVC.Delete(ctx, &vo.DeletePolicy{
		ID: ptr.Of(id),
	})
}

func (i *impl) ReleaseApplicationWorkflows(ctx context.Context, appID int64, config *vo.ReleaseWorkflowConfig) ([]*vo.ValidateIssue, error) {
	return i.DomainSVC.ReleaseApplicationWorkflows(ctx, appID, config)
}

func (i *impl) WithResumeToolWorkflow(resumingEvent *workflowEntity.ToolInterruptEvent, resumeData string, allInterruptEvents map[string]*workflowEntity.ToolInterruptEvent) einoCompose.Option {
	return i.DomainSVC.WithResumeToolWorkflow(resumingEvent, resumeData, allInterruptEvents)
}
func (i *impl) SyncExecuteWorkflow(ctx context.Context, config vo.ExecuteConfig, input map[string]any) (*workflowEntity.WorkflowExecution, vo.TerminatePlan, error) {
	return i.DomainSVC.SyncExecute(ctx, config, input)
}

func (i *impl) WithExecuteConfig(cfg vo.ExecuteConfig) einoCompose.Option {
	return i.DomainSVC.WithExecuteConfig(cfg)
}

func (i *impl) WithMessagePipe() (compose.Option, *schema.StreamReader[*entity.Message]) {
	return i.DomainSVC.WithMessagePipe()
}

func (i *impl) GetWorkflowIDsByAppID(ctx context.Context, appID int64) ([]int64, error) {
	metas, _, err := i.DomainSVC.MGet(ctx, &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			AppID: ptr.Of(appID),
		},
		MetaOnly: true,
	})
	if err != nil {
		return nil, err
	}
	return slices.Transform(metas, func(a *workflowEntity.Workflow) int64 {
		return a.ID
	}), err
}
