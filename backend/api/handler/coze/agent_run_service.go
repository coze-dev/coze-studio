package coze

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/hertz-contrib/sse"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/message"
	"code.byted.org/flow/opencoze/backend/api/model/conversation/run"
	"code.byted.org/flow/opencoze/backend/application/conversation"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	sse2 "code.byted.org/flow/opencoze/backend/infra/impl/sse"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

// AgentRun .
// @router /api/conversation/chat [POST]
func AgentRun(ctx context.Context, c *app.RequestContext) {
	var err error
	var req run.AgentRunRequest

	// startTime := time.Now()

	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	if checkErr := checkParams(ctx, &req); checkErr != nil {
		c.String(consts.StatusBadRequest, checkErr.Error())
		return
	}

	arStream, err := conversation.ConversationSVC.Run(ctx, &req)
	logs.CtxInfof(ctx, "AgentRun req:%v, err:%v", req, err)
	sseSender := sse2.NewSSESender(sse.NewStream(c))

	c.SetStatusCode(http.StatusOK)
	c.Response.Header.Set("X-Accel-Buffering", "no")

	var sendErr error
	for {
		chunk, recvErr := arStream.Recv()
		if recvErr != nil {
			if errors.Is(recvErr, io.EOF) { // stream done
				return
			}
			// send error
			sendErr = sendErrorEvent(ctx, sseSender, 400, recvErr.Error())
			if sendErr != nil {
				logs.CtxErrorf(ctx, " sendErrorEvent err:%v", sendErr)
			}
			return
		}
		switch chunk.Event {
		case entity.RunEventCreated, entity.RunEventInProgress, entity.RunEventCompleted:
			break
		case entity.RunEventError:
			sendErr = sendErrorEvent(ctx, sseSender, chunk.Error.Code, chunk.Error.Msg)
			if sendErr != nil {
				logs.CtxErrorf(ctx, " sendErrorEvent err:%v", sendErr)
			}
		case entity.RunEventStreamDone:
			sendErr = sendDoneEvent(ctx, sseSender, run.RunEventDone)
			if sendErr != nil {
				logs.CtxErrorf(ctx, " sendEventDone err:%v", sendErr)
			}

		case entity.RunEventAck:
			sendErr = sendMessageEvent(ctx, sseSender, run.RunEventMessage, buildARSM2Message(chunk, &req))
			if sendErr != nil {
				logs.CtxErrorf(ctx, "sendMessageEvent err:%v", sendErr)
			}
		case entity.RunEventMessageDelta, entity.RunEventMessageCompleted:
			sendErr = sendMessageEvent(ctx, sseSender, run.RunEventMessage, buildARSM2Message(chunk, &req))
			if sendErr != nil {
				logs.CtxErrorf(ctx, " sendErrorEvent err:%v", sendErr)
			}
		default:
			logs.CtxErrorf(ctx, "unknown handler event:%v", chunk.Event)
		}

	}
}

func checkParams(ctx context.Context, ar *run.AgentRunRequest) error {
	if ar.BotID == 0 {
		return errors.New("bot id is required")
	}

	if ar.Scene == nil {
		return errors.New("scene is required")
	}

	if ar.ContentType == nil {
		ar.ContentType = ptr.Of(run.ContentTypeText)
	}
	return nil
}

func sendDoneEvent(ctx context.Context, sseImpl *sse2.SSenderImpl, event string) error {
	sendData := &sse.Event{
		Event: event,
	}

	sendErr := sseImpl.Send(ctx, sendData)
	return sendErr
}

func sendErrorEvent(ctx context.Context, sseImpl *sse2.SSenderImpl, errCode int64, errMsg string) error {
	errData := run.ErrorData{
		Coze: errCode,
		Msg:  errMsg,
	}
	ed, _ := json.Marshal(errData)

	event := &sse.Event{
		Event: run.RunEventError,
		Data:  ed,
	}
	sendErr := sseImpl.Send(ctx, event)
	return sendErr
}

