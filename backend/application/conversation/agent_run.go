package conversation

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/run"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	saEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	convEntity "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type AgentRunApplication struct{}

var AgentRunApplicationService = new(AgentRunApplication)

func (a *AgentRunApplication) Run(ctx context.Context, ar *run.AgentRunRequest) (*schema.StreamReader[*entity.AgentRunResponse], error) {
	_, caErr := a.checkAgent(ctx, ar)
	if caErr != nil {
		logs.CtxErrorf(ctx, "checkAgent err:%v", caErr)
		return nil, caErr
	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)
	conversationData, ccErr := a.checkConversation(ctx, ar, userID)
	if ccErr != nil {
		logs.CtxErrorf(ctx, "checkConversation err:%v", ccErr)
		return nil, ccErr
	}

	if ar.RegenMessageID != nil && ptr.From(ar.RegenMessageID) > 0 {
		msgMeta, err := messageDomainSVC.GetByID(ctx, &msgEntity.GetByIDRequest{
			MessageID: ptr.From(ar.RegenMessageID),
		})
		if err != nil {
			return nil, err
		}
		if msgMeta != nil && msgMeta.Message != nil {
			if msgMeta.Message.UserID != userID {
				return nil, errors.New("message not match")
			}
			_, delErr := messageDomainSVC.Delete(ctx, &msgEntity.DeleteRequest{
				RunIDs: []int64{msgMeta.Message.RunID},
			})
			if delErr != nil {
				return nil, delErr
			}
		}

	}

	arr, err := a.buildAgentRunRequest(ctx, ar, userID, "", conversationData)
	if err != nil {
		logs.CtxErrorf(ctx, "buildAgentRunRequest err:%v", err)
		return nil, err
	}
	return agentRunDomainSVC.AgentRun(ctx, arr)
}

func (a *AgentRunApplication) checkConversation(ctx context.Context, ar *run.AgentRunRequest, userID int64) (*convEntity.Conversation, error) {
	var conversationData *convEntity.Conversation
	if ar.ConversationID > 0 {
		conData, err := conversationDomainSVC.GetByID(ctx, ar.ConversationID)
		if err != nil {
			return nil, err
		}
		conversationData = conData
	}

	if ar.ConversationID == 0 || conversationData == nil { // create conversation

		conData, err := conversationDomainSVC.Create(ctx, &convEntity.CreateMeta{
			AgentID: ar.BotID,
			UserID:  userID,
		})
		if err != nil {
			return nil, err
		}
		if conData == nil {
			return nil, errors.New("conversation data is nil")
		}
		conversationData = conData

		// set ar.ConversationID
		ar.ConversationID = conversationData.ID
	}

	if conversationData.CreatorID != userID {
		return nil, errors.New("conversation data not match")
	}

	return conversationData, nil
}

func (a *AgentRunApplication) checkAgent(ctx context.Context, ar *run.AgentRunRequest) (*saEntity.SingleAgent, error) {

	agentInfo, err := singleAgentDomainSVC.GetSingleAgent(ctx, ar.BotID, "")
	if err != nil {
		return nil, err
	}

	if agentInfo == nil {
		return nil, errors.New("agent info is nil")
	}
	return agentInfo, nil
}

func (a *AgentRunApplication) buildAgentRunRequest(ctx context.Context, ar *run.AgentRunRequest, userID int64, agentVersion string, conversationData *convEntity.Conversation) (*entity.AgentRunMeta, error) {

	var contentType entity.ContentType
	if ptr.From(ar.ContentType) == string(entity.ContentTypeText) {
		contentType = entity.ContentTypeText
	} else {
		contentType = entity.ContentTypeMix
	}

	return &entity.AgentRunMeta{
		ConversationID: ar.ConversationID,
		AgentID:        ar.BotID,
		Content:        a.buildMultiContent(ctx, ar),
		DisplayContent: a.buildDisplayContent(ctx, ar),
		SpaceID:        ptr.From(ar.SpaceID),
		UserID:         userID,
		SectionID:      conversationData.SectionID,
		Tools:          a.buildTools(ar.ToolList),
		ContentType:    contentType,
		Version:        agentVersion,
		Ext:            ar.Extra,
	}, nil
}

func (a *AgentRunApplication) buildDisplayContent(ctx context.Context, ar *run.AgentRunRequest) string {
	if *ar.ContentType == run.ContentTypeText {
		return ""
	}
	return ar.Query
}

func (a *AgentRunApplication) buildTools(tools []*run.Tool) []*entity.Tool {
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

func (a *AgentRunApplication) buildMultiContent(ctx context.Context, ar *run.AgentRunRequest) []*entity.InputMetaData {
	var multiContents []*entity.InputMetaData

	switch *ar.ContentType {
	case run.ContentTypeText:
		multiContents = append(multiContents, &entity.InputMetaData{
			Type: entity.InputTypeText,
			Text: ar.Query,
		})
	case run.ContentTypeImage, run.ContentTypeFile, run.ContentTypeMix:
		var mc *run.MixContentModel

		err := json.Unmarshal([]byte(ar.Query), &mc)
		if err != nil {
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

func (a *AgentRunApplication) parseMultiContent(ctx context.Context, mc []*run.Item) (multiContents []*entity.InputMetaData) {
	for _, item := range mc {
		switch item.Type {
		case run.ContentTypeText:
			multiContents = append(multiContents, &entity.InputMetaData{
				Type: entity.InputTypeText,
				Text: item.Text,
			})
		case run.ContentTypeImage:

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
		case run.ContentTypeFile:

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
