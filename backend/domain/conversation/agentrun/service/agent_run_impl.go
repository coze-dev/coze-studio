package agentrun

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"runtime/debug"
	"strconv"
	"sync"
	"time"

	"github.com/cloudwego/eino/schema"

	entity2 "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/internal"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/repository"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type runImpl struct {
	Components

	runProcess *internal.RunProcess
	agentInfo  *crossdomain.AgentInfo
	runEvent   *internal.Event
	startTime  time.Time
}

type Components struct {
	CdMessage      crossdomain.Message
	CdSingleAgent  crossdomain.SingleAgent
	CdConversation crossdomain.Conversation

	RunRecordRepo repository.RunRecordRepo
}

func NewService(c *Components) Run {

	return &runImpl{
		Components: *c,
		runEvent:   internal.NewEvent(),
		runProcess: internal.NewRunProcess(c.RunRecordRepo),
	}
}

func (c *runImpl) AgentRun(ctx context.Context, arm *entity.AgentRunMeta) (*schema.StreamReader[*entity.AgentRunResponse], error) {

	logs.CtxInfof(ctx, "AgentRun req:%v", arm)
	sr, sw := schema.Pipe[*entity.AgentRunResponse](100)

	defer func() {
		if pe := recover(); pe != nil {
			logs.CtxErrorf(ctx, "panic recover: %v\n, [stack]:%v", pe, string(debug.Stack()))
			return
		}
	}()

	go func() {
		defer sw.Close()
		_ = c.run(ctx, arm, sw)
	}()

	return sr, nil
}

func (c *runImpl) run(ctx context.Context, arm *entity.AgentRunMeta, sw *schema.StreamWriter[*entity.AgentRunResponse]) (err error) {

	c.startTime = time.Now()

	runRecord, err := c.createRunRecord(ctx, sw, arm)
	if err != nil {
		return
	}

	defer func() {
		srRecord := c.buildSendRunRecord(ctx, runRecord, entity.RunStatusCompleted)
		if err != nil {
			srRecord.Error = &entity.RunError{
				Code: 10000,
				Msg:  err.Error(),
			}
			_ = c.runProcess.StepToFailed(ctx, srRecord, sw)
			return
		}
		_ = c.runProcess.StepToComplete(ctx, srRecord, sw)

		_ = c.runProcess.StepToDone(sw)

	}()

	err = c.handlerAgent(ctx, arm.AgentID)
	if err != nil {
		return
	}

	history, err := c.handlerHistory(ctx, arm)
	if err != nil {
		return
	}

	input, err := c.handlerInput(ctx, arm, runRecord.ID, sw)
	if err != nil {
		return
	}

	err = c.handlerStreamExecute(ctx, sw, history, input, arm, runRecord)
	if err != nil {
		return
	}

	return
}

func (c *runImpl) handlerAgent(ctx context.Context, agentID int64) error {
	agentInfo, err := c.CdSingleAgent.GetSingleAgent(ctx, agentID, "")
	if err != nil {
		return err
	}
	c.agentInfo = agentInfo
	return nil
}

func (c *runImpl) handlerStreamExecute(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], historyMsg []*msgEntity.Message, input *msgEntity.Message, arm *entity.AgentRunMeta, runRecord *entity.RunRecordMeta) (err error) {

	mainChan := make(chan *entity.AgentRespEvent, 100)
	faChan := make(chan *schema.Message, 100)

	ar := &crossdomain.AgentRuntime{
		AgentVersion: arm.Version,
		SpaceID:      arm.SpaceID,
		IsDraft:      arm.IsDraft,
	}

	streamer, err := c.CdSingleAgent.StreamExecute(ctx, historyMsg, input, ar)

	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		err = c.pull(ctx, mainChan, faChan, streamer)
	}()

	go func() {
		defer wg.Done()
		err = c.push(ctx, runRecord.ID, arm, mainChan, faChan, sw, input.ID)
	}()

	wg.Wait()

	return err
}

