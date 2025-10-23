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

package conversation

import (
	"context"
	"errors"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"

	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/conversation"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	conventity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"

	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type CreateConversationConfig struct{}

type CreateConversation struct{}

func (c *CreateConversationConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeCreateConversation,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (c *CreateConversationConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &CreateConversation{}, nil
}

func (c *CreateConversation) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {

	var (
		execCtx                 = execute.GetExeCtx(ctx)
		env                     = ternary.IFElse(execCtx.ExeCfg.Mode == workflowModel.ExecuteModeRelease, vo.Online, vo.Draft)
		appID                   = execCtx.ExeCfg.AppID
		agentID                 = execCtx.ExeCfg.AgentID
		version                 = execCtx.ExeCfg.Version
		connectorID             = execCtx.ExeCfg.ConnectorID
		userID                  = execCtx.ExeCfg.Operator
		conversationIDGenerator = workflow.ConversationIDGenerator(func(ctx context.Context, appID int64, userID, connectorID int64) (*conventity.Conversation, error) {
			return crossconversation.DefaultSVC().CreateConversation(ctx, &conventity.CreateMeta{
				AgentID:     appID,
				UserID:      userID,
				ConnectorID: connectorID,
				Scene:       common.Scene_SceneWorkflow,
			})
		})
	)
	if agentID != nil {
		return nil, vo.WrapError(errno.ErrConversationNodesNotAvailable, fmt.Errorf("in the agent scenario, create conversation is not available"))
	}

	if appID == nil {
		return nil, vo.WrapError(errno.ErrConversationNodesNotAvailable, errors.New("create conversation node, app id is required"))
	}

	conversationName, ok := input["conversationName"].(string)
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("conversation name is required"))
	}

	template, existed, err := workflow.GetRepository().GetConversationTemplate(ctx, env, vo.GetConversationTemplatePolicy{
		AppID:   appID,
		Name:    ptr.Of(conversationName),
		Version: ptr.Of(version),
	})
	if err != nil {
		return nil, err
	}

	if existed {
		cID, _, existed, err := workflow.GetRepository().GetOrCreateStaticConversation(ctx, env, conversationIDGenerator, &vo.CreateStaticConversation{
			BizID:       ptr.From(appID),
			TemplateID:  template.TemplateID,
			UserID:      userID,
			ConnectorID: connectorID,
		})
		if err != nil {
			return nil, err
		}
		return map[string]any{
			"isSuccess":      true,
			"conversationId": cID,
			"isExisted":      existed,
		}, nil
	}

	cID, _, existed, err := workflow.GetRepository().GetOrCreateDynamicConversation(ctx, env, conversationIDGenerator, &vo.CreateDynamicConversation{
		BizID:       ptr.From(appID),
		UserID:      userID,
		ConnectorID: connectorID,
		Name:        conversationName,
	})
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"isSuccess":      true,
		"conversationId": cID,
		"isExisted":      existed,
	}, nil

}
