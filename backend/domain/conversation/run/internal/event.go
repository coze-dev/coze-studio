package internal

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
)

type Event struct {
	ctx context.Context
	sw  *schema.StreamWriter[*entity.AgentRunResponse]
}

func NewEvent(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse]) *Event {
	return &Event{
		ctx: ctx,
		sw:  sw,
	}
}

func (e *Event) buildMessageEvent(runEvent entity.RunEvent, messageItem *entity.MessageItem) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event:       runEvent,
		MessageItem: messageItem,
	}
}

func (e *Event) buildRunEvent(runEvent entity.RunEvent, runItem *entity.RunItem) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event:         runEvent,
		RunRecordItem: runItem,
	}
}

func (e *Event) buildErrEvent(runEvent entity.RunEvent, code int64, msg string) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event: runEvent,
		Error: &entity.RunError{
			Code: code,
			Msg:  msg,
		},
	}
}

func (e *Event) buildStreamDoneEvent() *entity.AgentRunResponse {

	return &entity.AgentRunResponse{
		Event: entity.RunEventStreamDone,
	}
}

func (e *Event) SendRunEvent(runEvent entity.RunEvent, runItem *entity.RunItem) error {
	resp := e.buildRunEvent(runEvent, runItem)
	e.sw.Send(resp, nil)
	return nil
}

func (e *Event) SendMsgEvent(runEvent entity.RunEvent, messageItem *entity.MessageItem) error {
	resp := e.buildMessageEvent(runEvent, messageItem)
	e.sw.Send(resp, nil)
	return nil
}

func (e *Event) SendErrEvent(runEvent entity.RunEvent, code int64, msg string) error {
	resp := e.buildErrEvent(runEvent, code, msg)
	e.sw.Send(resp, nil)
	return nil
}

func (e *Event) SendStreamDoneEvent() error {
	resp := e.buildStreamDoneEvent()
	e.sw.Send(resp, nil)
	return nil
}
