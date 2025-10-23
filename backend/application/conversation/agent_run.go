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
	"io"
	"strconv"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/message"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/run"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	crossDomainMessage "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	saEntity "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	convEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	msgEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	cmdEntity "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	sseImpl "github.com/coze-dev/coze-studio/backend/infra/sse/impl/sse"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (c *ConversationApplicationService) Run(ctx context.Context, sseSender *sseImpl.SSenderImpl, ar *run.AgentRunRequest) error {
	agentInfo, caErr := c.checkAgent(ctx, ar)
	if caErr != nil {
		logs.CtxErrorf(ctx, "checkAgent err:%v", caErr)
		return caErr
	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)
	conversationData, ccErr := c.checkConversation(ctx, ar, userID)

	if ccErr != nil {
		logs.CtxErrorf(ctx, "checkConversation err:%v", ccErr)
		return ccErr
	}

	if ar.RegenMessageID != nil && ptr.From(ar.RegenMessageID) > 0 {
		msgMeta, err := c.MessageDomainSVC.GetByID(ctx, ptr.From(ar.RegenMessageID))
		if err != nil {
			return err
		}
		if msgMeta != nil {
			if msgMeta.UserID != conv.Int64ToStr(userID) {
				return errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "message not match"))
			}

			err = c.AgentRunDomainSVC.Delete(ctx, []int64{msgMeta.RunID})
			if err != nil {
				return err
			}

			delErr := c.MessageDomainSVC.Delete(ctx, &msgEntity.DeleteMeta{
				RunIDs: []int64{msgMeta.RunID},
			})
			if delErr != nil {
				return delErr
			}
		}

	}
	var shortcutCmd *cmdEntity.ShortcutCmd
	if ar.GetShortcutCmdID() > 0 {
		cmdID := ar.GetShortcutCmdID()
		cmdMeta, err := c.ShortcutDomainSVC.GetByCmdID(ctx, cmdID, 0)
		if err != nil {
			return err
		}
		shortcutCmd = cmdMeta
	}

	arr, err := c.buildAgentRunRequest(ctx, ar, userID, agentInfo.SpaceID, conversationData, shortcutCmd)
	if err != nil {
		logs.CtxErrorf(ctx, "buildAgentRunRequest err:%v", err)
		return err
	}
	streamer, err := c.AgentRunDomainSVC.AgentRun(ctx, arr)
	if err != nil {
		return err
	}
	c.pullStream(ctx, sseSender, streamer, ar)
	return nil
}

func (c *ConversationApplicationService) pullStream(ctx context.Context, sseSender *sseImpl.SSenderImpl, arStream *schema.StreamReader[*entity.AgentRunResponse], req *run.AgentRunRequest) {
	var ackMessageInfo *entity.ChunkMessageItem
	for {
		chunk, recvErr := arStream.Recv()
		if recvErr != nil {
			if errors.Is(recvErr, io.EOF) {
				return
			}
			sseSender.Send(ctx, buildErrorEvent(errno.ErrConversationAgentRunError, recvErr.Error()))
			return
		}

		switch chunk.Event {
		case entity.RunEventCreated, entity.RunEventInProgress, entity.RunEventCompleted:
		case entity.RunEventError:
			id, err := c.GenID(ctx)
			if err != nil {
				sseSender.Send(ctx, buildErrorEvent(errno.ErrConversationAgentRunError, err.Error()))

			} else {
				sseSender.Send(ctx, buildMessageChunkEvent(run.RunEventMessage, buildErrMsg(ackMessageInfo, chunk.Error, id)))
			}
		case entity.RunEventStreamDone:
			sseSender.Send(ctx, buildDoneEvent(run.RunEventDone))
		case entity.RunEventAck:
			ackMessageInfo = chunk.ChunkMessageItem
			sseSender.Send(ctx, buildMessageChunkEvent(run.RunEventMessage, buildARSM2Message(chunk, req)))
		case entity.RunEventMessageDelta, entity.RunEventMessageCompleted:
			sseSender.Send(ctx, buildMessageChunkEvent(run.RunEventMessage, buildARSM2Message(chunk, req)))
		default:
			logs.CtxErrorf(ctx, "unknown handler event:%v", chunk.Event)
		}

	}
}

