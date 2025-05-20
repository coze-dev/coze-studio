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
	"golang.org/x/exp/slices"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/message"
	"code.byted.org/flow/opencoze/backend/api/model/conversation/run"
	"code.byted.org/flow/opencoze/backend/application/conversation"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	sse2 "code.byted.org/flow/opencoze/backend/infra/impl/sse"
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

	arStream, err := conversation.AgentRunApplicationService.Run(ctx, &req)
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
				logs.CtxInfof(ctx, " sendErrorEvent err:%v", sendErr)
				return
			}
		}
		if slices.Contains([]entity.RunEvent{entity.RunEventCreated, entity.RunEventInProgress}, chunk.Event) { // skip
			continue
		}

		if chunk.Event == entity.RunEventError { // send error
			sendErr = sendErrorEvent(ctx, sseSender, chunk.Error.Code, chunk.Error.Msg)
			if sendErr != nil {
				logs.CtxInfof(ctx, " sendErrorEvent err:%v", sendErr)
				return
			}
		}
		if chunk.Event == entity.RunEventStreamDone {
			sendErr = sendDoneEvent(ctx, sseSender)
			if sendErr != nil {
				logs.CtxInfof(ctx, " sendEventDone err:%v", sendErr)
			}
			return
		}

		if chunk.Event == entity.RunEventAck {

			sendErr = sendMessageEvent(ctx, sseSender, buildARSM2Message(chunk, &req))
			if sendErr != nil {
				logs.CtxInfof(ctx, "sendMessageEvent err:%v", sendErr)
				return
			}
		}

		if chunk.Event == entity.RunEventMessageDelta {
			sendErr = sendMessageEvent(ctx, sseSender, buildARSM2Message(chunk, &req))
		}
		if chunk.Event == entity.RunEventMessageCompleted {
			sendErr = sendMessageEvent(ctx, sseSender, buildARSM2Message(chunk, &req))
		}

		if sendErr != nil {
			logs.CtxInfof(ctx, " sendErrorEvent err:%v", sendErr)
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
		// set default content type
		ar.ContentType = ptr.Of(run.ContentTypeText)
	}
	return nil
}

func sendDoneEvent(ctx context.Context, sseImpl *sse2.SSenderImpl) error {
	event := &sse.Event{
		Event: run.RunEventDone,
	}

	sendErr := sseImpl.Send(ctx, event)
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

func sendMessageEvent(ctx context.Context, sseImpl *sse2.SSenderImpl, msg []byte) error {
	event := &sse.Event{
		Event: run.RunEventMessage,
		Data:  msg,
	}
	sendErr := sseImpl.Send(ctx, event)
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

	resp := new(run.ChatV3Response)

	c.JSON(consts.StatusOK, resp)
}
