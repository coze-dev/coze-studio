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
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
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

	c.SetStatusCode(http.StatusOK)
	c.Response.Header.Set("X-Accel-Buffering", "no")

	sseSender := sse2.NewSSESender(sse.NewStream(c))
	var sendErr error
	var sendAckEvent bool
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
				logs.CtxInfof(ctx, " sendErrorEvent err:%v", sendErr)
			}
			return
		}

		if chunk.Event == entity.RunEventMessageDelta && sendAckEvent == false { // send ack

			sendAckEvent = true
			sendErr = sendMessageEvent(ctx, sseSender, buildARSM2Message(chunk, &req, true))
			if sendErr != nil {
				logs.CtxInfof(ctx, "sendMessageEvent err:%v", sendErr)
				return
			}
		}

		if chunk.Event == entity.RunEventMessageDelta {
			sendErr = sendMessageEvent(ctx, sseSender, buildARSM2Message(chunk, &req, false))
		}
		if chunk.Event == entity.RunEventMessageCompleted {
			sendErr = sendMessageEvent(ctx, sseSender, buildARSM2Message(chunk, &req, true))
		}

		if sendErr != nil {
			logs.CtxInfof(ctx, " sendErrorEvent err:%v", sendErr)
		}
	}
}

func checkParams(ctx context.Context, ar *run.AgentRunRequest) error {
	if ar.BotID == "" {
		return errors.New("bot id is required")
	}

	if _, err := strconv.ParseInt(ar.BotID, 10, 64); err != nil {
		return errors.New("bot id is invalid")
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
	return sseImpl.Send(ctx, event)
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

	return sseImpl.Send(ctx, event)
}

func sendMessageEvent(ctx context.Context, sseImpl *sse2.SSenderImpl, msg []byte) error {
	event := &sse.Event{
		Event: run.RunEventMessage,
		Data:  msg,
	}
	return sseImpl.Send(ctx, event)
}

func buildARSM2Message(chunk *entity.AgentRunResponse, req *run.AgentRunRequest, isFinish bool) []byte {
	chunkMessageItem := chunk.ChunkMessageItem
	chunkMessage := &run.RunStreamResponse{
		ConversationID: req.ConversationID,
		IsFinish:       ptr.Of(isFinish),
		Message: &message.ChatMessage{
			Role:             string(chunkMessageItem.Role),
			Type:             string(chunkMessageItem.Type),
			Content:          chunkMessageItem.Content,
			ContentType:      string(chunkMessageItem.ContentType),
			MessageID:        strconv.FormatInt(chunkMessageItem.ID, 10),
			ReplyID:          strconv.FormatInt(chunkMessageItem.RunID, 10), // question id
			SectionID:        strconv.FormatInt(chunkMessageItem.SectionID, 10),
			ExtraInfo:        buildExt(chunkMessageItem.Ext),
			ContentTime:      chunkMessageItem.CreatedAt,
			SenderID:         ptr.Of(""),
			Status:           "",
			ReasoningContent: chunkMessageItem.ReasoningContent,
		},
		Index: int32(chunkMessageItem.Index),
		SeqID: int32(chunkMessageItem.SeqID),
	}
	mCM, _ := json.Marshal(chunkMessage)
	return mCM
}

func buildExt(ext string) *message.ExtraInfo {
	var extra map[string]string
	err := json.Unmarshal([]byte(ext), &extra)
	if err != nil {
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
