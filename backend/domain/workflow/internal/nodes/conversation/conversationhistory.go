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

	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/conversation"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
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

type ConversationHistoryConfig struct{}

type ConversationHistory struct{}

func (ch *ConversationHistoryConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeConversationHistory,
		Name:    n.Data.Meta.Title,
		Configs: ch,
	}

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (ch *ConversationHistoryConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &ConversationHistory{}, nil
}

func (ch *ConversationHistory) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	var (
		execCtx     = execute.GetExeCtx(ctx)
		env         = ternary.IFElse(execCtx.ExeCfg.Mode == workflowModel.ExecuteModeRelease, vo.Online, vo.Draft)
		appID       = execCtx.ExeCfg.AppID
		agentID     = execCtx.ExeCfg.AgentID
		connectorID = execCtx.ExeCfg.ConnectorID
		userID      = execCtx.ExeCfg.Operator
		version     = execCtx.ExeCfg.Version
		initRunID   = execCtx.ExeCfg.InitRoundID
	)
	if agentID != nil {
		return nil, vo.WrapError(errno.ErrConversationNodesNotAvailable, fmt.Errorf("in the agent scenario, query conversation list is not available"))
	}
	if appID == nil {
		return nil, vo.WrapError(errno.ErrConversationNodesNotAvailable, fmt.Errorf("query conversation list node, app id is required"))
	}

	conversationName, ok := input["conversationName"].(string)
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("conversation name is required"))
	}

	rounds, ok := input["rounds"].(int64)
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("rounds is required"))
	}

	template, existed, err := wf.GetRepository().GetConversationTemplate(ctx, env, vo.GetConversationTemplatePolicy{
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
		sc, existed, err = wf.GetRepository().GetStaticConversationByTemplateID(ctx, env, userID, connectorID, template.TemplateID)
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
		return nil, vo.WrapError(errno.ErrConversationOfAppNotFound, fmt.Errorf("the conversation name does not exist: '%v'", conversationName))
	}

	currentConversationID := execCtx.ExeCfg.ConversationID
	isCurrentConversation := currentConversationID != nil && *currentConversationID == conversationID
	var sectionID int64
	if isCurrentConversation {
		if execCtx.ExeCfg.SectionID == nil {
			return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("section id is required"))
		}
		sectionID = *execCtx.ExeCfg.SectionID
	} else {
		cInfo, err := crossconversation.DefaultSVC().GetByID(ctx, conversationID)
		if err != nil {
			return nil, err
		}
		sectionID = cInfo.SectionID
	}

	runIDs, err := crossmessage.DefaultSVC().GetLatestRunIDs(ctx, &crossmessage.GetLatestRunIDsRequest{
		ConversationID: conversationID,
		UserID:         userID,
		BizID:          *appID,
		Rounds:         rounds,
		InitRunID:      initRunID,
		SectionID:      sectionID,
	})

	if err != nil {
		return nil, vo.WrapError(errno.ErrConversationNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
	}

	if len(runIDs) == 0 {
		return map[string]any{
			"messageList": []any{},
		}, nil
	}

	response, err := crossmessage.DefaultSVC().GetMessagesByRunIDs(ctx, &crossmessage.GetMessagesByRunIDsRequest{
		ConversationID: conversationID,
		RunIDs:         runIDs,
	})
	if err != nil {
		return nil, vo.WrapError(errno.ErrConversationNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
	}

	var messageList []any
	for _, msg := range response.Messages {
		content, err := nodes.ConvertMessageToString(ctx, msg)
		if err != nil {
			return nil, vo.WrapError(errno.ErrConversationNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
		messageList = append(messageList, map[string]any{
			"role":    string(msg.Role),
			"content": content,
		})
	}

	return map[string]any{
		"messageList": messageList,
	}, nil
}
