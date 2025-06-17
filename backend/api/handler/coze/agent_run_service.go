package coze

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"

	"github.com/hertz-contrib/sse"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/message"
	"code.byted.org/flow/opencoze/backend/api/model/conversation/run"
	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
	"code.byted.org/flow/opencoze/backend/application/conversation"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	sse2 "code.byted.org/flow/opencoze/backend/infra/impl/sse"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

// AgentRun .
// @router /api/conversation/chat [POST]
func AgentRun(ctx context.Context, c *app.RequestContext) {
	var err error
	var req run.AgentRunRequest

	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	if checkErr := checkParams(ctx, &req); checkErr != nil {
		invalidParamRequestResponse(c, checkErr.Error())
		return
	}

	sseSender := sse2.NewSSESender(sse.NewStream(c))
	c.SetStatusCode(http.StatusOK)
	c.Response.Header.Set("X-Accel-Buffering", "no")

	arStream, err := conversation.ConversationSVC.Run(ctx, &req)

	if err != nil {
		sendErrorEvent(ctx, sseSender, errno.ErrConversationAgentRunError, err.Error())
		return
	}

	for {
		chunk, recvErr := arStream.Recv()
		if recvErr != nil {
			if errors.Is(recvErr, io.EOF) {
				return
			}
			sendErrorEvent(ctx, sseSender, errno.ErrConversationAgentRunError, recvErr.Error())
			return
		}

		switch chunk.Event {
		case entity.RunEventCreated, entity.RunEventInProgress, entity.RunEventCompleted:
			break
		case entity.RunEventError:
			sendErrorEvent(ctx, sseSender, chunk.Error.Code, chunk.Error.Msg)
		case entity.RunEventStreamDone:
			sendDoneEvent(ctx, sseSender, run.RunEventDone)
		case entity.RunEventAck:
			sendMessageEvent(ctx, sseSender, run.RunEventMessage, buildARSM2Message(chunk, &req))
		case entity.RunEventMessageDelta, entity.RunEventMessageCompleted:
			sendMessageEvent(ctx, sseSender, run.RunEventMessage, buildARSM2Message(chunk, &req))
		default:
			logs.CtxErrorf(ctx, "unknown handler event:%v", chunk.Event)
		}

	}
}

func checkParams(_ context.Context, ar *run.AgentRunRequest) error {
	if ar.BotID == 0 {
		return errorx.New(errno.ErrConversationInvalidParamCode, errorx.KV("msg", "bot id is required"))
	}

	if ar.Scene == nil {
		return errorx.New(errno.ErrConversationInvalidParamCode, errorx.KV("msg", "scene is required"))
	}

	if ar.ContentType == nil {
		ar.ContentType = ptr.Of(run.ContentTypeText)
	}
	return nil
}

func sendDoneEvent(ctx context.Context, sseImpl *sse2.SSenderImpl, event string) {
	sendData := &sse.Event{
		Event: event,
	}

	sendErr := sseImpl.Send(ctx, sendData)
	if sendErr != nil {
		logs.CtxErrorf(ctx, "sendErrorEvent err:%v", sendErr)
	}
	return
}

func sendErrorEvent(ctx context.Context, sseImpl *sse2.SSenderImpl, errCode int64, errMsg string) {
	errData := run.ErrorData{
		Code: errCode,
		Msg:  errMsg,
	}
	ed, _ := json.Marshal(errData)

	event := &sse.Event{
		Event: run.RunEventError,
		Data:  ed,
	}
	sendErr := sseImpl.Send(ctx, event)

	if sendErr != nil {
		logs.CtxErrorf(ctx, "sendErrorEvent err:%v", sendErr)
	}

	return
}

