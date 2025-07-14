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
	"encoding/json"
	"errors"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/data_edc/workflow_engine_next/api/model/conversation/common"
	"code.byted.org/data_edc/workflow_engine_next/api/model/conversation/run"
	"code.byted.org/data_edc/workflow_engine_next/api/model/crossdomain/agentrun"
	"code.byted.org/data_edc/workflow_engine_next/api/model/crossdomain/message"
	"code.byted.org/data_edc/workflow_engine_next/api/model/crossdomain/singleagent"
	"code.byted.org/data_edc/workflow_engine_next/application/base/ctxutil"
	saEntity "code.byted.org/data_edc/workflow_engine_next/domain/agent/singleagent/entity"
	"code.byted.org/data_edc/workflow_engine_next/domain/conversation/agentrun/entity"
	convEntity "code.byted.org/data_edc/workflow_engine_next/domain/conversation/conversation/entity"
	cmdEntity "code.byted.org/data_edc/workflow_engine_next/domain/shortcutcmd/entity"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/conv"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/ptr"
	"code.byted.org/data_edc/workflow_engine_next/types/consts"
	"code.byted.org/gopkg/logs"
)

func (a *OpenapiAgentRunApplication) OpenapiAgentRun(ctx context.Context, ar *run.ChatV3Request) (*schema.StreamReader[*entity.AgentRunResponse], error) {

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	creatorID := apiKeyInfo.UserID
	connectorID := apiKeyInfo.ConnectorID

	if ptr.From(ar.ConnectorID) == consts.WebSDKConnectorID {
		connectorID = ptr.From(ar.ConnectorID)
	}
	agentInfo, caErr := a.checkAgent(ctx, ar, connectorID)
	if caErr != nil {
		logs.CtxError(ctx, "checkAgent err:%v", caErr)
		return nil, caErr
	}

	conversationData, ccErr := a.checkConversation(ctx, ar, creatorID, connectorID)
	if ccErr != nil {
		logs.CtxError(ctx, "checkConversation err:%v", ccErr)
		return nil, ccErr
	}

	spaceID := agentInfo.SpaceID
	arr, err := a.buildAgentRunRequest(ctx, ar, connectorID, spaceID, conversationData)
	if err != nil {
		logs.CtxError(ctx, "buildAgentRunRequest err:%v", err)
		return nil, err
	}
	return ConversationSVC.AgentRunDomainSVC.AgentRun(ctx, arr)
}

func (a *OpenapiAgentRunApplication) checkConversation(ctx context.Context, ar *run.ChatV3Request, userID int64, connectorID int64) (*convEntity.Conversation, error) {
	var conversationData *convEntity.Conversation
	if ptr.From(ar.ConversationID) > 0 {
		conData, err := ConversationSVC.ConversationDomainSVC.GetByID(ctx, ptr.From(ar.ConversationID))
		if err != nil {
			return nil, err
		}
		conversationData = conData
	}

	if ptr.From(ar.ConversationID) == 0 || conversationData == nil {

		conData, err := ConversationSVC.ConversationDomainSVC.Create(ctx, &convEntity.CreateMeta{
			AgentID:     ar.BotID,
			UserID:      userID,
			ConnectorID: connectorID,
			Scene:       common.Scene_SceneOpenApi,
		})
		if err != nil {
			return nil, err
		}
		if conData == nil {
			return nil, errors.New("conversation data is nil")
		}
		conversationData = conData

		ar.ConversationID = ptr.Of(conversationData.ID)
	}

	if conversationData.CreatorID != userID {
		return nil, errors.New("conversation data not match")
	}

	return conversationData, nil
}

func (a *OpenapiAgentRunApplication) checkAgent(ctx context.Context, ar *run.ChatV3Request, connectorID int64) (*saEntity.SingleAgent, error) {
	agentInfo, err := ConversationSVC.appContext.SingleAgentDomainSVC.ObtainAgentByIdentity(ctx, &singleagent.AgentIdentity{
		AgentID:     ar.BotID,
		IsDraft:     false,
		ConnectorID: connectorID,
	})
	if err != nil {
		return nil, err
	}

	if agentInfo == nil {
		return nil, errors.New("agent info is nil")
	}
	return agentInfo, nil
}

