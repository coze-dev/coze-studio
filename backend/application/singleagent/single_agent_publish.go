package singleagent

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	search "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func (s *SingleAgentApplicationService) PublishAgent(ctx context.Context, req *developer_api.PublishDraftBotRequest) (*developer_api.PublishDraftBotResponse, error) {
	draftAgent, err := s.ValidateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	version, err := s.getPublishAgentVersion(ctx, req)
	if err != nil {
		return nil, err
	}

	connectorIDs := make([]int64, 0, len(req.Connectors))
	for v := range req.Connectors {
		var id int64
		id, err = strconv.ParseInt(v, 10, 64)
		if err != nil {
			return nil, err
		}

		if !entity.PublishConnectorIDWhiteList[id] {
			return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", fmt.Sprintf("connector %d not allowed", id)))
		}

		connectorIDs = append(connectorIDs, id)
	}

	p := &entity.SingleAgentPublish{
		ConnectorIds: connectorIDs,
		Version:      version,
		PublishID:    req.GetPublishID(),
		PublishInfo:  req.HistoryInfo,
	}

	publishFns := []publishFn{
		publishAgentVariables,
		publishAgentPlugins,
	}

	for _, pubFn := range publishFns {
		draftAgent, err = pubFn(ctx, s.appContext, p, draftAgent)
		if err != nil {
			return nil, err
		}
	}

	// TODO: 下面流程修改。
	// 1. 写发布记录
	// 2. 执行渠道的发布操作
	// 3. 记录渠道发布结果。返回
	err = s.DomainSVC.PublishAgent(ctx, p, draftAgent)
	if err != nil {
		return nil, err
	}

	resp := &developer_api.PublishDraftBotResponse{
		Code: 0,
		Msg:  "success",
	}

	resp.Data = &developer_api.PublishDraftBotData{
		CheckNotPass:  false,
		PublishResult: make(map[string]*developer_api.ConnectorBindResult, len(req.Connectors)),
	}

	for k := range req.Connectors {
		resp.Data.PublishResult[k] = &developer_api.ConnectorBindResult{
			Code:                0,
			Msg:                 "success",
			PublishResultStatus: ptr.Of(developer_api.PublishResultStatus_Success),
		}
	}

	s.appContext.EventBus.PublishProject(ctx, &search.ProjectDomainEvent{
		OpType: search.Updated,
		Project: &search.ProjectDocument{
			ID:            draftAgent.AgentID,
			HasPublished:  ptr.Of(1),
			PublishTimeMS: ptr.Of(time.Now().UnixMilli()),
			Type:          common.IntelligenceType_Bot,
		},
	})

	return resp, nil
}

func (s *SingleAgentApplicationService) getPublishAgentVersion(ctx context.Context, req *developer_api.PublishDraftBotRequest) (string, error) {
	version := req.GetCommitVersion()
	if version != "" {
		return version, nil
	}

	v, err := s.appContext.IDGen.GenID(ctx)
	if err != nil {
		return "", err
	}

	version = fmt.Sprintf("%v", v)

	return version, nil
}

func (s *SingleAgentApplicationService) GetAgentPopupInfo(ctx context.Context, req *playground.GetBotPopupInfoRequest) (*playground.GetBotPopupInfoResponse, error) {
	uid := ctxutil.MustGetUIDFromCtx(ctx)
	agentPopupCountInfo := make(map[playground.BotPopupType]int64, len(req.BotPopupTypes))

	for _, agentPopupType := range req.BotPopupTypes {
		count, err := s.DomainSVC.GetAgentPopupCount(ctx, uid, req.GetBotID(), agentPopupType)
		if err != nil {
			return nil, err
		}

		agentPopupCountInfo[agentPopupType] = count
	}

	return &playground.GetBotPopupInfoResponse{
		Data: &playground.BotPopupInfoData{
			BotPopupCountInfo: agentPopupCountInfo,
		},
	}, nil
}

func (s *SingleAgentApplicationService) UpdateAgentPopupInfo(ctx context.Context, req *playground.UpdateBotPopupInfoRequest) (*playground.UpdateBotPopupInfoResponse, error) {
	uid := ctxutil.MustGetUIDFromCtx(ctx)

	err := s.DomainSVC.IncrAgentPopupCount(ctx, uid, req.GetBotID(), req.GetBotPopupType())
	if err != nil {
		return nil, err
	}

	return &playground.UpdateBotPopupInfoResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (s *SingleAgentApplicationService) GetPublishConnectorList(ctx context.Context, req *developer_api.PublishConnectorListRequest) (*developer_api.PublishConnectorListResponse, error) {
	data, err := s.DomainSVC.GetPublishConnectorList(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	return &developer_api.PublishConnectorListResponse{
		PublishConnectorList: data.PublishConnectorList,
		Code:                 0,
		Msg:                  "success",
	}, nil
}

type publishFn func(ctx context.Context, appContext *ServiceComponents, publishInfo *entity.SingleAgentPublish, agent *entity.SingleAgent) (*entity.SingleAgent, error)

func publishAgentVariables(ctx context.Context, appContext *ServiceComponents, publishInfo *entity.SingleAgentPublish, agent *entity.SingleAgent) (*entity.SingleAgent, error) {
	draftAgent := agent
	if draftAgent.VariablesMetaID != nil || *draftAgent.VariablesMetaID == 0 {
		return draftAgent, nil
	}

	var newVariableMetaID int64
	newVariableMetaID, err := appContext.VariablesDomainSVC.PublishMeta(ctx, *draftAgent.VariablesMetaID, publishInfo.Version)
	if err != nil {
		return nil, err
	}

	draftAgent.VariablesMetaID = ptr.Of(newVariableMetaID)

	return draftAgent, nil
}

func publishAgentPlugins(ctx context.Context, appContext *ServiceComponents, publishInfo *entity.SingleAgentPublish, agent *entity.SingleAgent) (*entity.SingleAgent, error) {
	_, err := appContext.PluginDomainSVC.PublishAgentTools(ctx, &service.PublishAgentToolsRequest{
		AgentID: agent.AgentID,
	})
	if err != nil {
		return nil, err
	}

	// existTools := make([]*bot_common.PluginInfo, 0, len(toolRes.VersionTools))
	// for _, tl := range agent.Plugin {
	// 	vs, ok := toolRes.VersionTools[tl.GetApiId()]
	// 	if !ok {
	// 		continue
	// 	}
	// 	existTools = append(existTools, &bot_common.PluginInfo{
	// 		PluginId:     tl.PluginId,
	// 		ApiId:        tl.ApiId,
	// 		ApiName:      vs.ToolName,
	// 		ApiVersionMs: vs.VersionMs,
	// 	})
	// }

	// agent.Plugin = existTools

	return agent, nil
}
