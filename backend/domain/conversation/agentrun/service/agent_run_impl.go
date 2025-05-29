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

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossagent"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossmessage"
	entity2 "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
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

	runProcess   *internal.RunProcess
	runEvent     *internal.Event
	rtDependence runtimeDependence
}

type runtimeDependence struct {
	runID         int64
	agentInfo     *crossagent.AgentInfo
	questionMsgID int64
	runMeta       *entity.AgentRunMeta
	startTime     time.Time
}

type Components struct {
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
	sr, sw := schema.Pipe[*entity.AgentRunResponse](100)

	defer func() {
		if pe := recover(); pe != nil {
			logs.CtxErrorf(ctx, "panic recover: %v\n, [stack]:%v", pe, string(debug.Stack()))
			return
		}
	}()

	c.rtDependence = runtimeDependence{
		runMeta:   arm,
		startTime: time.Now(),
	}

	go func() {
		defer sw.Close()
		_ = c.run(ctx, sw)
	}()

	return sr, nil
}

func (c *runImpl) run(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse]) (err error) {
	runRecord, err := c.createRunRecord(ctx, sw)
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
			_ = c.runProcess.StepToFailed(ctx, srRecord, sw) // todo:: 处理error
			return
		}
		_ = c.runProcess.StepToComplete(ctx, srRecord, sw) // todo:: 处理error

		c.runProcess.StepToDone(sw)
	}()

	agentInfo, err := c.handlerAgent(ctx, c.rtDependence.runMeta.AgentID)
	if err != nil {
		return
	}

	history, err := c.handlerHistory(ctx)
	if err != nil {
		return
	}

	input, err := c.handlerInput(ctx, sw)
	if err != nil {
		return
	}

	c.rtDependence.questionMsgID = input.ID
	c.rtDependence.runID = runRecord.ID
	c.rtDependence.agentInfo = agentInfo

	err = c.handlerStreamExecute(ctx, sw, history, input, runRecord)
	if err != nil {
		return
	}

	return
}

func (c *runImpl) handlerAgent(ctx context.Context, agentID int64) (*crossagent.AgentInfo, error) {
	agentInfo, err := crossagent.DefaultSVC().GetSingleAgent(ctx, agentID, "")
	if err != nil {
		return nil, err
	}

	return agentInfo, nil
}

func (c *runImpl) handlerStreamExecute(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse], historyMsg []*msgEntity.Message, input *msgEntity.Message, runRecord *entity.RunRecordMeta) (err error) {
	mainChan := make(chan *entity.AgentRespEvent, 100)
	faChan := make(chan *entity.FinalAnswerEvent, 100)

	ar := &crossagent.AgentRuntime{
		AgentVersion:     c.rtDependence.runMeta.Version,
		SpaceID:          c.rtDependence.runMeta.SpaceID,
		IsDraft:          c.rtDependence.runMeta.IsDraft,
		ConnectorID:      c.rtDependence.runMeta.ConnectorID,
		PreRetrieveTools: c.rtDependence.runMeta.PreRetrieveTools,
	}

	streamer, err := crossagent.DefaultSVC().StreamExecute(ctx, historyMsg, input, ar)
	if err != nil {
		return err
	}

	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		err = c.pull(ctx, mainChan, faChan, streamer)
	}()

	go func() {
		defer wg.Done()
		err = c.push(ctx, mainChan, faChan, sw, input.ID)
	}()

	wg.Wait()

	return err
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

