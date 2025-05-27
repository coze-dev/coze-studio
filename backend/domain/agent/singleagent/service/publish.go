package singleagent

import (
	"context"
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

func (s *singleAgentImpl) PublishAgent(ctx context.Context, p *entity.SingleAgentPublish, e *entity.SingleAgent) error {
	err := s.AgentVersionRepo.PublishAgent(ctx, p, e)
	if err != nil {
		return err
	}

	now := time.Now().UnixMilli()
	pubInfo, err := s.PublishInfoRepo.Get(ctx, conv.Int64ToStr(e.AgentID))
	if err != nil {
		return err
	}

	if pubInfo.LastPublishTimeMS > now {
		return nil
	}

	// Warn: Concurrent publishing may have the risk of overwriting, temporarily ignored.
	// save publish info
	pubInfo.LastPublishTimeMS = now
	pubInfo.AgentID = e.AgentID

	if pubInfo.ConnectorID2PublishTime == nil {
		pubInfo.ConnectorID2PublishTime = make(map[int64]int64)
	}

	for _, connectorID := range p.ConnectorIds {
		pubInfo.ConnectorID2PublishTime[connectorID] = now
	}

	err = s.PublishInfoRepo.Save(ctx, conv.Int64ToStr(e.AgentID), pubInfo)
	if err != nil {
		logs.CtxWarnf(ctx, "save publish info failed: %v, agentID: %d , connectorIDs: %v", err, e.AgentID, p.ConnectorIds)
	}

	return nil
}

func (s *singleAgentImpl) GetPublishedTime(ctx context.Context, agentID int64) (int64, error) {
	pubInfo, err := s.PublishInfoRepo.Get(ctx, conv.Int64ToStr(agentID))
	if err != nil {
		return 0, err
	}

	return pubInfo.LastPublishTimeMS, nil
}

func (s *singleAgentImpl) GetPublishedInfo(ctx context.Context, agentID int64) (*entity.PublishInfo, error) {
	return s.PublishInfoRepo.Get(ctx, conv.Int64ToStr(agentID))
}

func (s *singleAgentImpl) GetPublishConnectorList(ctx context.Context, agentID int64) (*entity.PublishConnectorData, error) {
	ids := make([]int64, 0, len(entity.PublishConnectorIDWhiteList))
	for v := range entity.PublishConnectorIDWhiteList {
		ids = append(ids, v)
	}

	connectorBasicInfos, err := s.ConnectorCross.GetByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}

	pubInfo, err := s.PublishInfoRepo.Get(ctx, conv.Int64ToStr(agentID))
	if err != nil {
		return nil, err
	}

	publishConnectorList := make([]*developer_api.PublishConnectorInfo, 0)
	for _, v := range connectorBasicInfos {
		publishTime, hasPublishTime := pubInfo.ConnectorID2PublishTime[v.ID]

		c := &developer_api.PublishConnectorInfo{
			ID:              conv.Int64ToStr(v.ID),
			Name:            v.Name,
			Icon:            v.URL,
			Desc:            v.Desc,
			ShareLink:       "",
			ConnectorStatus: developer_api.BotConnectorStatusPtr(developer_api.BotConnectorStatus_Normal),
			IsLastPublished: &hasPublishTime,
			LastPublishTime: publishTime / 1000,
			ConfigStatus:    developer_api.ConfigStatus_Configured,
			AllowPunish:     developer_api.AllowPublishStatusPtr(developer_api.AllowPublishStatus_Allowed),
		}

		if v.ID == consts.WebSDKConnectorID {
			c.BindType = developer_api.BindType_WebSDKBind
		} else if v.ID == consts.AgentAsAPIConnectorID {
			c.BindType = developer_api.BindType_ApiBind
			// c.BindInfo = map[string]string{
			// 	"sdk_version": "1.2.0-beta.6", // TODO（@fanlv）: 确认版本在哪读取？
			// }
			c.AuthLoginInfo = &developer_api.AuthLoginInfo{}
		} // 有新的话，用 map 维护 ID2BindType 关系

		publishConnectorList = append(publishConnectorList, c)
	}

	return &entity.PublishConnectorData{
		PublishConnectorList: publishConnectorList,
	}, nil
}