func sendMessageEvent(ctx context.Context, sseImpl *sse2.SSenderImpl, event string, msg []byte) {
	sendData := &sse.Event{
		Event: event,
		Data:  msg,
	}
	sendErr := sseImpl.Send(ctx, sendData)
	if sendErr != nil {
		logs.CtxErrorf(ctx, "sendErrorEvent err:%v", sendErr)
	}
	return
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
	if chunkMessageItem.MessageType == model.MessageTypeAck {
		chunkMessage.Message.Content = req.GetQuery()
		chunkMessage.Message.ContentType = req.GetContentType()
		chunkMessage.Message.ExtraInfo = &message.ExtraInfo{
			LocalMessageID: req.GetLocalMessageID(),
		}
	} else {
		chunkMessage.Message.ExtraInfo = buildExt(chunkMessageItem.Ext)
		chunkMessage.Message.SenderID = ptr.Of(strconv.FormatInt(chunkMessageItem.AgentID, 10))
		chunkMessage.Message.Content = chunkMessageItem.Content

		if chunkMessageItem.MessageType == model.MessageTypeKnowledge {
			chunkMessage.Message.Type = string(model.MessageTypeVerbose)
		}
	}

	if chunk.ChunkMessageItem.IsFinish && chunkMessageItem.MessageType == model.MessageTypeAnswer {
		chunkMessage.Message.Content = ""
	}

	mCM, _ := json.Marshal(chunkMessage)
	return mCM
}

func buildExt(extra map[string]string) *message.ExtraInfo {
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

// ChatV3 .
// @router /v3/chat [POST]
func ChatV3(ctx context.Context, c *app.RequestContext) {
	var err error
	var req run.ChatV3Request
	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}
	if checkErr := checkParamsV3(ctx, &req); checkErr != nil {
		invalidParamRequestResponse(c, checkErr.Error())
		return
	}
	arStream, err := conversation.ConversationOpenAPISVC.OpenapiAgentRun(ctx, &req)

	sseSender := sse2.NewSSESender(sse.NewStream(c))

	c.SetStatusCode(http.StatusOK)
	c.Response.Header.Set("X-Accel-Buffering", "no")

	if err != nil {
		sendErrorEvent(ctx, sseSender, errno.ErrConversationAgentRunError, err.Error())
		return
	}

	for {
		chunk, recvErr := arStream.Recv()
		logs.CtxInfof(ctx, "chunk :%v, err:%v", conv.DebugJsonToStr(chunk), recvErr)
		if recvErr != nil {
			if errors.Is(recvErr, io.EOF) {
				return
			}
			sendErrorEvent(ctx, sseSender, errno.ErrConversationAgentRunError, recvErr.Error())
			return
		}

		switch chunk.Event {

		case entity.RunEventError:
			sendErrorEvent(ctx, sseSender, chunk.Error.Code, chunk.Error.Msg)
			break
		case entity.RunEventStreamDone:
			sendDoneEvent(ctx, sseSender, string(entity.RunEventStreamDone))
		case entity.RunEventAck:
			break

		case entity.RunEventCreated, entity.RunEventCancelled, entity.RunEventInProgress, entity.RunEventFailed, entity.RunEventCompleted:
			sendMessageEvent(ctx, sseSender, string(chunk.Event), buildARSM2ApiChatMessage(chunk, &req))
		case entity.RunEventMessageDelta, entity.RunEventMessageCompleted:
			sendMessageEvent(ctx, sseSender, string(chunk.Event), buildARSM2ApiMessage(chunk, &req))
		default:
			logs.CtxErrorf(ctx, "unknow handler event:%v", chunk.Event)
		}

	}
}

func buildARSM2ApiMessage(chunk *entity.AgentRunResponse, req *run.ChatV3Request) []byte {
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
	}

	mCM, _ := json.Marshal(chunkMessage)
	return mCM
}

func buildARSM2ApiChatMessage(chunk *entity.AgentRunResponse, req *run.ChatV3Request) []byte {
	chunkRunItem := chunk.ChunkRunItem
	chunkMessage := &run.ChatV3ChatDetail{
		ID:             chunkRunItem.ID,
		ConversationID: chunkRunItem.ConversationID,
		BotID:          chunkRunItem.AgentID,
		Status:         string(chunkRunItem.Status),
		SectionID:      ptr.Of(chunkRunItem.SectionID),
		CreatedAt:      ptr.Of(int32(chunkRunItem.CreatedAt)),
		CompletedAt:    ptr.Of(int32(chunkRunItem.CompletedAt)),
		FailedAt:       ptr.Of(int32(chunkRunItem.FailedAt)),
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

func checkParamsV3(_ context.Context, ar *run.ChatV3Request) error {
	if ar.BotID == 0 {
		return errorx.New(errno.ErrConversationInvalidParamCode, errorx.KV("msg", "bot id is required"))
	}
	return nil
}
