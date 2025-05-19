package singleagent

import (
	"context"
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func makeAgentPopupInfoKey(agentID int64, agentPopupType playground.BotPopupType) string {
	return fmt.Sprintf("agent_popup_info:%d:%d", agentID, int64(agentPopupType))
}

func (s *SingleAgentApplicationService) PublishAgent(ctx context.Context, req *developer_api.PublishDraftBotRequest) (*developer_api.PublishDraftBotResponse, error) {
	draftAgent, err := s.validateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	version := req.GetCommitVersion()
	if version == "" {
		var v int64
		v, err = s.appContext.IDGen.GenID(ctx)
		if err != nil {
			return nil, err
		}
		version = fmt.Sprintf("%v", v)
	}

	if draftAgent.VariablesMetaID != nil && *draftAgent.VariablesMetaID != 0 {
		var newVariableMetaID int64
		newVariableMetaID, err = s.appContext.VariablesDomainSVC.PublishMeta(ctx, *draftAgent.VariablesMetaID, version)
		if err != nil {
			return nil, err
		}

		draftAgent.VariablesMetaID = ptr.Of(newVariableMetaID)
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

	uid := ctxutil.GetUIDFromCtx(ctx)
	draftAgent.CreatorID = *uid

	p := &entity.SingleAgentPublish{
		ConnectorIds: connectorIDs,
		Version:      version,
		PublishID:    req.GetPublishID(),
		PublishInfo:  req.HistoryInfo,
	}

	err = s.domainSVC.PublishAgent(ctx, p, draftAgent)
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

	return resp, nil
}

func (s *SingleAgentApplicationService) GetAgentPopupInfo(ctx context.Context, req *playground.GetBotPopupInfoRequest) (*playground.GetBotPopupInfoResponse, error) {
	agentPopupCountInfo := make(map[playground.BotPopupType]int64, len(req.BotPopupTypes))
	for _, agentPopupType := range req.BotPopupTypes {
		key := makeAgentPopupInfoKey(req.BotID, agentPopupType)

		count, err := s.appContext.CounterRepo.Get(ctx, key)
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
	key := makeAgentPopupInfoKey(req.BotID, req.BotPopupType)
	err := s.appContext.CounterRepo.IncrBy(ctx, key, 1)
	if err != nil {
		return nil, err
	}

	return &playground.UpdateBotPopupInfoResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (s *SingleAgentApplicationService) GetPublishConnectorList(ctx context.Context, req *developer_api.PublishConnectorListRequest) (*developer_api.PublishConnectorListResponse, error) {
	data, err := s.domainSVC.GetPublishConnectorList(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	return &developer_api.PublishConnectorListResponse{
		PublishConnectorList: data.PublishConnectorList,
		Code:                 0,
		Msg:                  "success",
	}, nil
}
