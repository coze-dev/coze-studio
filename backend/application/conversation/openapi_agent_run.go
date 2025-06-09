package conversation

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/run"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/agentrun"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/conversation"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	saEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	convEntity "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	cmdEntity "code.byted.org/flow/opencoze/backend/domain/shortcutcmd/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

func (a *OpenapiAgentRunApplication) OpenapiAgentRun(ctx context.Context, ar *run.ChatV3Request) (*schema.StreamReader[*entity.AgentRunResponse], error) {
	agentInfo, caErr := a.checkAgent(ctx, ar)
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

	spaceID := agentInfo.SpaceID
	arr, err := a.buildAgentRunRequest(ctx, ar, userID, connectorID, spaceID, conversationData)
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
			Scene:       conversation.SceneOpenApi,
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

func (a *OpenapiAgentRunApplication) buildAgentRunRequest(ctx context.Context, ar *run.ChatV3Request, userID int64, connectorID int64, spaceID int64, conversationData *convEntity.Conversation) (*entity.AgentRunMeta, error) {

	shortcutCMDData, err := a.buildTools(ctx, ar.ShortcutCommand)
	if err != nil {
		return nil, err
	}
	multiContent, contentType, err := a.buildMultiContent(ctx, ar)
	if err != nil {
		return nil, err
	}
	arm := &entity.AgentRunMeta{
		ConversationID:   ptr.From(ar.ConversationID),
		AgentID:          ar.BotID,
		Content:          multiContent,
		SpaceID:          spaceID,
		UserID:           userID,
		SectionID:        conversationData.SectionID,
		PreRetrieveTools: shortcutCMDData,
		IsDraft:          true,
		ConnectorID:      connectorID,
		ContentType:      contentType,
		Ext:              ar.ExtraParams,
	}
	return arm, nil
}

func (a *OpenapiAgentRunApplication) buildTools(ctx context.Context, shortcmd *run.ShortcutCommandDetail) ([]*entity.Tool, error) {
	var ts []*entity.Tool

	if shortcmd == nil {
		return ts, nil
	}

	var shortcutCMD *cmdEntity.ShortcutCmd
	cmdMeta, err := a.ShortcutDomainSVC.GetByCmdID(ctx, shortcmd.CommandID, 0)
	if err != nil {
		return nil, err
	}
	shortcutCMD = cmdMeta
	if shortcutCMD != nil {
		argBytes, err := json.Marshal(shortcmd.Parameters)
		if err == nil {
			ts = append(ts, &entity.Tool{
				PluginID:  shortcutCMD.PluginID,
				Arguments: string(argBytes),
				ToolName:  shortcutCMD.PluginToolName,
				ToolID:    shortcutCMD.PluginToolID,
				Type:      agentrun.ToolType(shortcutCMD.ToolType),
			})
		}
	}

	return ts, nil
}

func (a *OpenapiAgentRunApplication) buildMultiContent(ctx context.Context, ar *run.ChatV3Request) ([]*message.InputMetaData, message.ContentType, error) {
	var multiContents []*message.InputMetaData
	contentType := message.ContentTypeText

	for _, item := range ar.AdditionalMessages {
		if item == nil {
			continue
		}
		if item.Role != string(schema.User) {
			return nil, contentType, errors.New("role not match")
		}
		if item.ContentType == run.ContentTypeText {
			if item.Content == "" {
				continue
			}
			multiContents = append(multiContents, &message.InputMetaData{
				Type: message.InputTypeText,
				Text: item.Content,
			})
		}

		if item.ContentType == run.ContentTypeMixApi {
			contentType = message.ContentTypeMix
			var inputs []*run.AdditionalContent
			err := json.Unmarshal([]byte(item.Content), &inputs)

			logs.CtxInfof(ctx, "inputs:%v, err:%v", conv.DebugJsonToStr(inputs), err)
			if err != nil {
				continue
			}
			for _, one := range inputs {
				if one == nil {
					continue
				}
				switch message.InputType(one.Type) {
				case message.InputTypeText:
					multiContents = append(multiContents, &message.InputMetaData{
						Type: message.InputTypeText,
						Text: ptr.From(one.Text),
					})
				case message.InputTypeImage, message.InputTypeFile:
					multiContents = append(multiContents, &message.InputMetaData{
						Type: message.InputType(one.Type),
						FileData: []*message.FileData{
							{
								Url: one.GetFileURL(),
							},
						},
					})
				default:
					continue
				}
			}
		}

	}

	return multiContents, contentType, nil
}