func buildARSM2Message(chunk *entity.AgentRunResponse, req *run.AgentRunRequest) []byte {
	chunkMessageItem := chunk.ChunkMessageItem

	chunkMessage := &run.RunStreamResponse{
		ConversationID: strconv.FormatInt(chunkMessageItem.ConversationID, 10),
		IsFinish:       ptr.Of(chunk.ChunkMessageItem.IsFinish),
		Message: &message.ChatMessage{
			Role:        string(chunkMessageItem.Role),
			ContentType: string(chunkMessageItem.ContentType),
			MessageID:   strconv.FormatInt(chunkMessageItem.ID, 10),
			SectionID:   strconv.FormatInt(chunkMessageItem.SectionID, 10),
			ContentTime: chunkMessageItem.CreatedAt,
			ExtraInfo:   buildExt(chunkMessageItem.Ext),
			ReplyID:     strconv.FormatInt(chunkMessageItem.ReplyID, 10),

			Status:           "",
			Type:             string(chunkMessageItem.MessageType),
			Content:          chunkMessageItem.Content,
			ReasoningContent: chunkMessageItem.ReasoningContent,
			RequiredAction:   chunkMessageItem.RequiredAction,
		},
		Index: int32(chunkMessageItem.Index),
		SeqID: int32(chunkMessageItem.SeqID),
	}
	if chunkMessageItem.MessageType == crossDomainMessage.MessageTypeAck {
		chunkMessage.Message.Content = req.GetQuery()
		chunkMessage.Message.ContentType = req.GetContentType()
		chunkMessage.Message.ExtraInfo = &message.ExtraInfo{
			LocalMessageID: req.GetLocalMessageID(),
		}
	} else {
		chunkMessage.Message.ExtraInfo = buildExt(chunkMessageItem.Ext)
		chunkMessage.Message.SenderID = ptr.Of(strconv.FormatInt(chunkMessageItem.AgentID, 10))
		chunkMessage.Message.Content = chunkMessageItem.Content

		if chunkMessageItem.MessageType == crossDomainMessage.MessageTypeKnowledge {
			chunkMessage.Message.Type = string(crossDomainMessage.MessageTypeVerbose)
		}
	}

	if chunk.ChunkMessageItem.IsFinish && chunkMessageItem.MessageType == crossDomainMessage.MessageTypeAnswer {
		chunkMessage.Message.Content = ""
		chunkMessage.Message.ReasoningContent = ptr.Of("")
	}

	mCM, _ := json.Marshal(chunkMessage)
	return mCM
}

func buildExt(extra map[string]string) *message.ExtraInfo {
	if extra == nil {
		return nil
	}

	return &message.ExtraInfo{
		InputTokens:         extra["input_tokens"],
		OutputTokens:        extra["output_tokens"],
		Token:               extra["token"],
		PluginStatus:        extra["plugin_status"],
		TimeCost:            extra["time_cost"],
		WorkflowTokens:      extra["workflow_tokens"],
		BotState:            extra["bot_state"],
		PluginRequest:       extra["plugin_request"],
		ToolName:            extra["tool_name"],
		Plugin:              extra["plugin"],
		MockHitInfo:         extra["mock_hit_info"],
		MessageTitle:        extra["message_title"],
		StreamPluginRunning: extra["stream_plugin_running"],
		ExecuteDisplayName:  extra["execute_display_name"],
		TaskType:            extra["task_type"],
		ReferFormat:         extra["refer_format"],
	}
}
func buildErrMsg(ackChunk *entity.ChunkMessageItem, err *entity.RunError, id int64) []byte {

	chunkMessage := &run.RunStreamResponse{
		IsFinish:       ptr.Of(true),
		ConversationID: strconv.FormatInt(ackChunk.ConversationID, 10),
		Message: &message.ChatMessage{
			Role:        string(schema.Assistant),
			ContentType: string(crossDomainMessage.ContentTypeText),
			Type:        string(crossDomainMessage.MessageTypeAnswer),
			MessageID:   strconv.FormatInt(id, 10),
			SectionID:   strconv.FormatInt(ackChunk.SectionID, 10),
			ReplyID:     strconv.FormatInt(ackChunk.ReplyID, 10),
			Content:     "Something error:" + err.Msg,
			ExtraInfo:   &message.ExtraInfo{},
		},
	}

	mCM, _ := json.Marshal(chunkMessage)
	return mCM
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
	var contentType crossDomainMessage.ContentType
	contentType = crossDomainMessage.ContentTypeText

	if ptr.From(ar.ContentType) != string(crossDomainMessage.ContentTypeText) {
		contentType = crossDomainMessage.ContentTypeMix
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
				// URI needs to be converted to url.
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
					PluginID:   shortcutCMD.PluginID,
					Arguments:  string(argBytes),
					ToolName:   shortcutCMD.PluginToolName,
					ToolID:     shortcutCMD.PluginToolID,
					Type:       agentrun.ToolType(shortcutCMD.ToolType),
					PluginFrom: bot_common.PluginFromPtr(bot_common.PluginFrom(shortcutCMD.Source)),
				})
			}

		}
	}

	return ts, nil
}

