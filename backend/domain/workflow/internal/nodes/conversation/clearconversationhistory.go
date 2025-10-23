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
	"sync/atomic"

	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/conversation"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	wf "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type ClearConversationHistoryConfig struct{}

type ClearConversationHistory struct{}

func (c *ClearConversationHistoryConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeClearConversationHistory,
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

func (c *ClearConversationHistoryConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &ClearConversationHistory{}, nil
}

func (c *ClearConversationHistory) Invoke(ctx context.Context, in map[string]any) (map[string]any, error) {

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

	conversationName, ok := in["conversationName"].(string)
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("conversation name is required"))
	}

	t, existed, err := wf.GetRepository().GetConversationTemplate(ctx, env, vo.GetConversationTemplatePolicy{
		AppID:   appID,
		Name:    ptr.Of(conversationName),
		Version: ptr.Of(version),
	})

	if err != nil {
		return nil, vo.WrapError(errno.ErrConversationNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
	}
	var conversationID int64
	if existed {
		var sc *entity.StaticConversation
		sc, existed, err = wf.GetRepository().GetStaticConversationByTemplateID(ctx, env, userID, connectorID, t.TemplateID)
		if err != nil {
			return nil, vo.WrapError(errno.ErrConversationNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
		if existed {
			conversationID = sc.ConversationID
		}
	} else {
		var dc *entity.DynamicConversation
		dc, existed, err = wf.GetRepository().GetDynamicConversationByName(ctx, env, *appID, connectorID, userID, conversationName)
		if err != nil {
			return nil, vo.WrapError(errno.ErrConversationNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
		if existed {
			conversationID = dc.ConversationID
		}
	}

	if !existed {
		return map[string]any{
			"isSuccess": false,
		}, nil
	}

	resp, err := crossconversation.DefaultSVC().ClearConversationHistory(ctx, &crossconversation.ClearConversationHistoryReq{
		ConversationID: conversationID,
	})
	if err != nil {
		return nil, vo.WrapError(errno.ErrConversationNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
	}
	if resp == nil {
		return nil, vo.WrapError(errno.ErrConversationNodeOperationFail, fmt.Errorf("clear conversation history failed, response is nil"))
	}
	if execCtx.ExeCfg.SectionID != nil {
		atomic.StoreInt64(execCtx.ExeCfg.SectionID, resp.SectionID)
	}
	return map[string]any{
		"isSuccess": true,
	}, nil

}
