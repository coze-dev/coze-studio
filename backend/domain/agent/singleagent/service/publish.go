/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package singleagent

import (
	"context"
	"sort"
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/developer_api"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossconnector"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

func (s *singleAgentImpl) SavePublishRecord(ctx context.Context, p *entity.SingleAgentPublish, e *entity.SingleAgent) error {
	err := s.AgentVersionRepo.SavePublishRecord(ctx, p, e)
	if err != nil {
		return err
	}

	err = s.UpdatePublishInfo(ctx, e.AgentID, p.ConnectorIds)
	if err != nil {
		logs.CtxWarnf(ctx, "update publish info failed: %v, agentID: %d , connectorIDs: %v", err, e.AgentID, p.ConnectorIds)
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

func (s *singleAgentImpl) UpdatePublishInfo(ctx context.Context, agentID int64, connectorIDs []int64) error {
	now := time.Now().UnixMilli()
	pubInfo, err := s.PublishInfoRepo.Get(ctx, conv.Int64ToStr(agentID))
	if err != nil {
		return err
	}

	if pubInfo.LastPublishTimeMS > now {
		return nil
	}

	// Warn: Concurrent publishing may have the risk of overwriting, temporarily ignored.
	// Save publish info

	pubInfo.LastPublishTimeMS = now
	pubInfo.AgentID = agentID

	if pubInfo.ConnectorID2PublishTime == nil {
		pubInfo.ConnectorID2PublishTime = make(map[int64]int64)
	}

	for _, connectorID := range connectorIDs {
		pubInfo.ConnectorID2PublishTime[connectorID] = now
	}

	err = s.PublishInfoRepo.Save(ctx, conv.Int64ToStr(agentID), pubInfo)

	return err
}

func (s *singleAgentImpl) GetPublishedInfo(ctx context.Context, agentID int64) (*entity.PublishInfo, error) {
	return s.PublishInfoRepo.Get(ctx, conv.Int64ToStr(agentID))
}

func (s *singleAgentImpl) GetPublishConnectorList(ctx context.Context, agentID int64) (*entity.PublishConnectorData, error) {
	ids := make([]int64, 0, len(entity.PublishConnectorIDWhiteList))
	for v := range entity.PublishConnectorIDWhiteList {
		ids = append(ids, v)
	}

	connectorBasicInfos, err := crossconnector.DefaultSVC().GetByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}

	pubInfo, err := s.GetPublishedInfo(ctx, agentID)
	if err != nil {
		return nil, err
	}

	publishConnectorList := make([]*developer_api.PublishConnectorInfo, 0)
	for _, v := range connectorBasicInfos {
		publishTime, _ := pubInfo.ConnectorID2PublishTime[v.ID]
		isLastPublished := pubInfo.LastPublishTimeMS == publishTime

		c := &developer_api.PublishConnectorInfo{
			ID:              conv.Int64ToStr(v.ID),
			Name:            v.Name,
			Icon:            v.URL,
			Desc:            v.Desc,
			ShareLink:       "",
			ConnectorStatus: developer_api.BotConnectorStatusPtr(developer_api.BotConnectorStatus_Normal),
			IsLastPublished: &isLastPublished,
			LastPublishTime: publishTime / 1000,
			ConfigStatus:    developer_api.ConfigStatus_Configured,
			AllowPunish:     developer_api.AllowPublishStatusPtr(developer_api.AllowPublishStatus_Allowed),
		}

		// If there are new ones, use a map to maintain the ID to BindType relationship.
		if v.ID == consts.WebSDKConnectorID {
			c.BindType = developer_api.BindType_WebSDKBind
		} else if v.ID == consts.APIConnectorID {
			c.BindType = developer_api.BindType_ApiBind
			// c.BindInfo = map[string]string{
			// 	"sdk_version": "1.2.0 -beta.6",//TODO (@fanlv): Where to check the version?
			// }
			c.AuthLoginInfo = &developer_api.AuthLoginInfo{}
		}

		publishConnectorList = append(publishConnectorList, c)
	}

	sort.Slice(publishConnectorList, func(i, j int) bool {
		return publishConnectorList[i].ID < publishConnectorList[j].ID
	})

	return &entity.PublishConnectorData{
		PublishConnectorList: publishConnectorList,
	}, nil
}

func (s *singleAgentImpl) CreateSingleAgent(ctx context.Context, connectorID int64, version string, e *entity.SingleAgent) (int64, error) {
	return s.AgentVersionRepo.Create(ctx, connectorID, version, e)
}
