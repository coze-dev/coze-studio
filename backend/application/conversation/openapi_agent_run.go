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
	"slices"
	"strconv"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/run"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	saEntity "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	convEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	cmdEntity "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	uploadService "github.com/coze-dev/coze-studio/backend/domain/upload/service"
	sseImpl "github.com/coze-dev/coze-studio/backend/infra/sse/impl/sse"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (a *OpenapiAgentRunApplication) OpenapiAgentRun(ctx context.Context, sseSender *sseImpl.SSenderImpl, ar *run.ChatV3Request) error {

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	creatorID := apiKeyInfo.UserID
	connectorID := apiKeyInfo.ConnectorID

	if ptr.From(ar.ConnectorID) == consts.WebSDKConnectorID {
		connectorID = ptr.From(ar.ConnectorID)
	}
	agentInfo, caErr := a.checkAgent(ctx, ar, connectorID)
	if caErr != nil {
		logs.CtxErrorf(ctx, "checkAgent err:%v", caErr)
		return caErr
	}

	conversationData, ccErr := a.checkConversation(ctx, ar, creatorID, connectorID)
	if ccErr != nil {
		logs.CtxErrorf(ctx, "checkConversation err:%v", ccErr)
		return ccErr
	}

	spaceID := agentInfo.SpaceID
	arr, err := a.buildAgentRunRequest(ctx, ar, connectorID, spaceID, conversationData)
	if err != nil {
		logs.CtxErrorf(ctx, "buildAgentRunRequest err:%v", err)
		return err
	}
	streamer, err := ConversationSVC.AgentRunDomainSVC.AgentRun(ctx, arr)
	if err != nil {
		return err
	}
	a.pullStream(ctx, sseSender, streamer)
	return nil
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
			return nil, errorx.New(errno.ErrConversationNotFound)
		}
		conversationData = conData

		ar.ConversationID = ptr.Of(conversationData.ID)
	}

	if conversationData.CreatorID != userID {
		return nil, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "user not match"))
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
		return nil, errorx.New(errno.ErrAgentNotExists)
	}
	return agentInfo, nil
}

