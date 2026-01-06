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
	"strconv"

	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"

	wf "github.com/coze-dev/coze-studio/backend/domain/workflow"
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

type UpdateConversationConfig struct{}

type UpdateConversation struct{}

func (c *UpdateConversationConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeConversationUpdate,
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

func (c *UpdateConversationConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &UpdateConversation{}, nil
}

func (c *UpdateConversation) Invoke(ctx context.Context, in map[string]any) (map[string]any, error) {

	var (
		execCtx     = execute.GetExeCtx(ctx)
		env         = ternary.IFElse(execCtx.ExeCfg.Mode == workflowModel.ExecuteModeRelease, vo.Online, vo.Draft)
		appID       = execCtx.ExeCfg.AppID
		agentID     = execCtx.ExeCfg.AgentID
		version     = execCtx.ExeCfg.Version
		connectorID = execCtx.ExeCfg.ConnectorID
		userID      = execCtx.ExeCfg.Operator
	)
	cName, ok := in["conversationName"]
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("conversation name is required"))
	}

	conversationName := cName.(string)

	ncName, ok := in["newConversationName"]
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("new conversationName name is required"))
	}

	newConversationName := ncName.(string)

	if agentID != nil {
		return nil, vo.WrapError(errno.ErrConversationNodesNotAvailable, fmt.Errorf("in the agent scenario, update conversation is not available"))
	}

	if appID == nil {
		return nil, vo.WrapError(errno.ErrConversationNodesNotAvailable, errors.New("conversation update node, app id is required"))
	}

	_, existed, err := wf.GetRepository().GetConversationTemplate(ctx, env, vo.GetConversationTemplatePolicy{
		AppID:   appID,
		Name:    ptr.Of(conversationName),
		Version: ptr.Of(version),
	})
	if err != nil {
		return nil, err
	}

	if existed {
		return nil, vo.WrapError(errno.ErrConversationNodeInvalidOperation, fmt.Errorf("only conversation created through nodes are allowed to be modified or deleted"))
	}

	conversation, existed, err := wf.GetRepository().GetDynamicConversationByName(ctx, env, *appID, connectorID, userID, conversationName)
	if err != nil {
		return nil, err
	}

	if !existed {
		return map[string]any{
			"conversationId": "0",
			"isSuccess":      false,
			"isExisted":      false,
		}, nil
	}

	ncConversation, existed, err := wf.GetRepository().GetDynamicConversationByName(ctx, env, *appID, connectorID, userID, newConversationName)
	if err != nil {
		return nil, err
	}

	if existed {
		return map[string]any{
			"conversationId": strconv.FormatInt(ncConversation.ConversationID, 10),
			"isSuccess":      false,
			"isExisted":      true,
		}, nil
	}

	err = wf.GetRepository().UpdateDynamicConversationNameByID(ctx, env, conversation.ID, newConversationName)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"conversationId": strconv.FormatInt(conversation.ConversationID, 10),
		"isSuccess":      true,
		"isExisted":      false,
	}, nil

}
