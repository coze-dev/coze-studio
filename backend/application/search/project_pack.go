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

package search

import (
	"context"
	"fmt"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/api/model/app/intelligence"
	"github.com/coze-dev/coze-studio/backend/api/model/app/intelligence/common"
	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
	appService "github.com/coze-dev/coze-studio/backend/domain/app/service"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type projectInfo struct {
	iconURI string
	desc    string
}

type ProjectPacker interface {
	GetProjectInfo(ctx context.Context) (*projectInfo, error)
	GetPermissionInfo() *intelligence.IntelligencePermissionInfo
	GetPublishedInfo(ctx context.Context) *intelligence.IntelligencePublishInfo
	GetUserInfo(ctx context.Context, userID int64) *common.User
}

func NewPackProject(uid, projectID int64, tp common.IntelligenceType, s *SearchApplicationService) (ProjectPacker, error) {
	base := projectBase{SVC: s, projectID: projectID, iType: tp, uid: uid}

	switch tp {
	case common.IntelligenceType_Bot:
		return &agentPacker{projectBase: base}, nil
	case common.IntelligenceType_Project:
		return &appPacker{projectBase: base}, nil
	}

	return nil, fmt.Errorf("unsupported project_type: %d , project_id : %d", tp, projectID)
}

type projectBase struct {
	projectID int64 // agent_id or application_id
	uid       int64
	SVC       *SearchApplicationService
	iType     common.IntelligenceType
}

func (p *projectBase) GetPermissionInfo() *intelligence.IntelligencePermissionInfo {
	return &intelligence.IntelligencePermissionInfo{
		InCollaboration: false,
		CanDelete:       true,
		CanView:         true,
	}
}

func (p *projectBase) GetUserInfo(ctx context.Context, userID int64) *common.User {
	u, err := p.SVC.UserDomainSVC.GetUserInfo(ctx, userID)
	if err != nil {
		logs.CtxErrorf(ctx, "[projectBase-GetUserInfo] failed to get user info, user_id: %d, err: %v", userID, err)
		return nil
	}

	return &common.User{
		UserID:         u.UserID,
		AvatarURL:      u.IconURL,
		UserUniqueName: u.UniqueName,
	}
}

type agentPacker struct {
	projectBase
}

func (a *agentPacker) GetProjectInfo(ctx context.Context) (*projectInfo, error) {
	agent, err := a.SVC.SingleAgentDomainSVC.GetSingleAgentDraft(ctx, a.projectID)
	if err != nil {
		return nil, err
	}

	if agent == nil {
		return nil, fmt.Errorf("agent info is nil")
	}
	return &projectInfo{
		iconURI: agent.IconURI,
		desc:    agent.Desc,
	}, nil
}

func (p *agentPacker) GetPublishedInfo(ctx context.Context) *intelligence.IntelligencePublishInfo {
	pubInfo, err := p.SVC.SingleAgentDomainSVC.GetPublishedInfo(ctx, p.projectID)
	if err != nil {
		logs.CtxErrorf(ctx, "[agent-GetPublishedInfo]failed to get published info, agent_id: %d, err: %v", p.projectID, err)

		return nil
	}

	connectors := make([]*common.ConnectorInfo, 0, len(pubInfo.ConnectorID2PublishTime))
	for connectorID := range pubInfo.ConnectorID2PublishTime {
		c, err := p.SVC.ConnectorDomainSVC.GetByID(ctx, connectorID)
		if err != nil {
			logs.CtxErrorf(ctx, "failed to get connector by id: %d, err: %v", connectorID, err)

			continue
		}

		connectors = append(connectors, &common.ConnectorInfo{
			ID:              conv.Int64ToStr(c.ID),
			Name:            c.Name,
			ConnectorStatus: common.ConnectorDynamicStatus(c.ConnectorStatus),
			Icon:            c.URL,
		})
	}

	return &intelligence.IntelligencePublishInfo{
		PublishTime:  conv.Int64ToStr(pubInfo.LastPublishTimeMS / 1000),
		HasPublished: pubInfo.LastPublishTimeMS > 0,
		Connectors:   connectors,
	}
}

type appPacker struct {
	projectBase
}

func (a *appPacker) GetProjectInfo(ctx context.Context) (*projectInfo, error) {
	app, err := a.SVC.APPDomainSVC.GetDraftAPP(ctx, a.projectID)
	if err != nil {
		return nil, err
	}
	return &projectInfo{
		iconURI: app.GetIconURI(),
		desc:    app.GetDesc(),
	}, nil
}

func (a *appPacker) GetPublishedInfo(ctx context.Context) *intelligence.IntelligencePublishInfo {
	record, exist, err := a.SVC.APPDomainSVC.GetAPPPublishRecord(ctx, &appService.GetAPPPublishRecordRequest{
		APPID:  a.projectID,
		Oldest: true,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "[app-GetPublishedInfo] failed to get published info, app_id=%d, err=%v", a.projectID, err)
		return nil
	}
	if !exist {
		return &intelligence.IntelligencePublishInfo{
			PublishTime:  "",
			HasPublished: false,
			Connectors:   nil,
		}
	}

	connectorInfo := make([]*common.ConnectorInfo, 0, len(record.ConnectorPublishRecords))
	connectorIDs := slices.Transform(record.ConnectorPublishRecords, func(c *entity.ConnectorPublishRecord) int64 {
		return c.ConnectorID
	})

	connectors, err := a.SVC.ConnectorDomainSVC.GetByIDs(ctx, connectorIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "[app-GetPublishedInfo] failed to get connector info, app_id=%d, err=%v", a.projectID, err)
	} else {
		for _, c := range connectors {
			connectorInfo = append(connectorInfo, &common.ConnectorInfo{
				ID:              conv.Int64ToStr(c.ID),
				Name:            c.Name,
				ConnectorStatus: common.ConnectorDynamicStatus(c.ConnectorStatus),
				Icon:            c.URL,
			})
		}
	}

	return &intelligence.IntelligencePublishInfo{
		PublishTime:  strconv.FormatInt(record.APP.GetPublishedAtMS()/1000, 10),
		HasPublished: record.APP.Published(),
		Connectors:   connectorInfo,
	}
}
