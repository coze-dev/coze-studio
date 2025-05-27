package search

import (
	"context"
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/intelligence"
	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	appService "code.byted.org/flow/opencoze/backend/domain/app/service"
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
	GetFavoriteInfo(ctx context.Context) *intelligence.FavoriteInfo
	GetUserInfo(ctx context.Context, userID int64) *common.User
	GetOtherInfo(ctx context.Context) *intelligence.OtherInfo
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

func (p *projectBase) GetFavoriteInfo(ctx context.Context) *intelligence.FavoriteInfo {
	fav, err := p.SVC.FavRepo.Get(ctx, makeFavInfoKey(p.uid, p.iType, p.projectID))
	if err != nil {
		logs.CtxErrorf(ctx, "[projectBase-GetFavoriteInfo] failed to get favorite info uid: %d project_id: %d, type: %d, err: %v",
			p.uid, p.projectID, p.iType, err)

		return &intelligence.FavoriteInfo{}
	}

	return &intelligence.FavoriteInfo{
		IsFav:   fav.IsFav,
		FavTime: conv.Int64ToStr(fav.FavTimeMS / 1000),
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

func (p *agentPacker) GetOtherInfo(ctx context.Context) *intelligence.OtherInfo {
	timeMS, err := p.SVC.SingleAgentDomainSVC.GetRecentOpenAgentTime(ctx, p.uid, p.projectID)
	if err != nil {
		logs.CtxWarnf(ctx, "failed to get recently open agent time, uid: %d, agent_id: %d, err: %v", p.uid, p.projectID, err)
	}

	recentlyOpenTime := ""
	if timeMS > 0 {
		recentlyOpenTime = conv.Int64ToStr(timeMS / 1000)
	}

	return &intelligence.OtherInfo{
		RecentlyOpenTime: recentlyOpenTime,
		BotMode:          intelligence.BotMode_SingleMode,
	}
}

type appPacker struct {
	projectBase
}

func (a *appPacker) GetProjectInfo(ctx context.Context) (*projectInfo, error) {
	// TODO:(@mrh)
	return &projectInfo{}, nil
}

func (a *appPacker) GetPublishedInfo(ctx context.Context) *intelligence.IntelligencePublishInfo {
	res, err := a.SVC.APPDomainSVC.GetAPPReleaseInfo(ctx, &appService.GetAPPReleaseInfoRequest{
		APPID: a.projectID,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "[app-GetPublishedInfo] failed to get published info, app_id=%d, err=%v", a.projectID, err)
		return nil
	}

	connectorInfo := make([]*common.ConnectorInfo, 0, len(res.ConnectorIDs))
	connectors, err := a.SVC.ConnectorDomainSVC.GetByIDs(ctx, res.ConnectorIDs)
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
		PublishTime:  strconv.FormatInt(res.PublishAtMS/1000, 10),
		HasPublished: res.HasPublished,
		Connectors:   connectorInfo,
	}
}

func (p *appPacker) GetOtherInfo(ctx context.Context) *intelligence.OtherInfo {
	return &intelligence.OtherInfo{
		RecentlyOpenTime: "", // TODO:(@mrh) fix me
		BotMode:          intelligence.BotMode_SingleMode,
	}
}
