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
	conventity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"

	"strconv"
	"sync/atomic"

	einoSchema "github.com/cloudwego/eino/schema"

	crossagentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun"
	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/conversation"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"

	agententity "github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
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

type CreateMessageConfig struct{}

type CreateMessage struct{}

func (c *CreateMessageConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeCreateMessage,
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

func (c *CreateMessageConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &CreateMessage{}, nil
}

func (c *CreateMessage) getConversationIDByName(ctx context.Context, env vo.Env, appID *int64, version, conversationName string, userID, connectorID int64) (int64, error) {
	template, isExist, err := workflow.GetRepository().GetConversationTemplate(ctx, env, vo.GetConversationTemplatePolicy{
		AppID:   appID,
		Name:    ptr.Of(conversationName),
		Version: ptr.Of(version),
	})
	if err != nil {
		return 0, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
	}

	conversationIDGenerator := workflow.ConversationIDGenerator(func(ctx context.Context, appID int64, userID, connectorID int64) (*conventity.Conversation, error) {
		return crossconversation.DefaultSVC().CreateConversation(ctx, &conventity.CreateMeta{
			AgentID:     appID,
			UserID:      userID,
			ConnectorID: connectorID,
			Scene:       common.Scene_SceneWorkflow,
		})
	})

	var conversationID int64
	if isExist {
		cID, _, _, err := workflow.GetRepository().GetOrCreateStaticConversation(ctx, env, conversationIDGenerator, &vo.CreateStaticConversation{
			BizID:       ptr.From(appID),
			TemplateID:  template.TemplateID,
			UserID:      userID,
			ConnectorID: connectorID,
		})
		if err != nil {
			return 0, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
		conversationID = cID
	} else {
		dc, _, err := workflow.GetRepository().GetDynamicConversationByName(ctx, env, *appID, connectorID, userID, conversationName)
		if err != nil {
			return 0, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
		if dc != nil {
			conversationID = dc.ConversationID
		}
	}
	return conversationID, nil
}

func (c *CreateMessage) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	var (
		execCtx     = execute.GetExeCtx(ctx)
		env         = ternary.IFElse(execCtx.ExeCfg.Mode == workflowModel.ExecuteModeRelease, vo.Online, vo.Draft)
		appID       = execCtx.ExeCfg.AppID
		agentID     = execCtx.ExeCfg.AgentID
		version     = execCtx.ExeCfg.Version
		connectorID = execCtx.ExeCfg.ConnectorID
		userID      = execCtx.ExeCfg.Operator
	)

	conversationName, ok := input["conversationName"].(string)
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("conversationName is required"))
	}

	role, ok := input["role"].(string)
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("role is required"))
	}
	if role != "user" && role != "assistant" {
		return nil, vo.WrapError(errno.ErrInvalidParameter, fmt.Errorf("role must be user or assistant"))
	}

	content, ok := input["content"].(string)
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("content is required"))
	}

	var conversationID int64
	var err error
	var bizID int64
	if appID == nil {
		if conversationName != "Default" {
			return nil, vo.WrapError(errno.ErrOnlyDefaultConversationAllowInAgentScenario, errors.New("conversation node only allow in application"))
		}
		if agentID == nil || execCtx.ExeCfg.ConversationID == nil {
			return map[string]any{
				"isSuccess": false,
				"message": map[string]any{
					"messageId":   "0",
					"role":        role,
					"contentType": "text",
					"content":     content,
				},
			}, nil
		}
		conversationID = *execCtx.ExeCfg.ConversationID
		bizID = *agentID
	} else {
		conversationID, err = c.getConversationIDByName(ctx, env, appID, version, conversationName, userID, connectorID)
		if err != nil {
			return nil, err
		}
		bizID = *appID
	}

	if conversationID == 0 {
		return map[string]any{
			"isSuccess": false,
			"message": map[string]any{
				"messageId":   "0",
				"role":        role,
				"contentType": "text",
				"content":     content,
			},
		}, nil
	}

	currentConversationID := execCtx.ExeCfg.ConversationID
	isCurrentConversation := currentConversationID != nil && *currentConversationID == conversationID
	var runID int64
	var sectionID int64
	if isCurrentConversation {
		if execCtx.ExeCfg.SectionID != nil {
			sectionID = *execCtx.ExeCfg.SectionID
		} else {
			return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("section id is required"))
		}
	} else {
		cInfo, err := crossconversation.DefaultSVC().GetByID(ctx, conversationID)
		if err != nil {
			return nil, err
		}
		sectionID = cInfo.SectionID
	}

	if role == "user" {
		// For user messages, always create a new run and store the ID in the context.
		runRecord, err := crossagentrun.DefaultSVC().Create(ctx, &agententity.AgentRunMeta{
			AgentID:        bizID,
			ConversationID: conversationID,
			UserID:         strconv.FormatInt(userID, 10),
			ConnectorID:    connectorID,
			SectionID:      sectionID,
		})
		if err != nil {
			return nil, err
		}
		newRunID := runRecord.ID
		if execCtx.ExeCfg.RoundID != nil {
			atomic.StoreInt64(execCtx.ExeCfg.RoundID, newRunID)
		}
		runID = newRunID
	} else if isCurrentConversation {
		// For assistant messages in the same conversation, reuse the runID from the context.
		if execCtx.ExeCfg.RoundID == nil {
			// This indicates an inconsistent state, as a user message should have set this.
			return map[string]any{
				"isSuccess": false,
				"message": map[string]any{
					"messageId":   "0",
					"role":        role,
					"contentType": "text",
					"content":     content,
				},
			}, nil
		}
		runID = *execCtx.ExeCfg.RoundID
	} else {
		// For assistant messages in a different conversation or a new workflow run,
		// find the latest runID or create a new one as a fallback.
		runIDs, err := crossmessage.DefaultSVC().GetLatestRunIDs(ctx, &crossmessage.GetLatestRunIDsRequest{
			ConversationID: conversationID,
			UserID:         userID,
			BizID:          bizID,
			Rounds:         1,
		})
		if err != nil {
			return nil, err
		}
		if len(runIDs) > 0 && runIDs[0] != 0 {
			runID = runIDs[0]
		} else {
			runRecord, err := crossagentrun.DefaultSVC().Create(ctx, &agententity.AgentRunMeta{
				AgentID:        bizID,
				ConversationID: conversationID,
				UserID:         strconv.FormatInt(userID, 10),
				ConnectorID:    connectorID,
				SectionID:      sectionID,
			})
			if err != nil {
				return nil, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
			}
			runID = runRecord.ID
		}
	}

	message := &model.Message{
		ConversationID: conversationID,
		Role:           einoSchema.RoleType(role),
		Content:        content,
		ContentType:    model.ContentType("text"),
		UserID:         strconv.FormatInt(userID, 10),
		AgentID:        bizID,
		RunID:          runID,
		SectionID:      sectionID,
	}
	if message.Role == einoSchema.User {
		message.MessageType = model.MessageTypeQuestion
	} else {
		message.MessageType = model.MessageTypeAnswer
	}
	msg, err := crossmessage.DefaultSVC().Create(ctx, message)
	if err != nil {
		return nil, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
	}

	messageOutput := map[string]any{
		"messageId":   msg.ID,
		"role":        role,
		"contentType": "text",
		"content":     content,
	}

	return map[string]any{
		"isSuccess": true,
		"message":   messageOutput,
	}, nil
}
