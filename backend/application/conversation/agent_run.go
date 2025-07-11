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

	"github.com/cloudwego/eino/schema"

	"code.byted.org/data_edc/workflow_engine_next/api/model/conversation/run"
	"code.byted.org/data_edc/workflow_engine_next/api/model/crossdomain/agentrun"
	"code.byted.org/data_edc/workflow_engine_next/api/model/crossdomain/message"
	"code.byted.org/data_edc/workflow_engine_next/application/base/ctxutil"
	saEntity "code.byted.org/data_edc/workflow_engine_next/domain/agent/singleagent/entity"
	"code.byted.org/data_edc/workflow_engine_next/domain/conversation/agentrun/entity"
	convEntity "code.byted.org/data_edc/workflow_engine_next/domain/conversation/conversation/entity"
	msgEntity "code.byted.org/data_edc/workflow_engine_next/domain/conversation/message/entity"
	cmdEntity "code.byted.org/data_edc/workflow_engine_next/domain/shortcutcmd/entity"
	"code.byted.org/data_edc/workflow_engine_next/pkg/errorx"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/conv"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/ptr"
	"code.byted.org/data_edc/workflow_engine_next/pkg/logs"
	"code.byted.org/data_edc/workflow_engine_next/types/consts"
	"code.byted.org/data_edc/workflow_engine_next/types/errno"
)

func (c *ConversationApplicationService) Run(ctx context.Context, ar *run.AgentRunRequest) (*schema.StreamReader[*entity.AgentRunResponse], error) {
	agentInfo, caErr := c.checkAgent(ctx, ar)
	if caErr != nil {
		logs.CtxErrorf(ctx, "checkAgent err:%v", caErr)
		return nil, caErr
	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)
	conversationData, ccErr := c.checkConversation(ctx, ar, userID)

	logs.CtxInfof(ctx, "conversationData:%v", conv.DebugJsonToStr(conversationData))
	if ccErr != nil {
		logs.CtxErrorf(ctx, "checkConversation err:%v", ccErr)
		return nil, ccErr
	}

	if ar.RegenMessageID != nil && ptr.From(ar.RegenMessageID) > 0 {
		msgMeta, err := c.MessageDomainSVC.GetByID(ctx, ptr.From(ar.RegenMessageID))
		if err != nil {
			return nil, err
		}
		if msgMeta != nil {
			if msgMeta.UserID != conv.Int64ToStr(userID) {
				return nil, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "message not match"))
			}
			delErr := c.MessageDomainSVC.Delete(ctx, &msgEntity.DeleteMeta{
				RunIDs: []int64{msgMeta.RunID},
			})
			if delErr != nil {
				return nil, delErr
			}
		}

	}
	var shortcutCmd *cmdEntity.ShortcutCmd
	if ar.GetShortcutCmdID() > 0 {
		cmdID := ar.GetShortcutCmdID()
		cmdMeta, err := c.ShortcutDomainSVC.GetByCmdID(ctx, cmdID, 0)
		if err != nil {
			return nil, err
		}
		shortcutCmd = cmdMeta
	}

	arr, err := c.buildAgentRunRequest(ctx, ar, userID, agentInfo.SpaceID, conversationData, shortcutCmd)
	if err != nil {
		logs.CtxErrorf(ctx, "buildAgentRunRequest err:%v", err)
		return nil, err
	}
	return c.AgentRunDomainSVC.AgentRun(ctx, arr)
}

func (c *ConversationApplicationService) GenID(ctx context.Context) (int64, error) {
	id, err := c.appContext.IDGen.GenID(ctx)
	return id, err
}

func (c *ConversationApplicationService) checkConversation(ctx context.Context, ar *run.AgentRunRequest, userID int64) (*convEntity.Conversation, error) {
	var conversationData *convEntity.Conversation
	if ar.ConversationID > 0 {

		realCurrCon, err := c.ConversationDomainSVC.GetCurrentConversation(ctx, &convEntity.GetCurrent{
			UserID:      userID,
			AgentID:     ar.BotID,
			Scene:       ptr.From(ar.Scene),
			ConnectorID: consts.CozeConnectorID,
		})
		logs.CtxInfof(ctx, "conversatioin data:%v", conv.DebugJsonToStr(realCurrCon))
		if err != nil {
			return nil, err
		}
		if realCurrCon != nil {
			conversationData = realCurrCon
		}

	}

	if ar.ConversationID == 0 || conversationData == nil {

		conData, err := c.ConversationDomainSVC.Create(ctx, &convEntity.CreateMeta{
			AgentID:     ar.BotID,
			UserID:      userID,
			Scene:       ptr.From(ar.Scene),
			ConnectorID: consts.CozeConnectorID,
		})
		if err != nil {
			return nil, err
		}
		logs.CtxInfof(ctx, "conversatioin create data:%v", conv.DebugJsonToStr(conData))
		conversationData = conData

		ar.ConversationID = conversationData.ID
	}

	if conversationData.CreatorID != userID {
		return nil, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "conversation not match"))
	}

	return conversationData, nil
}

