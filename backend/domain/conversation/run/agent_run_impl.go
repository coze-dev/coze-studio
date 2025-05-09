package run

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"runtime/debug"
	"sync"
	"time"

	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/crossdomain/conversation/message"
	entity2 "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/dal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type runImpl struct {
	IDGen         idgen.IDGenerator
	RunRecordDAO  *dal.RunRecordDAO
	DB            *gorm.DB
	cdMessage     crossdomain.Message
	runProcess    *internal.RunProcess
	runEvent      *internal.Event
	cdSingleAgent crossdomain.SingleAgent
}

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewService(c *Components, csa crossdomain.SingleAgent) Run {
	return &runImpl{
		IDGen:         c.IDGen,
		RunRecordDAO:  dal.NewRunRecordDAO(c.DB, c.IDGen),
		DB:            c.DB,
		cdMessage:     message.NewCDMessage(c.IDGen, c.DB),
		runProcess:    internal.NewRunProcess(c.DB, c.IDGen),
		runEvent:      internal.NewEvent(),
		cdSingleAgent: csa,
	}
}

func (c *runImpl) AgentRun(ctx context.Context, req *entity.AgentRunRequest) (sr *schema.StreamReader[*entity.AgentRunResponse], err error) {
	// create stream reader & writer
	sr, sw := schema.Pipe[*entity.AgentRunResponse](10)
	defer sw.Close()
	// create run record & send run created event
	runRecordPoData, err := c.createRunRecord(ctx, sw, req)
	if err != nil {
		return
	}

	defer func() {
		if pe := recover(); pe != nil {
			log.Printf("panic recover: %v\n, [stack]:%v", pe, string(debug.Stack()))
			err = errors.New("panic:" + string(debug.Stack()))
			return
		}

		// send run completed event
		srRecord := c.buildSendRunRecord(ctx, runRecordPoData, entity.RunStatusCompleted)

		if err != nil {
			// send run failed event
			srRecord.Error = &entity.RunError{
				Code: 10000,
				Msg:  err.Error(),
			}
			err = c.runProcess.StepToFailed(ctx, srRecord, sw)
			return
		}

		err = c.runProcess.StepToComplete(ctx, srRecord, sw)
		if err != nil {
			log.Println("send run completed event error:", err)
		}

		// send stream done event
		err = c.runProcess.StepToDone(sw)
		if err != nil {
			log.Println("send stream done event error:", err)
		}
	}()

	return sr, c.run(ctx, req, sw, runRecordPoData)
}

func (c *runImpl) run(ctx context.Context, runReq *entity.AgentRunRequest, sw *schema.StreamWriter[*entity.AgentRunResponse], runRecord *model.RunRecord) (err error) {
	// get history
	history, err := c.getHistory(ctx, runReq)
	if err != nil {
		return
	}

	input, err := c.handlerInput(ctx, runReq, runRecord.ID)
	if err != nil {
		return
	}

	ch := make(chan *entity.AgentRespEvent, 100)
	chAnswer := make(chan *schema.Message, 100)

	streamer, err := c.cdSingleAgent.StreamExecute(ctx, history, input)
	if err != nil {
		return err
	}

	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		err = c.pullFromStream(ctx, ch, chAnswer, streamer)
	}()

	go func() {
		defer wg.Done()
		err = c.pull(ctx, runRecord.ID, runReq, ch, chAnswer, sw)
	}()

	wg.Wait()

	return nil
}

