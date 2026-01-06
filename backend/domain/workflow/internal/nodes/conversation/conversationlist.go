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
	"fmt"
	"strconv"

	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"

	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type ConversationList struct{}

type ConversationListConfig struct{}

func (c *ConversationListConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeConversationList,
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

func (c *ConversationListConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &ConversationList{}, nil
}

type conversationInfo struct {
	conversationName string
	conversationId   string
}

func (c *ConversationList) Invoke(ctx context.Context, _ map[string]any) (map[string]any, error) {
	var (
		execCtx     = execute.GetExeCtx(ctx)
		env         = ternary.IFElse(execCtx.ExeCfg.Mode == workflowModel.ExecuteModeRelease, vo.Online, vo.Draft)
		appID       = execCtx.ExeCfg.AppID
		agentID     = execCtx.ExeCfg.AgentID
		connectorID = execCtx.ExeCfg.ConnectorID
		userID      = execCtx.ExeCfg.Operator
		version     = execCtx.ExeCfg.Version
	)
	if agentID != nil {
		return nil, vo.WrapError(errno.ErrConversationNodesNotAvailable, fmt.Errorf("in the agent scenario, query conversation list is not available"))
	}
	if appID == nil {
		return nil, vo.WrapError(errno.ErrConversationNodesNotAvailable, fmt.Errorf("query conversation list node, app id is required"))
	}

	templates, err := workflow.GetRepository().ListConversationTemplate(ctx, env, &vo.ListConversationTemplatePolicy{
		AppID:   *appID,
		Version: ptr.Of(version),
	})
	if err != nil {
		return nil, err
	}

	templateIds := make([]int64, 0, len(templates))
	for _, template := range templates {
		templateIds = append(templateIds, template.TemplateID)
	}

	staticConversations, err := workflow.GetRepository().MGetStaticConversation(ctx, env, userID, connectorID, templateIds)
	if err != nil {
		return nil, err
	}

	templateIDToConvID := slices.ToMap(staticConversations, func(conv *entity.StaticConversation) (int64, int64) {
		return conv.TemplateID, conv.ConversationID
	})

	var conversationList []conversationInfo

	for _, template := range templates {
		convID, ok := templateIDToConvID[template.TemplateID]
		if !ok {
			convID = 0
		}
		conversationList = append(conversationList, conversationInfo{
			conversationName: template.Name,
			conversationId:   strconv.FormatInt(convID, 10),
		})
	}

	dynamicConversations, err := workflow.GetRepository().ListDynamicConversation(ctx, env, &vo.ListConversationPolicy{
		ListConversationMeta: vo.ListConversationMeta{
			APPID:       *appID,
			UserID:      userID,
			ConnectorID: connectorID,
		},
	})
	if err != nil {
		return nil, err
	}

	for _, conv := range dynamicConversations {
		conversationList = append(conversationList, conversationInfo{
			conversationName: conv.Name,
			conversationId:   strconv.FormatInt(conv.ConversationID, 10),
		})
	}

	resultList := make([]any, len(conversationList))
	for i, v := range conversationList {
		resultList[i] = map[string]any{
			"conversationName": v.conversationName,
			"conversationId":   v.conversationId,
		}
	}

	return map[string]any{
		"conversationList": resultList,
	}, nil

}