func (c *ConversationApplicationService) buildMultiContent(ctx context.Context, ar *run.AgentRunRequest) []*crossDomainMessage.InputMetaData {
	var multiContents []*crossDomainMessage.InputMetaData

	switch *ar.ContentType {
	case run.ContentTypeText:
		multiContents = append(multiContents, &crossDomainMessage.InputMetaData{
			Type: crossDomainMessage.InputTypeText,
			Text: ar.Query,
		})
	case run.ContentTypeImage, run.ContentTypeFile, run.ContentTypeMix, run.ContentTypeVideo, run.ContentTypeAudio:
		var mc *run.MixContentModel

		err := json.Unmarshal([]byte(ar.Query), &mc)
		if err != nil {
			multiContents = append(multiContents, &crossDomainMessage.InputMetaData{
				Type: crossDomainMessage.InputTypeText,
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

func (c *ConversationApplicationService) parseMultiContent(ctx context.Context, mc []*run.Item) (multiContents []*crossDomainMessage.InputMetaData, mcNew []*run.Item) {
	for index, item := range mc {
		switch item.Type {
		case run.ContentTypeText:
			multiContents = append(multiContents, &crossDomainMessage.InputMetaData{
				Type: crossDomainMessage.InputTypeText,
				Text: item.Text,
			})
		case run.ContentTypeImage:

			resourceUrl, err := c.getUrlByUri(ctx, item.Image.Key)
			if err != nil {
				logs.CtxErrorf(ctx, "failed to unescape resource url, err is %v", err)
				continue
			}

			if resourceUrl == "" {
				logs.CtxErrorf(ctx, "failed to unescape resource url, uri is %v", item.Image.Key)
				continue
			}

			mc[index].Image.ImageThumb.URL = resourceUrl
			mc[index].Image.ImageOri.URL = resourceUrl

			multiContents = append(multiContents, &crossDomainMessage.InputMetaData{
				Type: crossDomainMessage.InputTypeImage,
				FileData: []*crossDomainMessage.FileData{
					{
						Url: resourceUrl,
						URI: item.Image.Key,
					},
				},
			})
		case run.ContentTypeFile, run.ContentTypeAudio, run.ContentTypeVideo:

			resourceUrl, err := c.getUrlByUri(ctx, item.File.FileKey)
			if err != nil {
				continue
			}

			mc[index].File.FileURL = resourceUrl

			multiContents = append(multiContents, &crossDomainMessage.InputMetaData{
				Type: c.getType(item.File.FileType),
				FileData: []*crossDomainMessage.FileData{
					{
						Url: resourceUrl,
						URI: item.File.FileKey,
					},
				},
			})
		}
	}

	return multiContents, mc
}
func (c *ConversationApplicationService) getType(fileType string) crossDomainMessage.InputType {
	switch fileType {
	case string(crossDomainMessage.InputTypeAudio):
		return crossDomainMessage.InputTypeAudio
	case string(crossDomainMessage.InputTypeVideo):
		return crossDomainMessage.InputTypeVideo
	default:
		return crossDomainMessage.InputTypeFile
	}
}

func (c *ConversationApplicationService) getUrlByUri(ctx context.Context, uri string) (string, error) {

	url, err := c.appContext.ImageX.GetResourceURL(ctx, uri)
	if err != nil {
		return "", err
	}

	return url.URL, nil
}