func (c *runImpl) pullFromStream(ctx context.Context, ch chan *entity.AgentRespEvent, chAnswer chan *schema.Message, events *schema.StreamReader[*entity2.AgentEvent]) (err error) {
	ctx, cancel := context.WithCancel(ctx)

	defer func() {
		close(ch)
		close(chAnswer)
		cancel()
	}()

	for {
		var resp *entity2.AgentEvent
		if resp, err = events.Recv(); err != nil {
			if errors.Is(err, io.EOF) {
				return nil
			}
			return err
		}
		eventType, tErr := transformEventMap(resp.EventType)

		if tErr != nil {
			return tErr
		}

		respChunk := &entity.AgentRespEvent{
			EventType:    eventType,
			FinalAnswer:  resp.FinalAnswer,
			ToolsMessage: resp.ToolsMessage,
			FuncCall:     resp.FuncCall,
			Knowledge:    resp.Knowledge,
			// Suggest: resp.Suggest,
		}

		ch <- respChunk

		if resp.EventType == entity2.EventTypeOfFinalAnswer {
			for {
				answer, answerErr := resp.FinalAnswer.Recv()
				if answerErr != nil {
					if errors.Is(answerErr, io.EOF) {
						return nil
					}
					return answerErr
				}
				chAnswer <- answer
			}
		}
	}
}

func transformEventMap(eventType entity2.EventType) (entity.MessageType, error) {
	var eType entity.MessageType
	switch eventType {
	case entity2.EventTypeOfFuncCall:
		return entity.MessageTypeFunctionCall, nil
	case entity2.EventTypeOfKnowledge:
		return entity.MessageTypeKnowledge, nil
	case entity2.EventTypeOfToolsMessage:
		return entity.MessageTypeToolResponse, nil
	case entity2.EventTypeOfFinalAnswer:
		return entity.MessageTypeAnswer, nil
	case entity2.EventTypeOfSuggest:
		return entity.MessageTypeFlowUp, nil
	}
	return eType, errors.New("unknown event type")
}

func (c *runImpl) buildAgentMessage2Create(ctx context.Context, req *entity.AgentRunRequest, runID int64, role schema.RoleType, messageType entity.MessageType, chunkMsg *schema.Message) *msgEntity.Message {
	msg := &msgEntity.Message{
		ConversationID: req.ConversationID,
		RunID:          runID,
		AgentID:        req.AgentID,
		SectionID:      req.SectionID,
		UserID:         req.UserID,
		Role:           role,
		MessageType:    messageType,
		ContentType:    entity.ContentTypeText,
		Content:        chunkMsg.Content,
	}

	// build model content
	modelContent := chunkMsg
	mc, err := json.Marshal(modelContent)
	if err == nil {
		msg.ModelContent = string(mc)
	}

	return msg
}

func (c *runImpl) buildRunRecord2PO(ctx context.Context, chat *entity.AgentRunRequest) (*model.RunRecord, error) {
	runID, err := c.IDGen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	reqOrigin, err := json.Marshal(chat)
	if err != nil {
		return nil, err
	}
	timeNow := time.Now().UnixMilli()
	return &model.RunRecord{
		ID:             runID,
		ConversationID: chat.ConversationID,
		SectionID:      chat.SectionID,
		AgentID:        chat.AgentID,
		Status:         string(entity.RunStatusCreated),
		ChatRequest:    string(reqOrigin),
		CreatorID:      chat.UserID,
		CreatedAt:      timeNow,
	}, nil
}

func (c *runImpl) getHistory(ctx context.Context, req *entity.AgentRunRequest) ([]*msgEntity.Message, error) {
	// query run record
	conversationTurns := int64(entity.ConversationTurnsDefault) // todo::需要替换成agent上配置的会话论述
	chatList, err := c.RunRecordDAO.List(ctx, req.ConversationID, conversationTurns)
	if err != nil {
		return nil, err
	}

	if len(chatList) == 0 {
		return nil, nil
	}
	// query message by run ids
	RunIDS := getRunID(chatList)

	// query message
	history, err := c.cdMessage.GetMessageListByRunID(ctx, req.ConversationID, RunIDS)
	if err != nil {
		return nil, err
	}

	// return history
	return history, nil
}

func getRunID(chat []*model.RunRecord) []int64 {
	ids := make([]int64, len(chat))
	for i, c := range chat {
		ids[i] = c.ID
	}

	return ids
}

