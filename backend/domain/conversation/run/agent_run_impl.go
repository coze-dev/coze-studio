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

	"code.byted.org/flow/opencoze/backend/crossdomain/conversation/agent"
	"code.byted.org/flow/opencoze/backend/crossdomain/conversation/message"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/dal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type runImpl struct {
	IDGen idgen.IDGenerator
	*dal.ChatDAO
	DB *gorm.DB
}

type Components struct {
	IDGen idgen.IDGenerator
	DB    *gorm.DB
}

func NewService(c *Components) Run {
	return &runImpl{
		IDGen:   c.IDGen,
		ChatDAO: dal.NewChatDAO(c.DB),
		DB:      c.DB,
	}
}
func (c *runImpl) AgentRun(ctx context.Context, req *entity.AgentRunRequest) (sr *schema.StreamReader[*entity.AgentRunResponse], err error) {

	// create stream reader & writer
	sr, sw := schema.Pipe[*entity.AgentRunResponse](10)
	defer sw.Close()

	//create run record & send run created event
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

		//send run completed event
		srRecord := c.buildSendRunRecord(ctx, runRecordPoData, entity.RunStatusCompleted)

		if err != nil {
			//send run failed event
			srRecord.Error = &entity.RunError{
				Code: 10000,
				Msg:  err.Error(),
			}
			err = internal.NewRunProcess(ctx, sw, c.DB).StepToFailed(srRecord)
			return
		}

		err = internal.NewRunProcess(ctx, sw, c.DB).StepToComplete(srRecord)
		if err != nil {
			log.Println("send run completed event error:", err)
		}

		//send stream done event
		err = internal.NewRunProcess(ctx, sw, c.DB).StepToDone()
		if err != nil {
			log.Println("send stream done event error:", err)
		}

	}()

	err = c.run(ctx, req, sw, runRecordPoData)

	return
}

func (c *runImpl) run(ctx context.Context, runReq *entity.AgentRunRequest, sw *schema.StreamWriter[*entity.AgentRunResponse], runRecord *model.RunRecord) (err error) {

	//get history
	history, err := c.getHistory(ctx, runReq)
	if err != nil {
		//todo:: get history error, without blocking?
		return
	}

	//save input
	input, err := c.saveInput(ctx, runReq, runRecord.ID)
	if err != nil {
		return
	}

	//call model
	ch := make(chan *entity.AgentRespEvent, 100)
	defer func() {
		close(ch)
	}()
	err = agent.NewSingleAgent(&agent.Components{
		IDGen: c.IDGen,
		DB:    c.DB,
	}).StreamExecute(ctx, ch, history, input)
	if err != nil {
		return
	}

	//handler execute stream
	go func() {
		err = c.pull(ctx, runRecord.ID, runReq, ch, sw)
	}()

	return nil
}

func (c *runImpl) buildChat2MessageCreate(ctx context.Context, req *entity.AgentRunRequest, runID int64, role entity.RoleType, messageType entity.MessageType, chunk *entity.AgentRespEvent) *msgEntity.Message {

	msg := &msgEntity.Message{
		ConversationID: req.ConversationID,
		RunID:          runID,
		AgentID:        req.AgentID,
		SectionID:      req.SectionID,
		UserID:         req.UserID,
		Role:           role,
		MessageType:    messageType,
		ContentType:    req.ContentType,
		Content:        req.Content,
		Ext:            req.Ext,
	}

	contentString, err := json.Marshal(msg.Content)
	if err == nil {
		msg.DisplayContent = string(contentString)
	}

	if chunk != nil {
		// build model content
		modelContent := c.buildAssistantModelContent(ctx, req, chunk)
		mc, err := json.Marshal(modelContent)
		if err == nil {
			msg.ModelContent = ptr.Of(string(mc))
		}
	}
	return msg
}

func (c *runImpl) buildAssistantModelContent(ctx context.Context, req *entity.AgentRunRequest, chunk *entity.AgentRespEvent) *schema.Message {
	if chunk == nil {
		return nil
	}

	modelContent := &schema.Message{}

	return modelContent
}