func (c *runImpl) pull(ctx context.Context, mainChan chan *entity.AgentRespEvent, faChan chan *schema.Message, events *schema.StreamReader[*entity2.AgentEvent]) (err error) {

	defer func() {
		close(mainChan)
		close(faChan)
	}()

	for {
		var resp *entity2.AgentEvent
		if events == nil {
			logs.CtxErrorf(ctx, "stream_err:%v", err)
			return nil
		}
		if resp, err = events.Recv(); err != nil {
			if errors.Is(err, io.EOF) {
				return nil
			}
			errChunk := &entity.AgentRespEvent{
				Err: err,
			}
			mainChan <- errChunk
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

		mainChan <- respChunk

		if resp.EventType == entity2.EventTypeOfFinalAnswer {
			for {
				answer, answerErr := resp.FinalAnswer.Recv()
				logs.CtxInfof(ctx, "receive answer event:%v, err:%v", conv.JsonToStr(answer), answerErr)
				if answerErr != nil {
					if errors.Is(answerErr, io.EOF) {
						break
					}
					return answerErr
				}
				faChan <- answer
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

func (c *runImpl) buildAgentMessage2Create(ctx context.Context, arm *entity.AgentRunMeta, runID int64, chunk *entity.AgentRespEvent, messageType entity.MessageType) *msgEntity.Message {

	msg := &msgEntity.Message{
		ConversationID: arm.ConversationID,
		RunID:          runID,
		AgentID:        arm.AgentID,
		SectionID:      arm.SectionID,
		UserID:         arm.UserID,
		MessageType:    messageType,
	}

	switch messageType {
	case entity.MessageTypeQuestion:
		msg.Role = schema.User
		msg.ContentType = arm.ContentType
		for _, content := range arm.Content {
			if content.Type == entity.InputTypeText {
				msg.Content = content.Text
				break
			}
		}
		msg.MultiContent = arm.Content
		msg.Ext = arm.Ext
	case entity.MessageTypeAnswer:
		msg.Role = schema.Assistant
		msg.ContentType = entity.ContentTypeText

	case entity.MessageTypeToolResponse:
		msg.Role = schema.Tool
		msg.ContentType = entity.ContentTypeText
		msg.Content = chunk.ToolsMessage[0].Content

		buildExt := map[string]string{}
		botStateExt := c.buildBotStateExt(arm)

		bseString, err := json.Marshal(botStateExt)
		if err == nil {
			buildExt[string(msgEntity.MessageExtKeyBotState)] = string(bseString)
		}

		msg.Ext = buildExt

		modelContent := chunk.ToolsMessage
		mc, err := json.Marshal(modelContent)
		if err == nil {
			msg.ModelContent = string(mc)
		}

	case entity.MessageTypeKnowledge:
		msg.Role = schema.Assistant
		msg.ContentType = entity.ContentTypeText

		knowledgeContent := c.buildKnowledge(ctx, arm, chunk)
		if knowledgeContent != nil {
			knInfo, err := json.Marshal(knowledgeContent)
			if err == nil {
				msg.Content = string(knInfo)
			}
		}
		buildExt := map[string]string{}
		botStateExt := c.buildBotStateExt(arm)

		bseString, err := json.Marshal(botStateExt)
		if err == nil {
			buildExt[string(msgEntity.MessageExtKeyBotState)] = string(bseString)
		}

		buildExt[string(msgEntity.MessageExtKeyTimeCost)] = fmt.Sprintf("%.1f", float64(time.Since(c.startTime).Milliseconds())/1000.00)
		msg.Ext = buildExt

		modelContent := chunk.Knowledge
		mc, err := json.Marshal(modelContent)
		if err == nil {
			msg.ModelContent = string(mc)
		}

	case entity.MessageTypeFunctionCall:
		msg.Role = schema.Assistant
		msg.ContentType = entity.ContentTypeText

		if len(chunk.FuncCall.ToolCalls) > 0 {
			toolCall := chunk.FuncCall.ToolCalls[0]
			toolCalling, err := json.Marshal(toolCall)
			if err == nil {
				msg.Content = string(toolCalling)
			}

			buildExt := map[string]string{
				string(msgEntity.MessageExtKeyPlugin):   toolCall.Function.Name,
				string(msgEntity.MessageExtKeyToolName): toolCall.Function.Name,
			}
			botStateExt := c.buildBotStateExt(arm)
			bseString, err := json.Marshal(botStateExt)
			if err == nil {
				buildExt[string(msgEntity.MessageExtKeyBotState)] = string(bseString)
			}
			msg.Ext = buildExt

			modelContent := chunk.FuncCall
			mc, err := json.Marshal(modelContent)
			if err == nil {
				msg.ModelContent = string(mc)
			}
		}

	case entity.MessageTypeFlowUp:
		msg.Role = schema.Assistant
		msg.ContentType = entity.ContentTypeText

	}

	return msg
}

func (c *runImpl) handlerHistory(ctx context.Context, arm *entity.AgentRunMeta) ([]*msgEntity.Message, error) {

	conversationTurns := int64(entity.ConversationTurnsDefault) // todo::需要替换成agent上配置的会话论述
	runRecordList, err := c.RunRecordRepo.List(ctx, arm.ConversationID, arm.SectionID, conversationTurns)
	if err != nil {
		return nil, err
	}

	if len(runRecordList) == 0 {
		return nil, nil
	}

	runIDS := c.getRunID(runRecordList)

	history, err := c.CdMessage.GetMessageListByRunID(ctx, arm.ConversationID, runIDS)
	if err != nil {
		return nil, err
	}

	return history, nil
}

func (c *runImpl) getRunID(rr []*model.RunRecord) []int64 {

	ids := make([]int64, 0, len(rr))
	for _, c := range rr {
		ids = append(ids, c.ID)
	}

	return ids
}

func (c *runImpl) createRunRecord(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], arm *entity.AgentRunMeta) (*entity.RunRecordMeta, error) {
	runPoData, err := c.RunRecordRepo.Create(ctx, arm)
	if err != nil {
		return nil, err
	}

	srRecord := c.buildSendRunRecord(ctx, runPoData, entity.RunStatusCreated)

	err = c.runProcess.StepToCreate(ctx, srRecord, sw)
	if err != nil {
		return nil, err
	}

	err = c.runProcess.StepToInProgress(ctx, srRecord, sw)
	if err != nil {
		return nil, err
	}

	return runPoData, nil
}

func (c *runImpl) handlerInput(ctx context.Context, arm *entity.AgentRunMeta, runID int64, sw *schema.StreamWriter[*entity.AgentRunResponse]) (*msgEntity.Message, error) {

	msgMeta := c.buildAgentMessage2Create(ctx, arm, runID, nil, entity.MessageTypeQuestion)

	cm, err := c.CdMessage.CreateMessage(ctx, msgMeta)
	if err != nil {
		return nil, err
	}

	ackErr := c.handlerAckMessage(ctx, cm, sw)
	if ackErr != nil {
		return msgMeta, ackErr
	}
	return cm, nil
}

func (c *runImpl) push(ctx context.Context, runID int64, arm *entity.AgentRunMeta, ch chan *entity.AgentRespEvent, chAnswer chan *schema.Message, sw *schema.StreamWriter[*entity.AgentRunResponse], queryMsgID int64) error {

	for {
		chunk, ok := <-ch
		if !ok || chunk == nil {
			return nil
		}
		logs.CtxInfof(ctx, "hanlder event:%v", conv.JsonToStr(chunk))
		if chunk.Err != nil {
			logs.CtxInfof(ctx, "chunk err:%v", chunk.Err)
			return c.handlerErr(ctx, chunk.Err, sw)
		}

		switch chunk.EventType {
		case entity.MessageTypeFunctionCall:
			err := c.handlerFunctionCall(ctx, runID, arm, chunk, sw, queryMsgID)
			if err != nil {
				return err
			}
		case entity.MessageTypeToolResponse:
			err := c.handlerTooResponse(ctx, runID, arm, chunk, sw, queryMsgID)
			if err != nil {
				return err
			}
		case entity.MessageTypeKnowledge:
			err := c.handlerKnowledge(ctx, runID, arm, chunk, sw, queryMsgID)
			if err != nil {
				return err
			}
		case entity.MessageTypeAnswer:
			fullContent := bytes.NewBuffer([]byte{})
			preMsg, err := c.handlerPreAnswer(ctx, runID, arm)
			if err != nil {
				return err
			}
			var usage *msgEntity.UsageExt
			for {
				answer, ok := <-chAnswer
				sendMsg := c.buildSendMsg(ctx, preMsg, queryMsgID, false)
				if !ok || answer == nil {
					sendMsg.Content = fullContent.String()
					sendMsg.IsFinish = true
					if usage != nil {
						sendMsg.Ext = map[string]string{
							string(msgEntity.MessageExtKeyToken):        strconv.FormatInt(usage.TotalCount, 10),
							string(msgEntity.MessageExtKeyInputTokens):  strconv.FormatInt(usage.InputTokens, 10),
							string(msgEntity.MessageExtKeyOutputTokens): strconv.FormatInt(usage.OutputTokens, 10),
						}
					}

					if _, ok := sendMsg.Ext[string(msgEntity.MessageExtKeyTimeCost)]; !ok {
						sendMsg.Ext[string(msgEntity.MessageExtKeyTimeCost)] = fmt.Sprintf("%.1f", float64(time.Since(c.startTime).Milliseconds())/1000.00)
					}

					saveErr := c.handlerFinalAnswer(ctx, sendMsg, fullContent.String(), sw)
					if saveErr != nil {
						return err
					}
					err = c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
					return err
				}
				if answer.Content != "" {
					fullContent.WriteString(answer.Content)
				}

				if answer.ResponseMeta != nil && answer.ResponseMeta.Usage != nil {
					usage = &msgEntity.UsageExt{
						TotalCount:   int64(answer.ResponseMeta.Usage.TotalTokens),
						InputTokens:  int64(answer.ResponseMeta.Usage.PromptTokens),
						OutputTokens: int64(answer.ResponseMeta.Usage.CompletionTokens),
					}
				}

				sendMsg.Content = answer.Content
				err = c.runEvent.SendMsgEvent(entity.RunEventMessageDelta, sendMsg, sw)
			}

		case entity.MessageTypeFlowUp:
			c.handlerSuggest(ctx, runID, arm, chunk, sw)
		}
	}
}

func (c *runImpl) handlerErr(ctx context.Context, err error, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	return c.runEvent.SendErrEvent(entity.RunEventError, 10000, err.Error(), sw)
}

func (c *runImpl) handlerPreAnswer(ctx context.Context, runID int64, arm *entity.AgentRunMeta) (*msgEntity.Message, error) {

	msgMeta := &msgEntity.Message{
		ConversationID: arm.ConversationID,
		RunID:          runID,
		AgentID:        arm.AgentID,
		SectionID:      arm.SectionID,
		UserID:         arm.UserID,
		Role:           schema.Assistant,
		MessageType:    entity.MessageTypeAnswer,
		ContentType:    entity.ContentTypeText,
		Ext:            arm.Ext,
	}

	botStateExt := c.buildBotStateExt(arm)
	bseString, err := json.Marshal(botStateExt)
	if err != nil {
		return nil, err
	}

	if _, ok := arm.Ext[string(msgEntity.MessageExtKeyBotState)]; !ok {
		arm.Ext[string(msgEntity.MessageExtKeyBotState)] = string(bseString)
	}

	msgMeta.Ext = arm.Ext
	return c.CdMessage.CreateMessage(ctx, msgMeta)
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
		Ext:          msg.Ext,
	}
	_, err = c.CdMessage.EditMessage(ctx, editMsg)
	return err
}

func (c *runImpl) buildBotStateExt(arm *entity.AgentRunMeta) *msgEntity.BotStateExt {
	agentID := strconv.FormatInt(arm.AgentID, 10)
	botStateExt := &msgEntity.BotStateExt{
		AgentID:   agentID,
		AgentName: arm.Name,
		Awaiting:  agentID,
		BotID:     agentID,
	}

	return botStateExt
}

func (c *runImpl) handlerFunctionCall(ctx context.Context, runID int64, arm *entity.AgentRunMeta, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], queryMsgID int64) error {

	cm := c.buildAgentMessage2Create(ctx, arm, runID, chunk, entity.MessageTypeFunctionCall)

	cmData, err := c.CdMessage.CreateMessage(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, queryMsgID, true)

	return c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
}
func (c *runImpl) handlerAckMessage(ctx context.Context, input *msgEntity.Message, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	sendMsg := &entity.ChunkMessageItem{
		ID:             input.ID,
		ConversationID: input.ConversationID,
		SectionID:      input.SectionID,
		AgentID:        input.AgentID,
		Role:           entity.RoleType(input.Role),
		MessageType:    entity.MessageTypeAck,
		ReplyID:        input.ID,
		Content:        input.Content,
		ContentType:    entity.ContentTypeText,
	}
	return c.runEvent.SendMsgEvent(entity.RunEventAck, sendMsg, sw)
}

func (c *runImpl) handlerTooResponse(ctx context.Context, runID int64, arm *entity.AgentRunMeta, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], queryMsgID int64) error {

	cm := c.buildAgentMessage2Create(ctx, arm, runID, chunk, entity.MessageTypeToolResponse)
	cmData, err := c.CdMessage.CreateMessage(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, queryMsgID, true)

	return c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
}

func (c *runImpl) handlerSuggest(ctx context.Context, runID int64, arm *entity.AgentRunMeta, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	// if chunk == nil {
	// 	return
	// }
	// // build message create
	// cm := c.buildAgentMessage2Create(ctx, arm, runID, schema.Assistant, entity.MessageTypeFlowUp, chunk)
	//
	// // create message
	// cmData, err := c.CdMessage.CreateMessage(ctx, cm)
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

func (c *runImpl) handlerKnowledge(ctx context.Context, runID int64, arm *entity.AgentRunMeta, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], queryMsgID int64) error {

	cm := c.buildAgentMessage2Create(ctx, arm, runID, chunk, entity.MessageTypeKnowledge)
	cmData, err := c.CdMessage.CreateMessage(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, queryMsgID, true)

	return c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)

}

