package application

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/conversation_run"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	entity3 "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation"
	entity2 "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/convert"
)

type AgentRunApplication struct {
}

var AgentRunApplicationService = new(AgentRunApplication)

func (a *AgentRunApplication) Run(ctx context.Context, ar *conversation_run.AgentRunRequest) (*schema.StreamReader[*entity.AgentRunResponse], error) {

	_, caErr := a.checkAgent(ctx, ar)
	if caErr != nil {
		return nil, caErr
	}

	var userID int64 = 0
	ccErr := a.checkConversation(ctx, ar, userID)
	if ccErr != nil {
		return nil, ccErr
	}

	components := &run.Components{
		IDGen: idGenSVC,
		DB:    db,
	}

	return run.NewService(components).AgentRun(ctx, a.buildAgentRunRequest(ctx, ar, userID, ""))
}

func (a *AgentRunApplication) checkConversation(ctx context.Context, ar *conversation_run.AgentRunRequest, userID int64) error {

	components := &conversation.Components{
		IDGen: idGenSVC,
		DB:    db,
	}
	conversationService := conversation.NewService(components)

	var conversationData *entity2.Conversation
	if len(ar.ConversationID) > 0 {
		conData, err := conversationService.GetByID(ctx, &entity2.GetByIDRequest{
			ID: convert.StringToInt64(ar.ConversationID),
		})
		if err != nil {
			return err
		}
		conversationData = conData.Conversation
	}

	if len(ar.ConversationID) == 0 || conversationData == nil { // create conversation
		conData, err := conversationService.Create(ctx, &entity2.CreateRequest{
			AgentID: convert.StringToInt64(ar.BotID),
			UserID:  userID,
			Scene:   "debug",
		})
		if err != nil {
			return err
		}
		if conData == nil {
			return errors.New("conversation data is nil")
		}
		conversationData = conData.Conversation

		//set ar.ConversationID
		ar.ConversationID = convert.Int64ToString(conversationData.ID)
	}

	if conversationData.CreatorID != userID {
		return errors.New("conversation data not match")
	}

	return nil
}

func (a *AgentRunApplication) checkAgent(ctx context.Context, ar *conversation_run.AgentRunRequest) (*entity3.SingleAgent, error) {

	components := &singleagent.Components{
		IDGen: idGenSVC,
		DB:    db,
	}

	agentInfo, err := singleagent.NewService(components).GetSingleAgent(ctx, convert.StringToInt64(ar.BotID), "")

	if err != nil {
		return nil, err
	}

	if agentInfo == nil {
		return nil, errors.New("agent info is nil")
	}
	return agentInfo, nil
}

func (a *AgentRunApplication) buildAgentRunRequest(ctx context.Context, ar *conversation_run.AgentRunRequest, userID int64, agentVersion string) *entity.AgentRunRequest {

	return &entity.AgentRunRequest{
		ChatMessage: &entity.ChatMessage{
			ConversationID: convert.StringToInt64(ar.ConversationID),
			AgentID:        convert.StringToInt64(ar.BotID),
			Content:        a.buildMultiContent(ctx, ar),
			DisplayContent: a.buildDisplayContent(ctx, ar),
			SpaceID:        convert.StringToInt64(*ar.SpaceID),
			UserID:         userID,
			Tools:          a.buildTools(ar.ToolList),
			ContentType:    entity.ContentTypeMulti,
			Version:        agentVersion,
			Ext:            ar.Extra,
		},
	}
}

func (a *AgentRunApplication) buildDisplayContent(ctx context.Context, ar *conversation_run.AgentRunRequest) string {

	if *ar.ContentType == conversation_run.ContentTypeText {
		return ""
	}
	return ar.Query
}

func (a *AgentRunApplication) buildTools(tools []*conversation_run.Tool) []*entity.Tool {
	var ts []*entity.Tool
	for _, tool := range tools {
		parameters, _ := json.Marshal(tool.Parameters)
		t := &entity.Tool{
			PluginId:   convert.StringToInt64(tool.PluginID),
			Parameters: string(parameters),
			ApiName:    tool.APIName,
		}
		ts = append(ts, t)
	}
	if len(ts) > 0 {
		return ts
	}

	return nil
}

func (a *AgentRunApplication) buildMultiContent(ctx context.Context, ar *conversation_run.AgentRunRequest) []*entity.InputMetaData {

	var multiContents []*entity.InputMetaData

	switch *ar.ContentType {
	case conversation_run.ContentTypeText:
		multiContents = append(multiContents, &entity.InputMetaData{
			Type: entity.InputTypeText,
			Text: ar.Query,
		})
	case conversation_run.ContentTypeImage, conversation_run.ContentTypeFile, conversation_run.ContentTypeMix:
		var mc *conversation_run.MixContentModel

		err := json.Unmarshal([]byte(ar.Query), &mc)
		if err != nil || mc == nil {
			multiContents = append(multiContents, &entity.InputMetaData{
				Type: entity.InputTypeText,
				Text: ar.Query,
			})
			return multiContents
		}

		// parse mc.data
		mcContent := a.parseMultiContent(ctx, mc.ItemList)
		multiContents = append(multiContents, mcContent...)
	}

	return multiContents
}

func (a *AgentRunApplication) parseMultiContent(ctx context.Context, mc []*conversation_run.Item) (multiContents []*entity.InputMetaData) {

	for _, item := range mc {
		switch item.Type {
		case conversation_run.ContentTypeText:
			multiContents = append(multiContents, &entity.InputMetaData{
				Type: entity.InputTypeText,
				Text: item.Text,
			})
		case conversation_run.ContentTypeImage:

			resourceUrl, err := imagexClient.GetResourceURL(ctx, item.Image.Key)
			if err != nil {
				continue
			}

			multiContents = append(multiContents, &entity.InputMetaData{
				Type: entity.InputTypeImage,
				FileData: []*entity.FileData{
					{
						Url: resourceUrl.URL,
					},
				},
			})
		case conversation_run.ContentTypeFile:

			resourceUrl, err := imagexClient.GetResourceURL(ctx, item.Image.Key)
			if err != nil {
				continue
			}

			multiContents = append(multiContents, &entity.InputMetaData{
				Type: entity.InputTypeFile,
				FileData: []*entity.FileData{
					{
						Url: resourceUrl.URL,
					},
				},
			})
		}
	}

	return
}