func (c *runImpl) createRunRecord(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], req *entity.AgentRunRequest) (*model.RunRecord, error) {
	runPoData, err := c.RunRecordDAO.Create(ctx, req)
	if err != nil {
		return nil, err
	}

	// send run create event
	srRecord := c.buildSendRunRecord(ctx, runPoData, entity.RunStatusCreated)

	err = c.runProcess.StepToCreate(ctx, srRecord, sw)
	if err != nil {
		return nil, err
	}

	// send run create in progress
	err = c.runProcess.StepToInProgress(ctx, srRecord, sw)
	if err != nil {
		return nil, err
	}

	return runPoData, nil
}

func (c *runImpl) handlerInput(ctx context.Context, req *entity.AgentRunRequest, runID int64) (*msgEntity.Message, error) {
	msgMeta := &msgEntity.Message{
		ConversationID: req.ConversationID,
		RunID:          runID,
		AgentID:        req.AgentID,
		SectionID:      req.SectionID,
		UserID:         req.UserID,
		Role:           schema.User,
		MessageType:    entity.MessageTypeQuestion,
		ContentType:    req.ContentType,
		MultiContent:   req.Content,
		Ext:            req.Ext,
	}

	for _, content := range req.Content {
		if content.Type == entity.InputTypeText {
			msgMeta.Content = content.Text
			msgMeta.ContentType = entity.ContentTypeText
			break
		}
	}

	contentString, err := json.Marshal(req.Content)
	if err == nil {
		msgMeta.DisplayContent = string(contentString)
	}

	return c.cdMessage.CreateMessage(ctx, msgMeta)
}

func (c *runImpl) pull(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, ch chan *entity.AgentRespEvent, chAnswer chan *schema.Message, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	for {
		chunk, ok := <-ch
		if !ok || chunk == nil {
			return nil
		}

		switch chunk.EventType {
		case entity.MessageTypeFunctionCall:
			err := c.handlerFunctionCall(ctx, runID, runReq, chunk, sw)
			if err != nil {
				return err
			}
		case entity.MessageTypeToolResponse:
			return c.handlerTooResponse(ctx, runID, runReq, chunk, sw)
		case entity.MessageTypeKnowledge:
			c.handlerKnowledge(ctx, runID, runReq, chunk, sw)
		case entity.MessageTypeAnswer:
			fullContent := bytes.NewBuffer([]byte{})
			preMsg, err := c.handlerPreAnswer(ctx, runID, runReq)
			if err != nil {
				return err
			}
			for {
				answer, ok := <-chAnswer
				sendMsg := c.buildSendMsg(ctx, preMsg)
				if !ok || answer == nil {
					sendMsg.Content = fullContent.String()
					saveErr := c.handlerFinalAnswer(ctx, sendMsg, fullContent.String(), sw)
					if saveErr != nil {
						return err
					}
					err = c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
					break
				}
				if answer.Content != "" {
					fullContent.WriteString(answer.Content)
				}

				sendMsg.Content = answer.Content
				err = c.runEvent.SendMsgEvent(entity.RunEventMessageDelta, sendMsg, sw)
			}

		case entity.MessageTypeFlowUp:
			c.handlerSuggest(ctx, runID, runReq, chunk, sw)
		}
	}
}

func (c *runImpl) handlerPreAnswer(ctx context.Context, runID int64, runReq *entity.AgentRunRequest) (*msgEntity.Message, error) {
	msgMeta := &msgEntity.Message{
		ConversationID: runReq.ConversationID,
		RunID:          runID,
		AgentID:        runReq.AgentID,
		SectionID:      runReq.SectionID,
		UserID:         runReq.UserID,
		Role:           schema.User,
		MessageType:    entity.MessageTypeAnswer,
		ContentType:    runReq.ContentType,
		MultiContent:   runReq.Content,
		Ext:            runReq.Ext,
	}
	return c.cdMessage.CreateMessage(ctx, msgMeta)
}