func (c *runImpl) buildChat2Po(ctx context.Context, chat *entity.AgentRunRequest) (*model.RunRecord, error) {

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
	conversationTurns := int64(entity.ConversationTurnsDefault) //todo::需要替换成agent上配置的会话论述
	chatList, err := c.ChatDAO.List(ctx, req.ConversationID, conversationTurns)
	if err != nil {
		return nil, err
	}

	if len(chatList) == 0 {
		return nil, nil
	}
	// query message by run ids
	RunIDS := getRunID(chatList)

	//query message
	history, err := message.NewCDMessage(c.IDGen, c.DB).GetMessageListByRunID(ctx, req.ConversationID, RunIDS)
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
	chatPoData, err := c.buildChat2Po(ctx, req)
	if err != nil {
		return nil, err
	}
	err = c.ChatDAO.Create(ctx, chatPoData)
	if err != nil {
		return nil, err
	}

	// send run create event
	srRecord := c.buildSendRunRecord(ctx, chatPoData, entity.RunStatusCreated)

	err = internal.NewRunProcess(ctx, sw, c.DB).StepToCreate(srRecord)
	if err != nil {
		return nil, err
	}

	// send run create in progress
	err = internal.NewRunProcess(ctx, sw, c.DB).StepToInProgress(srRecord)
	if err != nil {
		return nil, err
	}

	return chatPoData, nil
}

func (c *runImpl) saveInput(ctx context.Context, req *entity.AgentRunRequest, runID int64) (*msgEntity.Message, error) {

	return message.NewCDMessage(c.IDGen, c.DB).CreateMessage(ctx, c.buildChat2MessageCreate(ctx, req, runID, entity.RoleTypeUser, entity.MessageTypeQuestion, nil))
}

func (c *runImpl) pull(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, ch chan *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {

	for {
		chunk, ok := <-ch
		if !ok || chunk == nil {
			return errors.New("channel closed")
		}
		switch chunk.EventType {
		case entity.MessageTypeFunctionCall:
			c.handlerFunctionCall(ctx, runID, runReq, chunk, sw)
		case entity.MessageTypeToolResponse:
			c.handlerTooResponse(ctx, runID, runReq, chunk, sw)
		case entity.MessageTypeKnowledge:
			c.handlerKnowledge(ctx, runID, runReq, chunk, sw)
		case entity.MessageTypeAnswer:
			c.handlerAnswer(ctx, runID, runReq, chunk, sw)
		case entity.MessageTypeFlowUp:
			c.handlerSuggest(ctx, runID, runReq, chunk, sw)
		}
	}
}

func (c *runImpl) handlerAnswer(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	if chunk == nil {
		return
	}
	// todo:: stream answer
	//step1: build create message, set content empty
	cm := c.buildChat2MessageCreate(ctx, runReq, runID, entity.RoleTypeAssistant, entity.MessageTypeAnswer, chunk)

	//step2: create pre msg, then update
	cmData, err := message.NewCDMessage(c.IDGen, c.DB).CreateMessage(ctx, cm)
	if err != nil {
		return
	}

	//build send message
	sendMsg := c.buildSendMsg(ctx, cmData)

	// handler answer stream
	ch := make(chan *schema.Message, 100)
	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		err = c.pullAnswer(ctx, ch, chunk.FinalAnswer)

		if err != nil {
			return
		}
	}()

	answerString := bytes.NewBuffer([]byte{})

	go func() {
		defer wg.Done()

		for {
			chunkAnswer, ok := <-ch
			if !ok {
				return
			}

			if chunkAnswer == nil && len(answerString.String()) > 0 {
				//step6: if finished, build full message

				sendMsg.Content = answerString.String()
				buildModelContent := &schema.Message{
					Role:    "assistant",
					Content: answerString.String(),
				}
				mc, err := json.Marshal(buildModelContent)
				if err != nil {
					return
				}

				//step7: update msg
				editMsg := &msgEntity.Message{
					ID: cmData.ID,
					Content: []*entity.InputMetaData{
						{
							Type: entity.InputTypeText,
							Text: answerString.String(),
						},
					},
					ModelContent: ptr.Of(string(mc)),
				}
				_, err = message.NewCDMessage(c.IDGen, c.DB).EditMessage(ctx, editMsg)
				if err != nil {
					return
				}
				err = internal.NewEvent(ctx, sw).SendMsgEvent(entity.RunEventMessageCompleted, sendMsg)
				if err != nil {
					return
				}
			}

			//step3: content buffer
			if chunkAnswer.Content != "" {
				answerString.WriteString(chunkAnswer.Content)
			}

			//step4: build send message
			sendMsg.Content = chunkAnswer.Content

			//step5: send content
			err = internal.NewEvent(ctx, sw).SendMsgEvent(entity.RunEventMessageDelta, sendMsg)
			if err != nil {
				return
			}
		}
	}()

}

