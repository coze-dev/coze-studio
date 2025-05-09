package internal

import (
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
)

type Event struct {
}

func NewEvent() *Event {
	return &Event{}
}

func (e *Event) buildMessageEvent(runEvent entity.RunEvent, chunkMsgItem *entity.ChunkMessageItem) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event:            runEvent,
		ChunkMessageItem: chunkMsgItem,
	}
}

func (e *Event) buildRunEvent(runEvent entity.RunEvent, chunkRunItem *entity.ChunkRunItem) *entity.AgentRunResponse {
	return &entity.AgentRunResponse{
		Event:        runEvent,
		ChunkRunItem: chunkRunItem,
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

func (e *Event) SendRunEvent(runEvent entity.RunEvent, runItem *entity.ChunkRunItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	resp := e.buildRunEvent(runEvent, runItem)
	sw.Send(resp, nil)
	return nil
}

func (e *Event) SendMsgEvent(runEvent entity.RunEvent, messageItem *entity.ChunkMessageItem, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	resp := e.buildMessageEvent(runEvent, messageItem)
	sw.Send(resp, nil)
	return nil
}

func (e *Event) SendErrEvent(runEvent entity.RunEvent, code int64, msg string, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	resp := e.buildErrEvent(runEvent, code, msg)
	sw.Send(resp, nil)
	return nil
}

func (e *Event) SendStreamDoneEvent(sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	resp := e.buildStreamDoneEvent()
	sw.Send(resp, nil)
	return nil
}