func (c *runImpl) buildAgentMessage2Create(ctx context.Context, chunk *entity.AgentRespEvent, messageType entity.MessageType) *msgEntity.Message {
	arm := c.rtDependence.runMeta
	msg := &msgEntity.Message{
		ConversationID: arm.ConversationID,
		RunID:          c.rtDependence.runID,
		AgentID:        arm.AgentID,
		SectionID:      arm.SectionID,
		UserID:         arm.UserID,
		MessageType:    messageType,
	}
	buildExt := map[string]string{}

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
		buildExt = arm.Ext

		msg.DisplayContent = arm.DisplayContent
	case entity.MessageTypeAnswer:
		msg.Role = schema.Assistant
		msg.ContentType = entity.ContentTypeText

	case entity.MessageTypeToolResponse:
		msg.Role = schema.Tool
		msg.ContentType = entity.ContentTypeText
		msg.Content = chunk.ToolsMessage[0].Content

		modelContent := chunk.ToolsMessage[0]
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

		buildExt[string(msgEntity.MessageExtKeyTimeCost)] = fmt.Sprintf("%.1f", float64(time.Since(c.rtDependence.startTime).Milliseconds())/1000.00)

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
			buildExt[string(msgEntity.MessageExtKeyPlugin)] = toolCall.Function.Name
			buildExt[string(msgEntity.MessageExtKeyToolName)] = toolCall.Function.Name

			modelContent := chunk.FuncCall
			mc, err := json.Marshal(modelContent)
			if err == nil {
				msg.ModelContent = string(mc)
			}
		}
	case entity.MessageTypeFlowUp:
		msg.Role = schema.Assistant
		msg.ContentType = entity.ContentTypeText
		msg.Content = chunk.Suggest.Content

	case entity.MessageTypeVerbose:
		msg.Role = schema.Assistant
		msg.ContentType = entity.ContentTypeText

		d := &entity.Data{
			FinishReason: 0,
			FinData:      "",
		}
		dByte, _ := json.Marshal(d)
		afc := &entity.AnswerFinshContent{
			MsgType: entity.MessageSubTypeGenerateFinish,
			Data:    string(dByte),
		}
		afcMarshal, _ := json.Marshal(afc)
		msg.Content = string(afcMarshal)
	}

	if messageType != entity.MessageTypeQuestion {
		botStateExt := c.buildBotStateExt(arm)
		bseString, err := json.Marshal(botStateExt)
		if err == nil {
			buildExt[string(msgEntity.MessageExtKeyBotState)] = string(bseString)
		}
	}
	msg.Ext = buildExt

	return msg
}

func (c *runImpl) handlerHistory(ctx context.Context) ([]*msgEntity.Message, error) {
	conversationTurns := int64(entity.ConversationTurnsDefault) // todo::需要替换成agent上配置的会话论述
	runRecordList, err := c.RunRecordRepo.List(ctx, c.rtDependence.runMeta.ConversationID, c.rtDependence.runMeta.SectionID, conversationTurns)
	if err != nil {
		return nil, err
	}

	if len(runRecordList) == 0 {
		return nil, nil
	}

	runIDS := c.getRunID(runRecordList)

	history, err := crossmessage.DefaultSVC().GetByRunIDs(ctx, c.rtDependence.runMeta.ConversationID, runIDS)
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

func (c *runImpl) createRunRecord(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse]) (*entity.RunRecordMeta, error) {
	runPoData, err := c.RunRecordRepo.Create(ctx, c.rtDependence.runMeta)
	if err != nil {
		return nil, err
	}

	c.rtDependence.runID = runPoData.ID

	srRecord := c.buildSendRunRecord(ctx, runPoData, entity.RunStatusCreated)

	c.runProcess.StepToCreate(ctx, srRecord, sw)

	err = c.runProcess.StepToInProgress(ctx, srRecord, sw)
	if err != nil {
		return nil, err
	}

	return runPoData, nil
}

func (c *runImpl) handlerInput(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse]) (*msgEntity.Message, error) {
	msgMeta := c.buildAgentMessage2Create(ctx, nil, entity.MessageTypeQuestion)

	cm, err := crossmessage.DefaultSVC().Create(ctx, msgMeta)
	if err != nil {
		return nil, err
	}

	ackErr := c.handlerAckMessage(ctx, cm, sw)
	if ackErr != nil {
		return msgMeta, ackErr
	}
	return cm, nil
}

func (c *runImpl) pull(ctx context.Context, mainChan chan *entity.AgentRespEvent, faChan chan *entity.FinalAnswerEvent, events *schema.StreamReader[*entity2.AgentEvent]) (err error) {
	defer func() {
		close(mainChan)
		close(faChan)
	}()

	for {
		var resp *entity2.AgentEvent
		if resp, err = events.Recv(); err != nil {
			errChunk := &entity.AgentRespEvent{
				Err: err,
			}
			mainChan <- errChunk
			return nil
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
			Suggest:      resp.Suggest,
		}

		mainChan <- respChunk

		if resp.EventType == entity2.EventTypeOfFinalAnswer {
			for {
				answer, answerErr := resp.FinalAnswer.Recv()

				faChan <- &entity.FinalAnswerEvent{
					Message: answer,
					Err:     answerErr,
				}
				if answerErr != nil {
					break
				}
			}
		}
	}
}

