package search

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
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

func NewPackProject(projectID int64, tp common.IntelligenceType, appContext *ServiceComponents) (ProjectPacker, error) {
	base := projectBase{appContext: appContext, projectID: projectID}

	switch tp {
	case common.IntelligenceType_Bot:
		return &agentPacker{projectBase: base}, nil
	case common.IntelligenceType_Project:
		return &applicationPacker{projectBase: base}, nil
	}

	return nil, fmt.Errorf("unsupported project_type: %d , project_id : %d", tp, projectID)
}

type projectBase struct {
	projectID  int64
	appContext *ServiceComponents
}

func (p *projectBase) GetPermissionInfo() *intelligence.IntelligencePermissionInfo {
	return &intelligence.IntelligencePermissionInfo{
		InCollaboration: false,
		CanDelete:       true,
		CanView:         true,
	}
}

func (p *projectBase) GetUserInfo(ctx context.Context, userID int64) *common.User {
	u, err := p.appContext.UserDomainSVC.GetUserInfo(ctx, userID)
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
	agent, err := a.appContext.SingleAgentDomainSVC.GetSingleAgentDraft(ctx, a.projectID)
	if err != nil {
		return nil, err
	}

	return &projectInfo{
		iconURI: agent.IconURI,
		desc:    agent.Desc,
	}, nil
}

func (p *agentPacker) GetPublishedInfo(ctx context.Context) *intelligence.IntelligencePublishInfo {
	pubInfo, err := p.appContext.SingleAgentDomainSVC.GetPublishedInfo(ctx, p.projectID)
	if err != nil {
		logs.CtxErrorf(ctx, "[agent-GetPublishedInfo]failed to get published info, agent_id: %d, err: %v", p.projectID, err)

		return nil
	}

	connectors := make([]*common.ConnectorInfo, 0, len(pubInfo.ConnectorID2PublishTime))
	for connectorID := range pubInfo.ConnectorID2PublishTime {
		c, err := p.appContext.ConnectorDomainSVC.GetByID(ctx, connectorID)
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
		PublishTime:  conv.Int64ToStr(pubInfo.LastPublishTime),
		HasPublished: pubInfo.LastPublishTime > 0,
		Connectors:   connectors,
	}
}

type applicationPacker struct {
	projectBase
}

func (a *applicationPacker) GetProjectInfo(ctx context.Context) (*projectInfo, error) {
	// TODO:(@mrh)
	return &projectInfo{}, nil
}

func (p *applicationPacker) GetPublishedInfo(ctx context.Context) *intelligence.IntelligencePublishInfo {
	// p.appContext.SingleAgentDomainSVC.GetPublishedInfo(ctx, p.projectID)
	// TODO:(@mrh)
	return nil
}
