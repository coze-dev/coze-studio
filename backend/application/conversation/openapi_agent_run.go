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
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/schema"
	"github.com/google/uuid"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/run"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/agentrun"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/singleagent"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/application/upload"
	saEntity "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	convEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	cmdEntity "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	sseImpl "github.com/coze-dev/coze-studio/backend/infra/impl/sse"
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
	arr, err := a.buildAgentRunRequest(ctx, ar, connectorID, spaceID, conversationData, agentInfo)
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

func (a *OpenapiAgentRunApplication) buildAgentRunRequest(ctx context.Context, ar *run.ChatV3Request, connectorID int64, spaceID int64, conversationData *convEntity.Conversation, agentInfo *saEntity.SingleAgent) (*entity.AgentRunMeta, error) {

	shortcutCMDData, err := a.buildTools(ctx, ar.ShortcutCommand)
	if err != nil {
		return nil, err
	}
	multiContent, contentType, err := a.buildMultiContent(ctx, ar, agentInfo, spaceID)
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

// uploadBase64ToStorage 将base64编码的图片上传到存储服务，返回URL
func (a *OpenapiAgentRunApplication) uploadBase64ToStorage(ctx context.Context, base64Data string) (string, error) {
	// 1. 去掉data URI前缀（如果有）
	base64Content := base64Data
	if strings.HasPrefix(base64Data, "data:image/") {
		// 格式：data:image/png;base64,iVBORw0KG...
		parts := strings.SplitN(base64Data, ",", 2)
		if len(parts) == 2 {
			base64Content = parts[1]
		}
	}

	// 2. 解码base64
	imageBytes, err := base64.StdEncoding.DecodeString(base64Content)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to decode base64 image: %v", err)
		return "", err
	}

	// 3. 生成存储路径
	imageUUID := uuid.NewString()
	objName := fmt.Sprintf("bot_files/multimodal/%s.png", imageUUID)

	// 4. 上传到OSS
	logs.CtxInfof(ctx, "Uploading base64 image to storage: %s (size: %d bytes)", objName, len(imageBytes))

	uploadResp, err := upload.SVC.UploadFile(ctx, imageBytes, objName)
	if err != nil {
		logs.CtxErrorf(ctx, "Failed to upload base64 image: %v", err)
		return "", err
	}

	// 5. 获取上传后的URL
	uploadURL := uploadResp.Data.UploadURL
	logs.CtxInfof(ctx, "Base64 image uploaded successfully: %s", uploadURL)

	return uploadURL, nil
}

