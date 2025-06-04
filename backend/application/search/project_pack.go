package search

import (
	"context"
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	appService "code.byted.org/flow/opencoze/backend/domain/app/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
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
	res, err := a.SVC.APPDomainSVC.GetDraftAPP(ctx, &appService.GetDraftAPPRequest{
		APPID: a.projectID,
	})
	if err != nil {
		return nil, err
	}
	return &projectInfo{
		iconURI: res.APP.GetIconURI(),
		desc:    res.APP.GetDesc(),
	}, nil
}

func (a *appPacker) GetPublishedInfo(ctx context.Context) *intelligence.IntelligencePublishInfo {
	res, err := a.SVC.APPDomainSVC.GetAPPPublishRecord(ctx, &appService.GetAPPPublishRecordRequest{
		APPID: a.projectID,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "[app-GetPublishedInfo] failed to get published info, app_id=%d, err=%v", a.projectID, err)
		return nil
	}

	if res.Record == nil {
		return &intelligence.IntelligencePublishInfo{
			PublishTime:  "",
			HasPublished: false,
			Connectors:   nil,
		}
	}

	record := res.Record

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
		HasPublished: res.Published,
		Connectors:   connectorInfo,
	}
}