func (c *runImpl) push(ctx context.Context, mainChan chan *entity.AgentRespEvent, faChan chan *entity.FinalAnswerEvent, sw *schema.StreamWriter[*entity.AgentRunResponse], queryMsgID int64) error {
	for {
		chunk, ok := <-mainChan
		if !ok || chunk == nil {
			return nil
		}
		logs.CtxInfof(ctx, "hanlder event:%v,err:%v", conv.DebugJsonToStr(chunk), chunk.Err)
		if chunk.Err != nil {
			if errors.Is(chunk.Err, io.EOF) {
				return nil
			}
			c.handlerErr(ctx, chunk.Err, sw)
			return nil
		}

		switch chunk.EventType {
		case entity.MessageTypeFunctionCall:
			err := c.handlerFunctionCall(ctx, chunk, sw)
			if err != nil {
				return err
			}
		case entity.MessageTypeToolResponse:
			err := c.handlerTooResponse(ctx, chunk, sw)
			if err != nil {
				return err
			}
		case entity.MessageTypeKnowledge:
			err := c.handlerKnowledge(ctx, chunk, sw)
			if err != nil {
				return err
			}
		case entity.MessageTypeAnswer:
			fullContent := bytes.NewBuffer([]byte{})
			preMsg, err := c.handlerPreAnswer(ctx)
			if err != nil {
				return err
			}
			var usage *msgEntity.UsageExt
			for {
				answerEvent, ok := <-faChan
				if !ok {
					break
				}

				sendMsg := c.buildSendMsg(ctx, preMsg, false)
				if answerEvent.Err != nil {
					if errors.Is(answerEvent.Err, io.EOF) {

						hfErr := c.handlerFinalAnswer(ctx, sendMsg, fullContent.String(), sw, usage)
						if hfErr != nil {
							return err
						}

						finishErr := c.handlerFinalAnswerFinish(ctx, sw)
						if finishErr != nil {
							return err
						}
						break
					}
					return answerEvent.Err
				}

				answer := answerEvent.Message
				usage = c.handlerUsage(answer.ResponseMeta)
				fullContent.WriteString(answer.Content)
				sendMsg.Content = answer.Content
				c.runEvent.SendMsgEvent(entity.RunEventMessageDelta, sendMsg, sw)
			}

		case entity.MessageTypeFlowUp:
			err := c.handlerSuggest(ctx, chunk, sw)
			if err != nil {
				return err
			}
		}
	}
}

func (c *runImpl) handlerUsage(meta *schema.ResponseMeta) *msgEntity.UsageExt {
	if meta == nil || meta.Usage == nil {
		return nil
	}

	return &msgEntity.UsageExt{
		TotalCount:   int64(meta.Usage.TotalTokens),
		InputTokens:  int64(meta.Usage.PromptTokens),
		OutputTokens: int64(meta.Usage.CompletionTokens),
	}
}

func (c *runImpl) handlerErr(_ context.Context, err error, sw *schema.StreamWriter[*entity.AgentRunResponse]) {
	c.runEvent.SendErrEvent(entity.RunEventError, 10000, err.Error(), sw)
}

func (c *runImpl) handlerPreAnswer(ctx context.Context) (*msgEntity.Message, error) {
	arm := c.rtDependence.runMeta
	msgMeta := &msgEntity.Message{
		ConversationID: arm.ConversationID,
		RunID:          c.rtDependence.runID,
		AgentID:        arm.AgentID,
		SectionID:      arm.SectionID,
		UserID:         arm.UserID,
		Role:           schema.Assistant,
		MessageType:    entity.MessageTypeAnswer,
		ContentType:    entity.ContentTypeText,
		Ext:            arm.Ext,
	}

	if arm.Ext == nil {
		msgMeta.Ext = map[string]string{}
	}

	botStateExt := c.buildBotStateExt(arm)
	bseString, err := json.Marshal(botStateExt)
	if err != nil {
		return nil, err
	}

	if _, ok := msgMeta.Ext[string(msgEntity.MessageExtKeyBotState)]; !ok {
		msgMeta.Ext[string(msgEntity.MessageExtKeyBotState)] = string(bseString)
	}

	msgMeta.Ext = arm.Ext
	return crossmessage.DefaultSVC().Create(ctx, msgMeta)
}

