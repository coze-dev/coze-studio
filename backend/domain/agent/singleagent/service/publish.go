package singleagent

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

func (s *singleAgentImpl) PublishAgent(ctx context.Context, p *entity.SingleAgentPublish, e *entity.SingleAgent) error {
	toolRes, err := s.PluginSvr.PublishAgentTools(ctx, &service.PublishAgentToolsRequest{
		AgentID: e.AgentID,
		SpaceID: e.SpaceID,
	})
	if err != nil {
		return err
	}

	existTools := make([]*bot_common.PluginInfo, 0, len(toolRes.VersionTools))
	for _, tl := range e.Plugin {
		vs, ok := toolRes.VersionTools[tl.GetApiId()]
		if !ok {
			continue
		}
		existTools = append(existTools, &bot_common.PluginInfo{
			PluginId:     tl.PluginId,
			ApiId:        tl.ApiId,
			ApiName:      vs.ToolName,
			ApiVersionMs: vs.VersionMs,
		})
	}

	return s.AgentVersionRepo.PublishAgent(ctx, p, e)
}

func (s *singleAgentImpl) GetPublishConnectorList(ctx context.Context, agentID int64) (*entity.PublishConnectorData, error) {
	ids := make([]int64, 0, len(entity.PublishConnectorIDWhiteList))
	for v := range entity.PublishConnectorIDWhiteList {
		ids = append(ids, v)
	}

	connectorBasicInfos, err := s.Connector.GetByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}

	publishConnectorList := make([]*developer_api.PublishConnectorInfo, 0)
	for _, v := range connectorBasicInfos {

		c := &developer_api.PublishConnectorInfo{
			ID:        conv.Int64ToStr(v.ID),
			Name:      v.Name,
			Icon:      v.URL,
			Desc:      v.Desc,
			ShareLink: "",
			// TODO: 查记录状态
			IsLastPublished: ptr.Of(false),
			// LastPublishTime: 0,

			// TODO（@fanlv）: 下面字段确认是在哪里读取，还是写死
			ConfigStatus: developer_api.ConfigStatus_Configured,
			AllowPunish:  developer_api.AllowPublishStatusPtr(developer_api.AllowPublishStatus_Allowed),
			// BindID:       ptr.Of("7504848354783002678"),
		}

		if v.ID == consts.WebSDKConnectorID {
			c.BindType = developer_api.BindType_WebSDKBind
		} else if v.ID == consts.WebSDKConnectorID {
			c.BindType = developer_api.BindType_ApiBind
			c.BindInfo = map[string]string{
				"sdk_version": "1.2.0-beta.6", // TODO（@fanlv）: 确认版本在哪读取？
			}
			c.AuthLoginInfo = &developer_api.AuthLoginInfo{}
		} // 有新的话，用 map 维护 ID2BindType 关系

		publishConnectorList = append(publishConnectorList, c)
	}

	return &entity.PublishConnectorData{
		PublishConnectorList: publishConnectorList,
	}, nil
}