func (c *ConversationApplicationService) checkAgent(ctx context.Context, ar *run.AgentRunRequest) (*saEntity.SingleAgent, error) {
	agentInfo, err := c.appContext.SingleAgentDomainSVC.GetSingleAgent(ctx, ar.BotID, "")
	if err != nil {
		return nil, err
	}

	if agentInfo == nil {
		return nil, errorx.New(errno.ErrAgentNotExists)
	}
	return agentInfo, nil
}

func (c *ConversationApplicationService) buildAgentRunRequest(ctx context.Context, ar *run.AgentRunRequest, userID int64, spaceID int64, conversationData *convEntity.Conversation, shortcutCMD *cmdEntity.ShortcutCmd) (*entity.AgentRunMeta, error) {
	var contentType message.ContentType
	contentType = message.ContentTypeText

	if ptr.From(ar.ContentType) != string(message.ContentTypeText) {
		contentType = message.ContentTypeMix
	}

	shortcutCMDData, err := c.buildTools(ctx, ar.ToolList, shortcutCMD)

	if err != nil {
		return nil, err
	}

	arm := &entity.AgentRunMeta{
		ConversationID:   conversationData.ID,
		AgentID:          ar.BotID,
		Content:          c.buildMultiContent(ctx, ar),
		DisplayContent:   c.buildDisplayContent(ctx, ar),
		SpaceID:          spaceID,
		UserID:           conv.Int64ToStr(userID),
		SectionID:        conversationData.SectionID,
		PreRetrieveTools: shortcutCMDData,
		IsDraft:          ptr.From(ar.DraftMode),
		ConnectorID:      consts.CozeConnectorID,
		ContentType:      contentType,
		Ext:              ar.Extra,
	}
	return arm, nil
}

func (c *ConversationApplicationService) buildDisplayContent(ctx context.Context, ar *run.AgentRunRequest) string {
	if *ar.ContentType == run.ContentTypeText {
		return ""
	}
	return ar.Query
}

func (c *ConversationApplicationService) buildTools(ctx context.Context, tools []*run.Tool, shortcutCMD *cmdEntity.ShortcutCmd) ([]*entity.Tool, error) {
	var ts []*entity.Tool
	for _, tool := range tools {
		if shortcutCMD != nil {

			arguments := make(map[string]string)
			for key, parametersStruct := range tool.Parameters {
				if parametersStruct == nil {
					continue
				}

				arguments[key] = parametersStruct.Value
				// uri需要转换成url
				if parametersStruct.ResourceType == consts.ShortcutCommandResourceType {

					resourceInfo, err := c.appContext.ImageX.GetResourceURL(ctx, parametersStruct.Value)

					if err != nil {
						return nil, err
					}
					arguments[key] = resourceInfo.URL
				}
			}

			argBytes, err := json.Marshal(arguments)
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
	}

	return ts, nil
}

func (c *ConversationApplicationService) buildMultiContent(ctx context.Context, ar *run.AgentRunRequest) []*message.InputMetaData {
	var multiContents []*message.InputMetaData

	switch *ar.ContentType {
	case run.ContentTypeText:
		multiContents = append(multiContents, &message.InputMetaData{
			Type: message.InputTypeText,
			Text: ar.Query,
		})
	case run.ContentTypeImage, run.ContentTypeFile, run.ContentTypeMix, run.ContentTypeVideo, run.ContentTypeAudio:
		var mc *run.MixContentModel

		err := json.Unmarshal([]byte(ar.Query), &mc)
		if err != nil {
			multiContents = append(multiContents, &message.InputMetaData{
				Type: message.InputTypeText,
				Text: ar.Query,
			})
			return multiContents
		}

		mcContent, newItemList := c.parseMultiContent(ctx, mc.ItemList)

		multiContents = append(multiContents, mcContent...)

		mc.ItemList = newItemList
		mcByte, err := json.Marshal(mc)
		if err == nil {
			ar.Query = string(mcByte)
		}
	}

	return multiContents
}

func (c *ConversationApplicationService) parseMultiContent(ctx context.Context, mc []*run.Item) (multiContents []*message.InputMetaData, mcNew []*run.Item) {
	for index, item := range mc {
		switch item.Type {
		case run.ContentTypeText:
			multiContents = append(multiContents, &message.InputMetaData{
				Type: message.InputTypeText,
				Text: item.Text,
			})
		case run.ContentTypeImage:

			resourceUrl, err := c.appContext.ImageX.GetResourceURL(ctx, item.Image.Key)
			if err != nil {
				continue
			}
			mc[index].Image.ImageThumb.URL = resourceUrl.URL
			mc[index].Image.ImageOri.URL = resourceUrl.URL

			multiContents = append(multiContents, &message.InputMetaData{
				Type: message.InputTypeImage,
				FileData: []*message.FileData{
					{
						Url: resourceUrl.URL,
					},
				},
			})
		case run.ContentTypeFile, run.ContentTypeAudio, run.ContentTypeVideo:

			resourceUrl, err := c.appContext.TosClient.GetObjectUrl(ctx, item.File.FileKey)
			if err != nil {
				continue
			}
			mc[index].File.FileURL = resourceUrl

			multiContents = append(multiContents, &message.InputMetaData{
				Type: message.InputType(item.Type),
				FileData: []*message.FileData{
					{
						Url: resourceUrl,
					},
				},
			})
		}
	}

	return multiContents, mc
}