func (c *runImpl) handlerFinalAnswer(ctx context.Context, msg *entity.ChunkMessageItem, fullContent string, sw *schema.StreamWriter[*entity.AgentRunResponse], usage *msgEntity.UsageExt) error {
	msg.Content = fullContent
	msg.IsFinish = true
	if msg.Ext == nil {
		msg.Ext = map[string]string{}
	}
	if usage != nil {
		msg.Ext[string(msgEntity.MessageExtKeyToken)] = strconv.FormatInt(usage.TotalCount, 10)
		msg.Ext[string(msgEntity.MessageExtKeyInputTokens)] = strconv.FormatInt(usage.InputTokens, 10)
		msg.Ext[string(msgEntity.MessageExtKeyOutputTokens)] = strconv.FormatInt(usage.OutputTokens, 10)
	}

	if _, ok := msg.Ext[string(msgEntity.MessageExtKeyTimeCost)]; !ok {
		msg.Ext[string(msgEntity.MessageExtKeyTimeCost)] = fmt.Sprintf("%.1f", float64(time.Since(c.rtDependence.startTime).Milliseconds())/1000.00)
	}

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
	_, err = crossmessage.DefaultSVC().Edit(ctx, editMsg)
	if err != nil {
		return err
	}
	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, msg, sw)

	return nil
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

func (c *runImpl) handlerFunctionCall(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	cm := c.buildAgentMessage2Create(ctx, chunk, entity.MessageTypeFunctionCall)

	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	return nil
}

func (c *runImpl) handlerAckMessage(_ context.Context, input *msgEntity.Message, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
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
		IsFinish:       true,
	}

	c.runEvent.SendMsgEvent(entity.RunEventAck, sendMsg, sw)

	return nil
}

func (c *runImpl) handlerTooResponse(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	cm := c.buildAgentMessage2Create(ctx, chunk, entity.MessageTypeToolResponse)
	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)

	return nil
}

func (c *runImpl) handlerSuggest(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	cm := c.buildAgentMessage2Create(ctx, chunk, entity.MessageTypeFlowUp)

	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)

	return nil
}

func (c *runImpl) handlerKnowledge(ctx context.Context, chunk *entity.AgentRespEvent, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	cm := c.buildAgentMessage2Create(ctx, chunk, entity.MessageTypeKnowledge)
	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	return nil
}

func (c *runImpl) buildKnowledge(_ context.Context, arm *entity.AgentRunMeta, chunk *entity.AgentRespEvent) *msgEntity.VerboseInfo {
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
		MessageType: string(entity.MessageSubTypeKnowledgeCall),
		Data:        string(data),
	}
	return knowledgeInfo
}

func (c *runImpl) handlerFinalAnswerFinish(ctx context.Context, sw *schema.StreamWriter[*entity.AgentRunResponse]) error {
	cm := c.buildAgentMessage2Create(ctx, nil, entity.MessageTypeVerbose)
	cmData, err := crossmessage.DefaultSVC().Create(ctx, cm)
	if err != nil {
		return err
	}

	sendMsg := c.buildSendMsg(ctx, cmData, true)

	c.runEvent.SendMsgEvent(entity.RunEventMessageCompleted, sendMsg, sw)
	return nil
}

func (c *runImpl) buildSendMsg(_ context.Context, msg *msgEntity.Message, isFinish bool) *entity.ChunkMessageItem {
	return &entity.ChunkMessageItem{
		ID:             msg.ID,
		ConversationID: msg.ConversationID,
		SectionID:      msg.SectionID,
		AgentID:        msg.AgentID,
		Content:        msg.Content,
		Role:           entity.RoleTypeAssistant,
		ContentType:    msg.ContentType,
		MessageType:    msg.MessageType,
		ReplyID:        c.rtDependence.questionMsgID,
		Type:           msg.MessageType,
		CreatedAt:      msg.CreatedAt,
		UpdatedAt:      msg.UpdatedAt,
		Ext:            msg.Ext,
		IsFinish:       isFinish,
	}
}

func (c *runImpl) buildSendRunRecord(_ context.Context, runRecord *entity.RunRecordMeta, runStatus entity.RunStatus) *entity.ChunkRunItem {
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