func (c *runImpl) buildKnowledge(ctx context.Context, arm *entity.AgentRunMeta, chunk *entity.AgentRespEvent) *msgEntity.VerboseInfo {

	var recallDatas []msgEntity.RecallDataInfo
	for _, kOne := range chunk.Knowledge {
		recallDatas = append(recallDatas, msgEntity.RecallDataInfo{
			Slice: kOne.Content,
		})
	}

	verboseData := &msgEntity.VerboseData{
		Chunks:     recallDatas,
		OriReq:     "",
		StatusCode: 0,
	}
	data, err := json.Marshal(verboseData)
	if err != nil {
		return nil
	}
	knowledgeInfo := &msgEntity.VerboseInfo{
		MessageType: "knowledge_recall",
		Data:        string(data),
	}
	return knowledgeInfo
}

func (c *runImpl) buildSendMsg(ctx context.Context, msg *msgEntity.Message, queryMsgID int64, isFinish bool) *entity.ChunkMessageItem {

	return &entity.ChunkMessageItem{
		ID:             msg.ID,
		ConversationID: msg.ConversationID,
		SectionID:      msg.SectionID,
		AgentID:        msg.AgentID,
		Content:        msg.Content,
		Role:           entity.RoleTypeAssistant,
		ContentType:    msg.ContentType,
		MessageType:    msg.MessageType,
		ReplyID:        queryMsgID,
		Type:           msg.MessageType,
		CreatedAt:      msg.CreatedAt,
		UpdatedAt:      msg.UpdatedAt,
		Ext:            msg.Ext,
		IsFinish:       isFinish,
	}
}

func (c *runImpl) buildSendRunRecord(ctx context.Context, runRecord *entity.RunRecordMeta, runStatus entity.RunStatus) *entity.ChunkRunItem {
	return &entity.ChunkRunItem{
		ID:             runRecord.ID,
		ConversationID: runRecord.ConversationID,
		AgentID:        runRecord.AgentID,
		SectionID:      runRecord.SectionID,
		Status:         runStatus,
		CreatedAt:      runRecord.CreatedAt,
	}
}

func (c *runImpl) Delete(ctx context.Context, runID []int64) error {
	return c.RunRecordRepo.Delete(ctx, runID)
}