func (c *runImpl) handlerFinalAnswer(ctx context.Context, msg *entity.ChunkMessageItem, fullContent string, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	buildModelContent := &schema.Message{
		Role:    schema.Assistant,
		Content: fullContent,
	}
	mc, err := json.Marshal(buildModelContent)
	if err != nil {
		return err
	}
	editMsg := &msgEntity.Message{
		ID:           msg.ID,
		Content:      fullContent,
		ContentType:  entity.ContentTypeText,
		ModelContent: string(mc),
	}
	_, err = message.NewCDMessage(c.IDGen, c.DB).EditMessage(ctx, editMsg)
	return err
}

// handler function call msg
func (c *runImpl) handlerFunctionCall(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	// build message create
	cm := c.buildAgentMessage2Create(ctx, runReq, runID, schema.Tool, entity.MessageTypeFunctionCall, chunk.FuncCall)

	// create message
	cmData, err := c.cdMessage.CreateMessage(ctx, cm)
	if err != nil {
		return err
	}

	// build send message data
	sendMsg := c.buildSendMsg(ctx, cmData)
	// send message
	err = c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	if err != nil {
		return err
	}
	return nil
}

func (c *runImpl) handlerTooResponse(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	if chunk == nil {
		return nil
	}
	// build message create
	cm := c.buildAgentMessage2Create(ctx, runReq, runID, schema.Assistant, entity.MessageTypeToolResponse, chunk.ToolsMessage[0])

	// create message
	cmData, err := c.cdMessage.CreateMessage(ctx, cm)
	if err != nil {
		return err
	}
	// build send message data

	sendMsg := c.buildSendMsg(ctx, cmData)
	// send message
	err = c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	if err != nil {
		return err
	}
	return nil
}

func (c *runImpl) handlerSuggest(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	// if chunk == nil {
	// 	return
	// }
	// // build message create
	// cm := c.buildAgentMessage2Create(ctx, runReq, runID, schema.Assistant, entity.MessageTypeFlowUp, chunk)
	//
	// // create message
	// cmData, err := c.cdMessage.CreateMessage(ctx, cm)
	// if err != nil {
	// 	return
	// }
	// // build send message data
	// sendMsg := c.buildSendMsg(ctx, cmData)
	//
	// // send message
	// err = c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	// if err != nil {
	// 	return
	// }
	return
}

func (c *runImpl) handlerKnowledge(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	// if chunk == nil {
	// 	return
	// }
	// // build message create
	// cm := c.buildAgentMessage2Create(ctx, runReq, runID, schema.Assistant, entity.MessageTypeKnowledge, chunk.Knowledge)
	//
	// // create message
	// cmData, err := c.cdMessage.CreateMessage(ctx, cm)
	// if err != nil {
	// 	return
	// }
	// // build send message data
	// sendMsg := c.buildSendMsg(ctx, cmData)
	// // send message
	// err = c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	// if err != nil {
	// 	return
	// }
	return
}

func (c *runImpl) buildSendMsg(ctx context.Context, msg *msgEntity.Message) *entity.ChunkMessageItem {
	return &entity.ChunkMessageItem{
		ID:             msg.ID,
		ConversationID: msg.ConversationID,
		SectionID:      msg.SectionID,
		AgentID:        msg.AgentID,
		Content:        msg.Content,
		Role:           entity.RoleTypeAssistant,
		ContentType:    msg.ContentType,
		Type:           msg.MessageType,
		CreatedAt:      msg.CreatedAt,
		UpdatedAt:      msg.UpdatedAt,
	}
}

func (c *runImpl) buildSendRunRecord(ctx context.Context, runRecord *model.RunRecord, runStatus entity.RunStatus) *entity.ChunkRunItem {
	return &entity.ChunkRunItem{
		ID:             runRecord.ID,
		ConversationID: runRecord.ConversationID,
		AgentID:        runRecord.AgentID,
		SectionID:      runRecord.SectionID,
		Status:         runStatus,
		CreatedAt:      runRecord.CreatedAt,
	}
}
