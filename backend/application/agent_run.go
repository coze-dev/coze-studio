package application

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/conversation_run"
	entity3 "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	entity2 "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
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

	arr, err := a.buildAgentRunRequest(ctx, ar, userID, "")
	if err != nil {
		return nil, err
	}
	return agentRunDomainSVC.AgentRun(ctx, arr)
}

func (a *AgentRunApplication) checkConversation(ctx context.Context, ar *conversation_run.AgentRunRequest, userID int64) error {

	var conversationData *entity2.Conversation
	if len(ar.ConversationID) > 0 {
		cID, err := strconv.ParseInt(ar.ConversationID, 10, 64)
		if err != nil {
			return err
		}

		conData, err := conversationDomainSVC.GetByID(ctx, &entity2.GetByIDRequest{
			ID: cID,
		})
		if err != nil {
			return err
		}
		conversationData = conData.Conversation
	}

	if len(ar.ConversationID) == 0 || conversationData == nil { // create conversation
		agentID, err := strconv.ParseInt(ar.BotID, 10, 64)
		if err != nil {
			return err
		}

		conData, err := conversationDomainSVC.Create(ctx, &entity2.CreateRequest{
			AgentID: agentID,
			UserID:  userID,
		})
		if err != nil {
			return err
		}
		if conData == nil {
			return errors.New("conversation data is nil")
		}
		conversationData = conData.Conversation

		//set ar.ConversationID
		ar.ConversationID = strconv.FormatInt(conversationData.ID, 10)
	}

	if conversationData.CreatorID != userID {
		return errors.New("conversation data not match")
	}

	return nil
}

func (a *AgentRunApplication) checkAgent(ctx context.Context, ar *conversation_run.AgentRunRequest) (*entity3.SingleAgent, error) {

	agentID, err := strconv.ParseInt(ar.BotID, 10, 64)
	if err != nil {
		return nil, err
	}

	agentInfo, err := singleAgentDomainSVC.GetSingleAgent(ctx, agentID, "")

	if err != nil {
		return nil, err
	}

	if agentInfo == nil {
		return nil, errors.New("agent info is nil")
	}
	return agentInfo, nil
}

func (a *AgentRunApplication) buildAgentRunRequest(ctx context.Context, ar *conversation_run.AgentRunRequest, userID int64, agentVersion string) (*entity.AgentRunRequest, error) {

	agentID, err := strconv.ParseInt(ar.BotID, 10, 64)
	if err != nil {
		return nil, err
	}
	cID, err := strconv.ParseInt(ar.ConversationID, 10, 64)
	if err != nil {
		return nil, err
	}
	spaceID, err := strconv.ParseInt(*ar.SpaceID, 10, 64)
	if err != nil {
		return nil, err
	}

	return &entity.AgentRunRequest{
		ConversationID: cID,
		AgentID:        agentID,
		Content:        a.buildMultiContent(ctx, ar),
		DisplayContent: a.buildDisplayContent(ctx, ar),
		SpaceID:        spaceID,
		UserID:         userID,
		Tools:          a.buildTools(ar.ToolList),
		ContentType:    entity.ContentTypeMulti,
		Version:        agentVersion,
		Ext:            ar.Extra,
	}, nil
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
		parameters, err := json.Marshal(tool.Parameters)
		if err != nil {
			continue
		}
		tID, err := strconv.ParseInt(tool.PluginID, 10, 64)
		if err != nil {
			continue
		}
		t := &entity.Tool{
			PluginId:   tID,
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
