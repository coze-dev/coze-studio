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
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

type OpenapiAgentRunApplication struct{}

var OpenapiAgentRunApplicationService = new(OpenapiAgentRunApplication)

func (a *OpenapiAgentRunApplication) OpenapiAgentRun(ctx context.Context, ar *run.ChatV3Request) (*schema.StreamReader[*entity.AgentRunResponse], error) {
	_, caErr := a.checkAgent(ctx, ar)
	if caErr != nil {
		logs.CtxErrorf(ctx, "checkAgent err:%v", caErr)
		return nil, caErr
	}

	apiKeyInfo := ctxutil.GetApiAuthFromCtx(ctx)
	userID := apiKeyInfo.UserID
	connectorID := apiKeyInfo.ConnectorID

	if ptr.From(ar.ConnectorID) == consts.WebSDKConnectorID {
		connectorID = ptr.From(ar.ConnectorID)
	}
	conversationData, ccErr := a.checkConversation(ctx, ar, userID, connectorID)
	if ccErr != nil {
		logs.CtxErrorf(ctx, "checkConversation err:%v", ccErr)
		return nil, ccErr
	}

	arr, err := a.buildAgentRunRequest(ctx, ar, userID, connectorID, conversationData)
	if err != nil {
		logs.CtxErrorf(ctx, "buildAgentRunRequest err:%v", err)
		return nil, err
	}
	return ConversationSVC.AgentRunDomainSVC.AgentRun(ctx, arr)
}

func (a *OpenapiAgentRunApplication) checkConversation(ctx context.Context, ar *run.ChatV3Request, userID int64, connectorID int64) (*convEntity.Conversation, error) {
	var conversationData *convEntity.Conversation
	if ptr.From(ar.ConversationID) > 0 {
		conData, err := ConversationSVC.ConversationDomainSVC.GetByID(ctx, ptr.From(ar.ConversationID))
		if err != nil {
			return nil, err
		}
		conversationData = conData
	}

	if ptr.From(ar.ConversationID) == 0 || conversationData == nil {

		conData, err := ConversationSVC.ConversationDomainSVC.Create(ctx, &convEntity.CreateMeta{
			AgentID:     ar.BotID,
			UserID:      userID,
			ConnectorID: connectorID,
		})
		if err != nil {
			return nil, err
		}
		if conData == nil {
			return nil, errors.New("conversation data is nil")
		}
		conversationData = conData

		ar.ConversationID = ptr.Of(conversationData.ID)
	}

	if conversationData.CreatorID != userID {
		return nil, errors.New("conversation data not match")
	}

	return conversationData, nil
}

func (a *OpenapiAgentRunApplication) checkAgent(ctx context.Context, ar *run.ChatV3Request) (*saEntity.SingleAgent, error) {
	agentInfo, err := ConversationSVC.appContext.SingleAgentDomainSVC.GetSingleAgent(ctx, ar.BotID, "")
	if err != nil {
		return nil, err
	}

	if agentInfo == nil {
		return nil, errors.New("agent info is nil")
	}
	return agentInfo, nil
}

func (a *OpenapiAgentRunApplication) buildAgentRunRequest(ctx context.Context, ar *run.ChatV3Request, userID int64, connectorID int64, conversationData *convEntity.Conversation) (*entity.AgentRunMeta, error) {
	var contentType entity.ContentType

	arm := &entity.AgentRunMeta{
		ConversationID:   ptr.From(ar.ConversationID),
		AgentID:          ar.BotID,
		Content:          a.buildMultiContent(ctx, ar),
		SpaceID:          666,
		UserID:           userID,
		SectionID:        conversationData.SectionID,
		PreRetrieveTools: a.buildTools(ar.Tools),
		IsDraft:          true,
		ConnectorID:      connectorID,
		ContentType:      contentType,
		Ext:              ar.ExtraParams,
	}
	return arm, nil
}

func (a *OpenapiAgentRunApplication) buildTools(tools []*run.Tool) []*entity.Tool {
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
			PluginID:  tID,
			Arguments: string(parameters),
			ToolName:  tool.APIName,
		}
		ts = append(ts, t)
	}
	if len(ts) > 0 {
		return ts
	}

	return nil
}

func (a *OpenapiAgentRunApplication) buildMultiContent(ctx context.Context, ar *run.ChatV3Request) []*entity.InputMetaData {
	var multiContents []*entity.InputMetaData

	for _, item := range ar.AdditionalMessages {
		if item == nil {
			continue
		}
		if item.ContentType == run.ContentTypeText {
			if item.Content == "" {
				continue
			}
			multiContents = append(multiContents, &entity.InputMetaData{
				Type: entity.InputTypeText,
				Text: item.Content,
			})
		}

		if item.ContentType == run.ContentTypeMixApi {
			// todo implement
		}

	}

	return multiContents
}
