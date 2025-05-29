package conversation

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/conversation/run"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	saEntity "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	convEntity "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	msgEntity "code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	cmdEntity "code.byted.org/flow/opencoze/backend/domain/shortcutcmd/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

func (c *ConversationApplicationService) Run(ctx context.Context, ar *run.AgentRunRequest) (*schema.StreamReader[*entity.AgentRunResponse], error) {
	_, caErr := c.checkAgent(ctx, ar)
	if caErr != nil {
		logs.CtxErrorf(ctx, "checkAgent err:%v", caErr)
		return nil, caErr
	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)
	conversationData, ccErr := c.checkConversation(ctx, ar, userID)
	if ccErr != nil {
		logs.CtxErrorf(ctx, "checkConversation err:%v", ccErr)
		return nil, ccErr
	}

	if ar.RegenMessageID != nil && ptr.From(ar.RegenMessageID) > 0 {
		msgMeta, err := c.MessageDomainSVC.GetByID(ctx, ptr.From(ar.RegenMessageID))
		if err != nil {
			return nil, err
		}
		if msgMeta != nil {
			if msgMeta.UserID != userID {
				return nil, errors.New("message not match")
			}
			delErr := c.MessageDomainSVC.Delete(ctx, &msgEntity.DeleteMeta{
				RunIDs: []int64{msgMeta.RunID},
			})
			if delErr != nil {
				return nil, delErr
			}
		}

	}
	var shortcutCmd *cmdEntity.ShortcutCmd
	if ar.GetShortcutCmdID() > 0 {
		cmdID := ar.GetShortcutCmdID()
		cmdMeta, err := c.ShortcutDomainSVC.GetByCmdID(ctx, cmdID, 0)
		if err != nil {
			return nil, err
		}
		shortcutCmd = cmdMeta
	}

	arr, err := c.buildAgentRunRequest(ctx, ar, userID, conversationData, shortcutCmd)
	if err != nil {
		logs.CtxErrorf(ctx, "buildAgentRunRequest err:%v", err)
		return nil, err
	}
	return c.AgentRunDomainSVC.AgentRun(ctx, arr)
}

func (c *ConversationApplicationService) checkConversation(ctx context.Context, ar *run.AgentRunRequest, userID int64) (*convEntity.Conversation, error) {
	var conversationData *convEntity.Conversation
	if ar.ConversationID > 0 {
		conData, err := c.ConversationDomainSVC.GetByID(ctx, ar.ConversationID)
		if err != nil {
			return nil, err
		}
		conversationData = conData
	}

	if ar.ConversationID == 0 || conversationData == nil { // create conversation

		conData, err := c.ConversationDomainSVC.Create(ctx, &convEntity.CreateMeta{
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

func (c *ConversationApplicationService) checkAgent(ctx context.Context, ar *run.AgentRunRequest) (*saEntity.SingleAgent, error) {
	agentInfo, err := c.appContext.SingleAgentDomainSVC.GetSingleAgent(ctx, ar.BotID, "")
	if err != nil {
		return nil, err
	}

	if agentInfo == nil {
		return nil, errors.New("agent info is nil")
	}
	return agentInfo, nil
}

func (c *ConversationApplicationService) buildAgentRunRequest(ctx context.Context, ar *run.AgentRunRequest, userID int64, conversationData *convEntity.Conversation, shortcutCMD *cmdEntity.ShortcutCmd) (*entity.AgentRunMeta, error) {
	var contentType entity.ContentType
	if ptr.From(ar.ContentType) == string(entity.ContentTypeText) {
		contentType = entity.ContentTypeText
	} else {
		contentType = entity.ContentTypeMix
	}

	arm := &entity.AgentRunMeta{
		ConversationID:   ar.ConversationID,
		AgentID:          ar.BotID,
		Content:          c.buildMultiContent(ctx, ar),
		DisplayContent:   c.buildDisplayContent(ctx, ar),
		SpaceID:          ptr.From(ar.SpaceID),
		UserID:           userID,
		SectionID:        conversationData.SectionID,
		PreRetrieveTools: c.buildTools(ar.ToolList, shortcutCMD),
		IsDraft:          ptr.From(ar.DraftMode),
		ConnectorID:      consts.CozeConnectorID,
		ContentType:      contentType,
		Ext:              ar.Extra,
	}
	return arm, nil
}

func (c *ConversationApplicationService) buildDisplayContent(ctx context.Context, ar *run.AgentRunRequest) string {
	if *ar.ContentType == run.ContentTypeText {
		return ""
	}
	return ar.Query
}

func (c *ConversationApplicationService) buildTools(tools []*run.Tool, shortcutCMD *cmdEntity.ShortcutCmd) []*entity.Tool {
	var ts []*entity.Tool
	for _, tool := range tools {

		if shortcutCMD != nil {

			arguments := make(map[string]string)
			for key, parametersStruct := range tool.Parameters {
				if parametersStruct == nil {
					continue
				}
				arguments[key] = parametersStruct.Value
				// uri需要转换成url
				// if parametersStruct.ResourceType == base.ResourceTypeUri {
				// 	url, ok := urlMap[parametersStruct.Value]
				// 	if !ok {
				// 		return nil
				// 	}
				// 	platformParameters[key] = url
				// }
			}

			argBytes, err := json.Marshal(arguments)
			if err == nil {
				ts = append(ts, &entity.Tool{
					PluginID:  shortcutCMD.PluginID,
					Arguments: string(argBytes),
					ToolName:  shortcutCMD.PluginToolName,
					ToolID:    shortcutCMD.PluginToolID,
					Type:      entity.ToolType(shortcutCMD.ToolType),
				})
			}

		}
	}
	if len(ts) > 0 {
		return ts
	}

	return nil
}

func (c *ConversationApplicationService) buildMultiContent(ctx context.Context, ar *run.AgentRunRequest) []*entity.InputMetaData {
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

		mcContent, newItemList := c.parseMultiContent(ctx, mc.ItemList)

		multiContents = append(multiContents, mcContent...)

		mc.ItemList = newItemList
		mcByte, err := json.Marshal(mc)
		if err == nil {
			ar.Query = string(mcByte)
		}
	}

	return multiContents
}

func (c *ConversationApplicationService) parseMultiContent(ctx context.Context, mc []*run.Item) (multiContents []*entity.InputMetaData, mcNew []*run.Item) {
	for index, item := range mc {
		switch item.Type {
		case run.ContentTypeText:
			multiContents = append(multiContents, &entity.InputMetaData{
				Type: entity.InputTypeText,
				Text: item.Text,
			})
		case run.ContentTypeImage:

			resourceUrl, err := c.appContext.ImageX.GetResourceURL(ctx, item.Image.Key)
			if err != nil {
				continue
			}
			mc[index].Image.ImageThumb.URL = resourceUrl.URL
			mc[index].Image.ImageOri.URL = resourceUrl.URL

			multiContents = append(multiContents, &entity.InputMetaData{
				Type: entity.InputTypeImage,
				FileData: []*entity.FileData{
					{
						Url: resourceUrl.URL,
					},
				},
			})
		case run.ContentTypeFile:

			resourceUrl, err := c.appContext.ImageX.GetResourceURL(ctx, item.Image.Key)
			if err != nil {
				continue
			}
			mc[index].File.FileURL = resourceUrl.URL

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

	return multiContents, mc
}