func (a *OpenapiAgentRunApplication) buildAgentRunRequest(ctx context.Context, ar *run.ChatV3Request, connectorID int64, spaceID int64, conversationData *convEntity.Conversation) (*entity.AgentRunMeta, error) {

	shortcutCMDData, err := a.buildTools(ctx, ar.ShortcutCommand)
	if err != nil {
		return nil, err
	}
	multiContent, contentType, err := a.buildMultiContent(ctx, ar)
	if err != nil {
		return nil, err
	}
	displayContent := a.buildDisplayContent(ctx, ar)
	arm := &entity.AgentRunMeta{
		ConversationID:   ptr.From(ar.ConversationID),
		AgentID:          ar.BotID,
		Content:          multiContent,
		DisplayContent:   displayContent,
		SpaceID:          spaceID,
		UserID:           ar.User,
		SectionID:        conversationData.SectionID,
		PreRetrieveTools: shortcutCMDData,
		IsDraft:          false,
		ConnectorID:      connectorID,
		ContentType:      contentType,
		Ext:              ar.ExtraParams,
	}
	return arm, nil
}

func (a *OpenapiAgentRunApplication) buildTools(ctx context.Context, shortcmd *run.ShortcutCommandDetail) ([]*entity.Tool, error) {
	var ts []*entity.Tool

	if shortcmd == nil {
		return ts, nil
	}

	var shortcutCMD *cmdEntity.ShortcutCmd
	cmdMeta, err := a.ShortcutDomainSVC.GetByCmdID(ctx, shortcmd.CommandID, 0)
	if err != nil {
		return nil, err
	}
	shortcutCMD = cmdMeta
	if shortcutCMD != nil {
		argBytes, err := json.Marshal(shortcmd.Parameters)
		if err == nil {
			ts = append(ts, &entity.Tool{
				PluginID:  shortcutCMD.PluginID,
				Arguments: string(argBytes),
				ToolName:  shortcutCMD.PluginToolName,
				ToolID:    shortcutCMD.PluginToolID,
				Type:      agentrun.ToolType(shortcutCMD.ToolType),
			})
		}
	}

	return ts, nil
}

func (a *OpenapiAgentRunApplication) buildDisplayContent(_ context.Context, ar *run.ChatV3Request) string {
	for _, item := range ar.AdditionalMessages {
		if item.ContentType == run.ContentTypeMixApi {
			return item.Content
		}
	}
	return ""
}

func (a *OpenapiAgentRunApplication) buildMultiContent(ctx context.Context, ar *run.ChatV3Request) ([]*message.InputMetaData, message.ContentType, error) {
	var multiContents []*message.InputMetaData
	contentType := message.ContentTypeText

	for _, item := range ar.AdditionalMessages {
		if item == nil {
			continue
		}
		if item.Role != string(schema.User) {
			return nil, contentType, errors.New("role not match")
		}
		if item.ContentType == run.ContentTypeText {
			if item.Content == "" {
				continue
			}
			multiContents = append(multiContents, &message.InputMetaData{
				Type: message.InputTypeText,
				Text: item.Content,
			})
		}

		if item.ContentType == run.ContentTypeMixApi {
			contentType = message.ContentTypeMix
			var inputs []*run.AdditionalContent
			err := json.Unmarshal([]byte(item.Content), &inputs)

			logs.CtxInfo(ctx, "inputs:%v, err:%v", conv.DebugJsonToStr(inputs), err)
			if err != nil {
				continue
			}
			for _, one := range inputs {
				if one == nil {
					continue
				}
				switch message.InputType(one.Type) {
				case message.InputTypeText:
					multiContents = append(multiContents, &message.InputMetaData{
						Type: message.InputTypeText,
						Text: ptr.From(one.Text),
					})
				case message.InputTypeImage, message.InputTypeFile:
					multiContents = append(multiContents, &message.InputMetaData{
						Type: message.InputType(one.Type),
						FileData: []*message.FileData{
							{
								Url: one.GetFileURL(),
							},
						},
					})
				default:
					continue
				}
			}
		}

	}

	return multiContents, contentType, nil
}
