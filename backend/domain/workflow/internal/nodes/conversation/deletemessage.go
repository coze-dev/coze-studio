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

	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	msgentity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"

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

type DeleteMessageConfig struct{}

type DeleteMessage struct{}

func (d *DeleteMessageConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeDeleteMessage,
		Name:    n.Data.Meta.Title,
		Configs: d,
	}

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (d *DeleteMessageConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &DeleteMessage{}, nil
}

func (d *DeleteMessage) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	var (
		execCtx     = execute.GetExeCtx(ctx)
		env         = ternary.IFElse(execCtx.ExeCfg.Mode == workflowModel.ExecuteModeRelease, vo.Online, vo.Draft)
		appID       = execCtx.ExeCfg.AppID
		agentID     = execCtx.ExeCfg.AgentID
		version     = execCtx.ExeCfg.Version
		connectorID = execCtx.ExeCfg.ConnectorID
		userID      = execCtx.ExeCfg.Operator

		successMap = map[string]any{
			"isSuccess": true,
		}
		failedMap = map[string]any{
			"isSuccess": false,
		}
	)

	conversationName, ok := input["conversationName"].(string)
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("conversationName is required"))
	}
	messageStr, ok := input["messageId"].(string)
	if !ok {
		return nil, vo.WrapError(errno.ErrInvalidParameter, errors.New("messageId is required"))
	}
	messageID, err := strconv.ParseInt(messageStr, 10, 64)
	if err != nil {
		return nil, vo.WrapError(errno.ErrInvalidParameter, err)
	}

	if appID == nil {
		if conversationName != "Default" {
			return nil, vo.WrapError(errno.ErrOnlyDefaultConversationAllowInAgentScenario, fmt.Errorf("only default conversation allow in agent scenario"))
		}

		if agentID == nil || execCtx.ExeCfg.ConversationID == nil {
			return failedMap, nil
		}

		err = crossmessage.DefaultSVC().Delete(ctx, &msgentity.DeleteMeta{MessageIDs: []int64{messageID}, ConversationID: execCtx.ExeCfg.ConversationID})
		if err != nil {
			return nil, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}

		return successMap, nil
	}

	t, existed, err := wf.GetRepository().GetConversationTemplate(ctx, env, vo.GetConversationTemplatePolicy{
		AppID:   appID,
		Name:    ptr.Of(conversationName),
		Version: ptr.Of(version),
	})
	if err != nil {
		return nil, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
	}

	if existed {
		sc, existed, err := wf.GetRepository().GetStaticConversationByTemplateID(ctx, env, userID, connectorID, t.TemplateID)
		if err != nil {
			return nil, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}

		if !existed {
			return failedMap, nil
		}

		err = crossmessage.DefaultSVC().Delete(ctx, &msgentity.DeleteMeta{MessageIDs: []int64{messageID}, ConversationID: ptr.Of(sc.ConversationID)})
		if err != nil {
			return nil, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}

		return successMap, nil

	} else {
		dc, existed, err := wf.GetRepository().GetDynamicConversationByName(ctx, env, *appID, connectorID, userID, conversationName)
		if err != nil {
			return nil, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}

		if !existed {
			return failedMap, nil
		}

		err = crossmessage.DefaultSVC().Delete(ctx, &msgentity.DeleteMeta{MessageIDs: []int64{messageID}, ConversationID: ptr.Of(dc.ConversationID)})
		if err != nil {
			return nil, vo.WrapError(errno.ErrMessageNodeOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}

		return successMap, nil

	}

}