func sendMessageEvent(ctx context.Context, sseImpl *sse2.SSenderImpl, event string, msg []byte) error {
	sendData := &sse.Event{
		Event: event,
		Data:  msg,
	}
	sendErr := sseImpl.Send(ctx, sendData)
	return sendErr
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
		},
		Index: int32(chunkMessageItem.Index),
		SeqID: int32(chunkMessageItem.SeqID),
	}
	if chunkMessageItem.MessageType == entity.MessageTypeAck {
		chunkMessage.Message.Content = req.GetQuery()
		chunkMessage.Message.ContentType = req.GetContentType()
		chunkMessage.Message.ExtraInfo = &message.ExtraInfo{
			LocalMessageID: req.GetLocalMessageID(),
		}
	} else {
		chunkMessage.Message.ExtraInfo = buildExt(chunkMessageItem.Ext)
		chunkMessage.Message.SenderID = ptr.Of(strconv.FormatInt(chunkMessageItem.AgentID, 10))
		chunkMessage.Message.Content = chunkMessageItem.Content

		if chunkMessageItem.MessageType == entity.MessageTypeKnowledge {
			chunkMessage.Message.Type = string(entity.MessageTypeVerbose)
		}
	}

	if chunk.ChunkMessageItem.IsFinish && chunkMessageItem.MessageType == entity.MessageTypeAnswer {
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
		c.String(consts.StatusBadRequest, err.Error())
		return
	}
	if checkErr := checkParamsV3(ctx, &req); checkErr != nil {
		c.String(consts.StatusBadRequest, checkErr.Error())
		return
	}
	arStream, err := conversation.OpenapiAgentRunApplicationService.OpenapiAgentRun(ctx, &req)

	sseSender := sse2.NewSSESender(sse.NewStream(c))

	c.SetStatusCode(http.StatusOK)
	c.Response.Header.Set("X-Accel-Buffering", "no")

	var sendErr error
	for {
		chunk, recvErr := arStream.Recv()
		logs.CtxInfof(ctx, "chunk :%v, err:%v", conv.DebugJsonToStr(chunk), recvErr)
		if recvErr != nil {
			if errors.Is(recvErr, io.EOF) {
				return
			}

			sendErr = sendErrorEvent(ctx, sseSender, 400, recvErr.Error())
			if sendErr != nil {
				logs.CtxErrorf(ctx, " sendErrorEvent err:%v", sendErr)
			}
			return
		}

		switch chunk.Event {

		case entity.RunEventError:
			sendErr = sendErrorEvent(ctx, sseSender, chunk.Error.Code, chunk.Error.Msg)
			if sendErr != nil {
				logs.CtxErrorf(ctx, " sendErrorEvent err:%v", sendErr)
			}
		case entity.RunEventStreamDone:
			sendErr = sendDoneEvent(ctx, sseSender, string(entity.RunEventStreamDone))
			if sendErr != nil {
				logs.CtxErrorf(ctx, " sendEventDone err:%v", sendErr)
			}

		case entity.RunEventAck:
			break

		case entity.RunEventCreated, entity.RunEventCancelled, entity.RunEventInProgress, entity.RunEventFailed, entity.RunEventCompleted:
			sendErr = sendMessageEvent(ctx, sseSender, string(chunk.Event), buildARSM2ApiChatMessage(chunk, &req))
			if sendErr != nil {
				logs.CtxErrorf(ctx, " sendErrorEvent err:%v", sendErr)
			}
		case entity.RunEventMessageDelta, entity.RunEventMessageCompleted:
			sendErr = sendMessageEvent(ctx, sseSender, string(chunk.Event), buildARSM2ApiMessage(chunk, &req))
			if sendErr != nil {
				logs.CtxErrorf(ctx, " sendErrorEvent err:%v", sendErr)
			}
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

func checkParamsV3(ctx context.Context, ar *run.ChatV3Request) error {
	if ar.BotID == 0 {
		return errors.New("bot id is required")
	}
	return nil
}