// handler function call msg
func (c *runImpl) handlerFunctionCall(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	if chunk == nil {
		return
	}

	// build message create
	cm := c.buildChat2MessageCreate(ctx, runReq, runID, entity.RoleTypeAssistant, entity.MessageTypeFunctionCall, chunk)

	//create message
	cmData, err := message.NewCDMessage(c.IDGen, c.DB).CreateMessage(ctx, cm)
	if err != nil {
		return
	}

	// build send message data
	sendMsg := c.buildSendMsg(ctx, cmData)
	// send message
	err = internal.NewEvent(ctx, sw).SendMsgEvent(entity.RunEventMessageCompleted, sendMsg)
	if err != nil {
		return
	}
	return

}

func (c *runImpl) handlerTooResponse(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	if chunk == nil {
		return
	}
	// build message create
	cm := c.buildChat2MessageCreate(ctx, runReq, runID, entity.RoleTypeAssistant, entity.MessageTypeToolResponse, chunk)

	//create message
	cmData, err := message.NewCDMessage(c.IDGen, c.DB).CreateMessage(ctx, cm)
	if err != nil {
		return
	}
	// build send message data

	sendMsg := c.buildSendMsg(ctx, cmData)
	// send message
	err = internal.NewEvent(ctx, sw).SendMsgEvent(entity.RunEventMessageCompleted, sendMsg)
	if err != nil {
		return
	}
	return
}

func (c *runImpl) handlerSuggest(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	if chunk == nil {
		return
	}
	// build message create
	cm := c.buildChat2MessageCreate(ctx, runReq, runID, entity.RoleTypeAssistant, entity.MessageTypeFlowUp, chunk)

	//create message
	cmData, err := message.NewCDMessage(c.IDGen, c.DB).CreateMessage(ctx, cm)
	if err != nil {
		return
	}
	// build send message data
	sendMsg := c.buildSendMsg(ctx, cmData)

	// send message
	err = internal.NewEvent(ctx, sw).SendMsgEvent(entity.RunEventMessageCompleted, sendMsg)
	if err != nil {
		return
	}
	return
}

func (c *runImpl) handlerKnowledge(ctx context.Context, runID int64, runReq *entity.AgentRunRequest, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	if chunk == nil {
		return
	}
	// build message create
	cm := c.buildChat2MessageCreate(ctx, runReq, runID, entity.RoleTypeAssistant, entity.MessageTypeKnowledge, chunk)

	//create message
	cmData, err := message.NewCDMessage(c.IDGen, c.DB).CreateMessage(ctx, cm)
	if err != nil {
		return
	}
	// build send message data
	sendMsg := c.buildSendMsg(ctx, cmData)
	// send message
	err = internal.NewEvent(ctx, sw).SendMsgEvent(entity.RunEventMessageCompleted, sendMsg)
	if err != nil {
		return
	}
	return
}

func (c *runImpl) buildSendMsg(ctx context.Context, msg *msgEntity.Message) *entity.ChunkMessageItem {
	return &entity.ChunkMessageItem{
		ID:             msg.ID,
		ConversationID: msg.ConversationID,
		SectionID:      msg.SectionID,
		AgentID:        msg.AgentID,
		//Content:        msg.Content,
		Role:        entity.RoleTypeAssistant,
		ContentType: msg.ContentType,
		Type:        msg.MessageType,
		CreatedAt:   msg.CreatedAt,
		UpdatedAt:   msg.UpdatedAt,
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

func (c *runImpl) pullAnswer(ctx context.Context, ch chan *schema.Message, events *schema.StreamReader[*schema.Message]) (err error) {
	ctx, cancel := context.WithCancel(ctx)

	defer func() {
		close(ch)
		cancel()
	}()
	for {
		var resp *schema.Message
		if resp, err = events.Recv(); err != nil {
			if errors.Is(err, io.EOF) {
				return nil
			}
			return err
		}
		ch <- resp
	}
}