func (a *OpenapiAgentRunApplication) buildMultiContent(ctx context.Context, ar *run.ChatV3Request, agentInfo *saEntity.SingleAgent, spaceID int64) ([]*message.InputMetaData, message.ContentType, error) {
	var multiContents []*message.InputMetaData
	contentType := message.ContentTypeText

	// 🔥 新增：检查模型是否支持多模态
	isSupportMultimodal := a.checkModelMultimodalSupport(ctx, agentInfo, spaceID)
	logs.CtxInfof(ctx, "Model multimodal support: %v", isSupportMultimodal)

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

			// logs.CtxInfof(ctx, "inputs:%v, err:%v", conv.DebugJsonToStr(inputs), err)
			if err != nil {
				continue
			}

			// 🔥 新增：如果模型不支持多模态，提取文本内容并跳过图片
			if !isSupportMultimodal {
				textContent := a.extractTextFromObjectString(ctx, inputs)
				if textContent != "" {
					multiContents = append(multiContents, &message.InputMetaData{
						Type: message.InputTypeText,
						Text: textContent,
					})
					logs.CtxInfof(ctx, "Model does not support multimodal, extracted text: %s", textContent)
				}
				continue
			}

			// 🔥 关键修复：在处理之前，先把inputs中的base64上传转成URL
			// 这样后续序列化到数据库时就是短URL，不会超长
			contentModified := false
			for _, one := range inputs {
				if one == nil {
					continue
				}

				// 先处理图片类型，检测并上传base64
				if message.InputType(one.Type) == message.InputTypeImage || message.InputType(one.Type) == message.InputTypeFile {
					fileURL := one.GetFileURL()

					// 检测是否是base64编码的数据
					isBase64 := false
					if strings.HasPrefix(fileURL, "data:image/") {
						logs.CtxInfof(ctx, "Detected base64 image data (data: URI scheme)")
						isBase64 = true
					} else if strings.HasPrefix(fileURL, "/9j/") || strings.HasPrefix(fileURL, "iVBORw0KG") ||
						strings.HasPrefix(fileURL, "R0lGODlh") || strings.HasPrefix(fileURL, "UklGR") {
						logs.CtxInfof(ctx, "Detected raw base64 image data")
						isBase64 = true
						fileURL = "data:image/png;base64," + fileURL
					}

					// 如果是base64，先上传转成URL，并修改原始inputs
					if isBase64 {
						uploadedURL, uploadErr := a.uploadBase64ToStorage(ctx, fileURL)
						if uploadErr != nil {
							logs.CtxErrorf(ctx, "Failed to upload base64 image: %v", uploadErr)
							continue // 跳过这个图片
						}
						logs.CtxInfof(ctx, "Base64 uploaded successfully, replacing with URL: %s", uploadedURL)

						// 🔥 关键：修改原始inputs中的file_url，这样后续序列化时就是短URL
						one.FileURL = &uploadedURL
						contentModified = true
					}
				}
			}

			// 如果content被修改了，需要更新item.Content
			if contentModified {
				modifiedContent, _ := json.Marshal(inputs)
				item.Content = string(modifiedContent)
				logs.CtxInfof(ctx, "Updated AdditionalMessages content with uploaded URLs")
			}

			// 现在处理multiContents
			for _, one := range inputs {
				if one == nil {
					continue
				}

				logs.CtxInfof(ctx, "DEBUG: Processing input type='%s'", one.Type)

				switch message.InputType(one.Type) {
				case message.InputTypeText:
					multiContents = append(multiContents, &message.InputMetaData{
						Type: message.InputTypeText,
						Text: ptr.From(one.Text),
					})
				case message.InputTypeImage, message.InputTypeFile:
					// 此时fileURL已经是上传后的URL（如果原来是base64）
					fileURL := one.GetFileURL()
					var uri string

					// 不再是base64，按照普通URL处理
					// 普通URL或URI，需要处理
					var extractErr error
					uri, extractErr = a.extractURIFromURL(fileURL)
					if extractErr == nil && uri != "" {
						// 成功提取URI，重新生成访问URL
						logs.CtxInfof(ctx, "Extracted URI from URL: %s -> %s", fileURL, uri)
						regeneratedURL, urlErr := a.getUrlByUri(ctx, uri)
						if urlErr == nil && regeneratedURL != "" {
							logs.CtxInfof(ctx, "Regenerated URL for multimodal content: %s", regeneratedURL)
							fileURL = regeneratedURL
						} else {
							logs.CtxWarnf(ctx, "Failed to regenerate URL from URI %s, using original URL: %v", uri, urlErr)
						}
					} else {
						logs.CtxInfof(ctx, "Using original file URL (no URI extraction needed): %s", fileURL)
					}

					multiContents = append(multiContents, &message.InputMetaData{
						Type: message.InputType(one.Type),
						FileData: []*message.FileData{
							{
								Url: fileURL,
								URI: uri,  // 保存URI以便后续使用
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

// getUrlByUri 从URI重新生成带签名的访问URL（与Web接口保持一致）
func (a *OpenapiAgentRunApplication) getUrlByUri(ctx context.Context, uri string) (string, error) {
	if a.appContext == nil || a.appContext.ImageX == nil {
		return "", errors.New("ImageX service not available")
	}

	url, err := a.appContext.ImageX.GetResourceURL(ctx, uri)
	if err != nil {
		return "", err
	}

	return url.URL, nil
}

// extractURIFromURL 从完整URL中提取URI
// 例如：http://localhost:8889/opencoze/BIZ_BOT_ICON/xxx.jpg -> BIZ_BOT_ICON/xxx.jpg
// 或者：https://agents.finmall.com/api/storage/tos-cn-i-v4nquku3lp/xxx.jpg -> tos-cn-i-v4nquku3lp/xxx.jpg
func (a *OpenapiAgentRunApplication) extractURIFromURL(fileURL string) (string, error) {
	if fileURL == "" {
		return "", errors.New("empty file URL")
	}

	// 移除查询参数（?后面的部分）
	if idx := strings.Index(fileURL, "?"); idx >= 0 {
		fileURL = fileURL[:idx]
	}

	// 情况1: 如果URL包含 "/api/storage/"，提取后面的部分作为URI
	if idx := strings.Index(fileURL, "/api/storage/"); idx >= 0 {
		uri := fileURL[idx+len("/api/storage/"):]
		return uri, nil
	}

	// 情况2: 如果URL包含 "/opencoze/"，提取后面的部分作为URI
	if idx := strings.Index(fileURL, "/opencoze/"); idx >= 0 {
		path := fileURL[idx+len("/opencoze/"):]
		return path, nil
	}

	// 情况3: URL本身可能已经是URI（例如："tos-cn-i-v4nquku3lp/xxx.jpg"）
	if strings.Contains(fileURL, "tos-cn-") && !strings.HasPrefix(fileURL, "http") {
		return fileURL, nil
	}

	// 无法提取URI，返回空字符串（使用原始URL）
	return "", errors.New("cannot extract URI from URL: " + fileURL)
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
			// 🔥 修复：添加对Ack事件的处理
			sseSender.Send(ctx, buildMessageChunkEvent(string(chunk.Event), buildARSM2ApiMessage(chunk)))
		case entity.RunEventCreated, entity.RunEventCancelled, entity.RunEventInProgress, entity.RunEventFailed, entity.RunEventCompleted:
			sseSender.Send(ctx, buildMessageChunkEvent(string(chunk.Event), buildARSM2ApiChatMessage(chunk)))
		case entity.RunEventMessageDelta, entity.RunEventMessageCompleted:
			// 🔥 过滤输出节点的中间消息：如果是MessageDelta且包含message_title，则跳过
			if chunk.Event == entity.RunEventMessageDelta && chunk.ChunkMessageItem != nil {
				if messageTitle, exists := chunk.ChunkMessageItem.Ext["message_title"]; exists && messageTitle != "" {
					// 跳过输出节点的delta消息，只保留completed消息
					logs.CtxInfof(ctx, "跳过输出节点的delta消息: message_title=%s", messageTitle)
					continue
				}
			}
			// 🔥 修复：确保处理所有消息事件，包括工具调用后的回复
			// 对包含message_title的MessageCompleted消息添加ynet_type字段处理
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

	// 🔥 添加ynet_type字段逻辑：根据message_title的存在和内容判断类型
	if chunkMessage.MetaData != nil {
		if messageTitle, exists := chunkMessage.MetaData["message_title"]; exists && messageTitle != "" {
			// 如果存在message_title，根据content内容判断类型
			if strings.HasPrefix(chunkMessage.Content, "THINKING-") {
				// 如果content以"THINKING-"开头，设置为action类型，并去掉THINKING-前缀
				chunkMessage.MetaData["ynet_type"] = "action"
				chunkMessage.Content = strings.TrimPrefix(chunkMessage.Content, "THINKING-")
			} else {
				// 否则设置为tool_message类型
				chunkMessage.MetaData["ynet_type"] = "tool_message"
			}
		}
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

// checkModelMultimodalSupport 检查模型是否支持多模态（图片、视频等）
func (a *OpenapiAgentRunApplication) checkModelMultimodalSupport(ctx context.Context, agentInfo *saEntity.SingleAgent, spaceID int64) bool {
	// 如果没有ModelMgr，假设支持多模态（保持向后兼容）
	if a.appContext == nil || a.appContext.ModelMgr == nil {
		logs.CtxWarnf(ctx, "ModelMgr not available, assuming multimodal support")
		return true
	}

	// 获取模型ID
	if agentInfo.ModelInfo == nil || agentInfo.ModelInfo.ModelId == nil || ptr.From(agentInfo.ModelInfo.ModelId) == 0 {
		logs.CtxWarnf(ctx, "Model ID not found in agent info, assuming multimodal support")
		return true
	}

	modelID := ptr.From(agentInfo.ModelInfo.ModelId)

	// 获取模型详细信息
	var spaceIDPtr *uint64
	if spaceID > 0 {
		sid := uint64(spaceID)
		spaceIDPtr = &sid
	}

	models, err := a.appContext.ModelMgr.MGetModelByID(ctx, &modelmgr.MGetModelRequest{
		IDs:     []int64{modelID},
		SpaceID: spaceIDPtr,
	})

	if err != nil {
		logs.CtxErrorf(ctx, "Failed to get model info: %v, assuming multimodal support", err)
		return true
	}

	if len(models) == 0 {
		logs.CtxWarnf(ctx, "Model not found (ID: %d), assuming multimodal support", modelID)
		return true
	}

	modelInfo := models[0]

	// 检查 input_modal 字段
	// 如果 input_modal 包含 "image" 或其他非文本类型，则支持多模态
	if len(modelInfo.Meta.Capability.InputModal) > 1 {
		logs.CtxInfof(ctx, "Model %d supports multimodal (input_modal: %v)", modelID, modelInfo.Meta.Capability.InputModal)
		return true
	}

	// 只支持 text 单一模态
	logs.CtxInfof(ctx, "Model %d only supports text (input_modal: %v)", modelID, modelInfo.Meta.Capability.InputModal)
	return false
}

// extractTextFromObjectString 从 object_string 格式的内容中提取文本
// 如果包含图片，会添加 "this is a image: [url]" 的说明
func (a *OpenapiAgentRunApplication) extractTextFromObjectString(ctx context.Context, inputs []*run.AdditionalContent) string {
	var textParts []string

	for _, one := range inputs {
		if one == nil {
			continue
		}

		switch message.InputType(one.Type) {
		case message.InputTypeText:
			// 提取文本内容
			if one.Text != nil && ptr.From(one.Text) != "" {
				textParts = append(textParts, ptr.From(one.Text))
			}
		case message.InputTypeImage:
			// 添加图片URL说明
			fileURL := one.GetFileURL()
			if fileURL != "" {
				textParts = append(textParts, fmt.Sprintf("this is a image: %s", fileURL))
			}
		case message.InputTypeFile:
			// 添加文件URL说明
			fileURL := one.GetFileURL()
			if fileURL != "" {
				textParts = append(textParts, fmt.Sprintf("this is a file: %s", fileURL))
			}
		}
	}

	return strings.Join(textParts, " ")
}