func (a *OpenapiAgentRunApplication) buildAgentRunRequest(ctx context.Context, ar *run.ChatV3Request, connectorID int64, spaceID int64, conversationData *convEntity.Conversation) (*entity.AgentRunMeta, error) {

	shortcutCMDData, err := a.buildTools(ctx, ar.ShortcutCommand)
	if err != nil {
		return nil, err
	}
	multiAdditionalMessages, err := a.parseAdditionalMessages(ctx, ar)
	if err != nil {
		return nil, err
	}
	filterMultiAdditionalMessages, multiContent, contentType, err := a.parseQueryContent(ctx, multiAdditionalMessages)
	if err != nil {
		return nil, err
	}
	displayContent := a.buildDisplayContent(ctx, ar)
	chatflowParameters, err := parseChatflowParameters(ctx, ar)
	if err != nil {
		return nil, err
	}
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
		Ext: func() map[string]string {
			if ar.ExtraParams == nil {
				return map[string]string{}
			}
			return ar.ExtraParams
		}(),
		CustomVariables:    ar.CustomVariables,
		CozeUID:            conversationData.CreatorID,
		AdditionalMessages: filterMultiAdditionalMessages,
		ChatflowParameters: chatflowParameters,
	}
	return arm, nil
}
func parseChatflowParameters(ctx context.Context, ar *run.ChatV3Request) (map[string]any, error) {
	parameters := make(map[string]any)
	if ar.Parameters != nil {
		if err := json.Unmarshal([]byte(*ar.Parameters), &parameters); err != nil {
			return nil, errors.New("parameters field should be an object, not a string")
		}
		return parameters, nil
	}
	return parameters, nil
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
				PluginID:   shortcutCMD.PluginID,
				Arguments:  string(argBytes),
				ToolName:   shortcutCMD.PluginToolName,
				ToolID:     shortcutCMD.PluginToolID,
				Type:       agentrun.ToolType(shortcutCMD.ToolType),
				PluginFrom: bot_common.PluginFromPtr(bot_common.PluginFrom(shortcutCMD.Source)),
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

func (a *OpenapiAgentRunApplication) parseQueryContent(ctx context.Context, multiAdditionalMessages []*entity.AdditionalMessage) ([]*entity.AdditionalMessage, []*message.InputMetaData, message.ContentType, error) {

	var multiContent []*message.InputMetaData
	var contentType message.ContentType
	var filterMultiAdditionalMessages []*entity.AdditionalMessage
	filterMultiAdditionalMessages = multiAdditionalMessages

	if len(multiAdditionalMessages) > 0 {
		lastMessage := multiAdditionalMessages[len(multiAdditionalMessages)-1]
		if lastMessage != nil && lastMessage.Role == schema.User {
			multiContent = lastMessage.Content
			contentType = lastMessage.ContentType
			filterMultiAdditionalMessages = multiAdditionalMessages[:len(multiAdditionalMessages)-1]
		}
	}

	return filterMultiAdditionalMessages, multiContent, contentType, nil
}

func (a *OpenapiAgentRunApplication) parseAdditionalMessages(ctx context.Context, ar *run.ChatV3Request) ([]*entity.AdditionalMessage, error) {

	additionalMessages := make([]*entity.AdditionalMessage, 0, len(ar.AdditionalMessages))

	for _, item := range ar.AdditionalMessages {
		if item == nil {
			continue
		}
		if item.Role != string(schema.User) && item.Role != string(schema.Assistant) {
			return nil, errors.New("additional message role only support user and assistant")
		}
		if item.Type != nil && !slices.Contains([]message.MessageType{message.MessageTypeQuestion, message.MessageTypeAnswer}, message.MessageType(*item.Type)) {
			return nil, errors.New("additional message type only support question and answer now")
		}

		addOne := entity.AdditionalMessage{
			Role: schema.RoleType(item.Role),
		}
		if item.Type != nil {
			addOne.Type = message.MessageType(*item.Type)
		} else {
			addOne.Type = message.MessageTypeQuestion
		}

		if item.ContentType == run.ContentTypeText {
			if item.Content == "" {
				continue
			}

			addOne.ContentType = message.ContentTypeText
			addOne.Content = []*message.InputMetaData{{
				Type: message.InputTypeText,
				Text: item.Content,
			}}
		}

		if item.ContentType == run.ContentTypeMixApi {

			if ptr.From(item.Type) == string(message.MessageTypeAnswer) {
				return nil, errors.New(" answer messages only support text content")
			}

			addOne.ContentType = message.ContentTypeMix
			var inputs []*run.AdditionalContent
			err := json.Unmarshal([]byte(item.Content), &inputs)

			logs.CtxInfof(ctx, "inputs:%v, err:%v", conv.DebugJsonToStr(inputs), err)
			if err != nil {
				continue
			}
			for _, one := range inputs {
				if one == nil {
					continue
				}
				switch message.InputType(one.Type) {
				case message.InputTypeText:

					addOne.Content = append(addOne.Content, &message.InputMetaData{
						Type: message.InputTypeText,
						Text: ptr.From(one.Text),
					})
				case message.InputTypeImage, message.InputTypeFile:

					var fileUrl, fileURI string
					if one.GetFileURL() != "" {
						fileUrl = one.GetFileURL()
					} else if one.GetFileID() != 0 {
						fileInfo, err := a.UploaodDomainSVC.GetFile(ctx, &uploadService.GetFileRequest{
							ID: one.GetFileID(),
						})
						if err != nil {
							return nil, err
						}
						fileUrl = fileInfo.File.Url
						fileURI = fileInfo.File.TosURI
					}
					addOne.Content = append(addOne.Content, &message.InputMetaData{
						Type: message.InputType(one.Type),
						FileData: []*message.FileData{
							{
								Url: fileUrl,
								URI: fileURI,
							},
						},
					})
				default:
					continue
				}
			}
		}
		additionalMessages = append(additionalMessages, &addOne)
	}

	return additionalMessages, nil
}

func (a *OpenapiAgentRunApplication) pullStream(ctx context.Context, sseSender *sseImpl.SSenderImpl, streamer *schema.StreamReader[*entity.AgentRunResponse]) {
	for {
		chunk, recvErr := streamer.Recv()
		logs.CtxInfof(ctx, "chunk :%v, err:%v", conv.DebugJsonToStr(chunk), recvErr)
		if recvErr != nil {
			if errors.Is(recvErr, io.EOF) {
				return
			}
			sseSender.Send(ctx, buildErrorEvent(errno.ErrConversationAgentRunError, recvErr.Error()))
			return
		}

		switch chunk.Event {

		case entity.RunEventError:
			sseSender.Send(ctx, buildErrorEvent(chunk.Error.Code, chunk.Error.Msg))
		case entity.RunEventStreamDone:
			sseSender.Send(ctx, buildDoneEvent(string(entity.RunEventStreamDone)))
		case entity.RunEventAck:
		case entity.RunEventCreated, entity.RunEventCancelled, entity.RunEventInProgress, entity.RunEventFailed, entity.RunEventCompleted:
			sseSender.Send(ctx, buildMessageChunkEvent(string(chunk.Event), buildARSM2ApiChatMessage(chunk)))
		case entity.RunEventMessageDelta, entity.RunEventMessageCompleted:
			sseSender.Send(ctx, buildMessageChunkEvent(string(chunk.Event), buildARSM2ApiMessage(chunk)))

		default:
			logs.CtxErrorf(ctx, "unknow handler event:%v", chunk.Event)
		}
	}
}

func buildARSM2ApiMessage(chunk *entity.AgentRunResponse) []byte {
	chunkMessageItem := chunk.ChunkMessageItem
	chunkMessage := &run.ChatV3MessageDetail{
		ID:               strconv.FormatInt(chunkMessageItem.ID, 10),
		ConversationID:   strconv.FormatInt(chunkMessageItem.ConversationID, 10),
		BotID:            strconv.FormatInt(chunkMessageItem.AgentID, 10),
		Role:             string(chunkMessageItem.Role),
		Type:             string(chunkMessageItem.MessageType),
		Content:          chunkMessageItem.Content,
		ContentType:      string(chunkMessageItem.ContentType),
		MetaData:         chunkMessageItem.Ext,
		ChatID:           strconv.FormatInt(chunkMessageItem.RunID, 10),
		ReasoningContent: chunkMessageItem.ReasoningContent,
		CreatedAt:        ptr.Of(chunkMessageItem.CreatedAt / 1000),
	}

	mCM, _ := json.Marshal(chunkMessage)
	return mCM
}

func buildARSM2ApiChatMessage(chunk *entity.AgentRunResponse) []byte {
	chunkRunItem := chunk.ChunkRunItem
	chunkMessage := &run.ChatV3ChatDetail{
		ID:             chunkRunItem.ID,
		ConversationID: chunkRunItem.ConversationID,
		BotID:          chunkRunItem.AgentID,
		Status:         string(chunkRunItem.Status),
		SectionID:      ptr.Of(chunkRunItem.SectionID),
		CreatedAt:      ptr.Of(int32(chunkRunItem.CreatedAt / 1000)),
		CompletedAt:    ptr.Of(int32(chunkRunItem.CompletedAt / 1000)),
		FailedAt:       ptr.Of(int32(chunkRunItem.FailedAt / 1000)),
	}
	if chunkRunItem.Usage != nil {
		chunkMessage.Usage = &run.Usage{
			TokenCount:   ptr.Of(int32(chunkRunItem.Usage.LlmTotalTokens)),
			InputTokens:  ptr.Of(int32(chunkRunItem.Usage.LlmPromptTokens)),
			OutputTokens: ptr.Of(int32(chunkRunItem.Usage.LlmCompletionTokens)),
		}
	}
	mCM, _ := json.Marshal(chunkMessage)
	return mCM
}

func (a *OpenapiAgentRunApplication) CancelRun(ctx context.Context, req *run.CancelChatApiRequest) (*run.CancelChatApiResponse, error) {
	resp := new(run.CancelChatApiResponse)

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID

	runRecord, err := ConversationSVC.AgentRunDomainSVC.GetByID(ctx, req.ChatID)
	if err != nil {
		return nil, err
	}
	if runRecord == nil {
		return nil, errorx.New(errno.ErrRecordNotFound)
	}

	conversationData, err := ConversationSVC.ConversationDomainSVC.GetByID(ctx, req.ConversationID)
	if err != nil {
		return nil, err
	}

	if userID != conversationData.CreatorID {
		return nil, errorx.New(errno.ErrConversationPermissionCode, errorx.KV("msg", "user not match"))
	}

	if runRecord.Status != entity.RunStatusInProgress && runRecord.Status != entity.RunStatusCreated {
		return nil, errorx.New(errno.ErrInProgressCanNotCancel)
	}

	runMeta, err := ConversationSVC.AgentRunDomainSVC.Cancel(ctx, &entity.CancelRunMeta{
		RunID:          req.ChatID,
		ConversationID: req.ConversationID,
	})
	if err != nil {
		return nil, err
	}
	if runMeta == nil {
		return nil, errorx.New(errno.ErrConversationAgentRunError)
	}

	resp.ChatV3ChatDetail = &run.ChatV3ChatDetail{
		ID:             runMeta.ID,
		ConversationID: runMeta.ConversationID,
		BotID:          runMeta.AgentID,
		Status:         string(runMeta.Status),
		SectionID:      ptr.Of(runMeta.SectionID),
		CreatedAt:      ptr.Of(int32(runMeta.CreatedAt / 1000)),
		CompletedAt:    ptr.Of(int32(runMeta.CompletedAt / 1000)),
		FailedAt:       ptr.Of(int32(runMeta.FailedAt / 1000)),
	}
	if runMeta.Usage != nil {
		resp.ChatV3ChatDetail.Usage = &run.Usage{
			TokenCount:   ptr.Of(int32(runMeta.Usage.LlmTotalTokens)),
			InputTokens:  ptr.Of(int32(runMeta.Usage.LlmPromptTokens)),
			OutputTokens: ptr.Of(int32(runMeta.Usage.LlmCompletionTokens)),
		}
	}

	return resp, nil
}
