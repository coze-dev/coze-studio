package singleagent

import (
	"context"
	"fmt"
	"strconv"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	intelligence "code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/api/model/table"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	singleagent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/service"
	variableEntity "code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type SingleAgentApplicationService struct {
	appContext *ServiceComponents
	DomainSVC  singleagent.SingleAgent
}

func newApplicationService(s *ServiceComponents, domain singleagent.SingleAgent) *SingleAgentApplicationService {
	return &SingleAgentApplicationService{
		appContext: s,
		DomainSVC:  domain,
	}
}

const onboardingInfoMaxLength = 65535

func (s *SingleAgentApplicationService) generateOnboardingStr(onboardingInfo *bot_common.OnboardingInfo) (string, error) {
	onboarding := playground.OnboardingContent{}
	if onboardingInfo != nil {
		onboarding.Prologue = ptr.Of(onboardingInfo.GetPrologue())
		onboarding.SuggestedQuestions = onboardingInfo.GetSuggestedQuestions()
		onboarding.SuggestedQuestionsShowMode = onboardingInfo.SuggestedQuestionsShowMode
	}

	onboardingInfoStr, err := sonic.MarshalString(onboarding)
	if err != nil {
		return "", err
	}

	return onboardingInfoStr, nil
}

func (s *SingleAgentApplicationService) UpdateSingleAgentDraft(ctx context.Context, req *playground.UpdateDraftBotInfoAgwRequest) (*playground.UpdateDraftBotInfoAgwResponse, error) {
	if req.BotInfo.OnboardingInfo != nil {
		infoStr, err := s.generateOnboardingStr(req.BotInfo.OnboardingInfo)
		if err != nil {
			return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "onboarding_info invalidate"))
		}

		if len(infoStr) > onboardingInfoMaxLength {
			return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "onboarding_info is too long"))
		}
	}

	agentID := req.BotInfo.GetBotId()
	currentAgentInfo, err := s.ValidateAgentDraftAccess(ctx, agentID)
	if err != nil {
		return nil, err
	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)

	updateAgentInfo, err := s.applyAgentUpdates(currentAgentInfo, req.BotInfo)
	if err != nil {
		return nil, err
	}

	if req.BotInfo.VariableList != nil {
		var (
			varsMetaID int64
			vars       = variableEntity.NewVariablesWithAgentVariables(req.BotInfo.VariableList)
		)

		varsMetaID, err = s.appContext.VariablesDomainSVC.UpsertBotMeta(ctx, agentID, "", userID, vars)
		if err != nil {
			return nil, err
		}

		updateAgentInfo.VariablesMetaID = &varsMetaID
	}

	err = s.DomainSVC.UpdateSingleAgentDraft(ctx, updateAgentInfo)
	if err != nil {
		return nil, err
	}

	err = s.appContext.EventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Updated,
		Project: &searchEntity.ProjectDocument{
			ID:   agentID,
			Name: &updateAgentInfo.Name,
			Type: intelligence.IntelligenceType_Bot,
		},
	})
	if err != nil {
		return nil, err
	}

	return &playground.UpdateDraftBotInfoAgwResponse{
		Data: &playground.UpdateDraftBotInfoAgwData{
			HasChange:    ptr.Of(true),
			CheckNotPass: false,
			Branch:       playground.BranchPtr(playground.Branch_PersonalDraft),
		},
	}, nil
}

func (s *SingleAgentApplicationService) UpdatePromptDisable(ctx context.Context, req *table.UpdateDatabaseBotSwitchRequest) (*table.UpdateDatabaseBotSwitchResponse, error) {
	agentID := req.GetBotID()
	draft, err := s.ValidateAgentDraftAccess(ctx, agentID)
	if err != nil {
		return nil, err
	}

	if len(draft.Database) == 0 {
		return nil, fmt.Errorf("agent %d has no database", agentID) // TODO（@fanlv）: 错误码
	}

	dbInfos := draft.Database
	var found bool
	for _, db := range dbInfos {
		if db.GetTableId() == conv.Int64ToStr(req.GetDatabaseID()) {
			db.PromptDisabled = ptr.Of(req.GetPromptDisable())
			found = true
			break
		}
	}

	if !found {
		return nil, fmt.Errorf("database %d not found in agent %d", req.GetDatabaseID(), agentID) // TODO（@fanlv）: 错误码
	}

	draft.Database = dbInfos
	err = s.DomainSVC.UpdateSingleAgentDraft(ctx, draft)
	if err != nil {
		return nil, err
	}

	return &table.UpdateDatabaseBotSwitchResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (s *SingleAgentApplicationService) applyAgentUpdates(target *entity.SingleAgent, patch *bot_common.BotInfoForUpdate) (*entity.SingleAgent, error) {
	if patch.Name != nil {
		target.Name = *patch.Name
	}

	if patch.Description != nil {
		target.Desc = *patch.Description
	}

	if patch.IconUri != nil {
		target.IconURI = *patch.IconUri
	}

	if patch.OnboardingInfo != nil {
		target.OnboardingInfo = patch.OnboardingInfo
	}

	if patch.ModelInfo != nil {
		target.ModelInfo = patch.ModelInfo
	}

	if patch.PromptInfo != nil {
		target.Prompt = patch.PromptInfo
	}

	if patch.WorkflowInfoList != nil {
		target.Workflow = patch.WorkflowInfoList
	}

	if patch.PluginInfoList != nil {
		target.Plugin = patch.PluginInfoList
	}

	if patch.Knowledge != nil {
		target.Knowledge = patch.Knowledge
	}

	if patch.SuggestReplyInfo != nil {
		target.SuggestReply = patch.SuggestReplyInfo
	}

	if patch.BackgroundImageInfoList != nil {
		target.BackgroundImageInfoList = patch.BackgroundImageInfoList
	}

	if patch.Agents != nil && len(patch.Agents) > 0 && patch.Agents[0].JumpConfig != nil {
		target.JumpConfig = patch.Agents[0].JumpConfig
	}

	if patch.ShortcutSort != nil {
		target.ShortcutCommand = patch.ShortcutSort
	}

	if patch.DatabaseList != nil {
		for _, db := range patch.DatabaseList {
			if db.PromptDisabled == nil {
				db.PromptDisabled = ptr.Of(false) // default is false
			}
		}
		target.Database = patch.DatabaseList
	}

	return target, nil
}

func (s *SingleAgentApplicationService) DeleteAgentDraft(ctx context.Context, req *developer_api.DeleteDraftBotRequest) (*developer_api.DeleteDraftBotResponse, error) {
	_, err := s.ValidateAgentDraftAccess(ctx, req.GetBotID())
	if err != nil {
		return nil, err
	}

	err = s.DomainSVC.DeleteAgentDraft(ctx, req.GetSpaceID(), req.GetBotID())
	if err != nil {
		return nil, err
	}

	err = s.appContext.EventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Deleted,
		Project: &searchEntity.ProjectDocument{
			ID:   req.GetBotID(),
			Type: intelligence.IntelligenceType_Bot,
		},
	})
	if err != nil {
		logs.CtxWarnf(ctx, "publish delete project event failed id = %v , err = %v", req.GetBotID(), err)
	}

	return &developer_api.DeleteDraftBotResponse{
		Data: &developer_api.DeleteDraftBotData{},
		Code: 0,
	}, nil
}

func (s *SingleAgentApplicationService) DuplicateDraftBot(ctx context.Context, req *developer_api.DuplicateDraftBotRequest) (*developer_api.DuplicateDraftBotResponse, error) {
	userIDPtr := ctxutil.GetUIDFromCtx(ctx)
	if userIDPtr == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	userID := *userIDPtr

	copiedAgent, err := s.DomainSVC.Duplicate(ctx, &entity.DuplicateAgentRequest{
		SpaceID: req.GetSpaceID(),
		AgentID: req.GetBotID(),
		UserID:  userID,
	})
	if err != nil {
		return nil, err
	}

	userInfos, err := s.appContext.UserDomainSVC.MGetUserProfiles(ctx, []int64{userID})
	if err != nil {
		return nil, err
	}

	if len(userInfos) == 0 {
		return nil, errorx.New(errno.ErrResourceNotFound, errorx.KV("type", "user"),
			errorx.KV("id", strconv.FormatInt(userID, 10)))
	}

	return &developer_api.DuplicateDraftBotResponse{
		Data: &developer_api.DuplicateDraftBotData{
			BotID: copiedAgent.AgentID,
			Name:  copiedAgent.Name,
			UserInfo: &developer_api.Creator{
				ID:             userID,
				Name:           userInfos[0].Name,
				AvatarURL:      userInfos[0].IconURL,
				Self:           false,
				UserUniqueName: userInfos[0].UniqueName,
				UserLabel:      nil,
			},
		},
		Code: 0,
	}, nil
}

func (s *SingleAgentApplicationService) singleAgentDraftDo2Vo(ctx context.Context, do *entity.SingleAgent) (*bot_common.BotInfo, error) {
	vo := &bot_common.BotInfo{
		BotId:                   do.AgentID,
		Name:                    do.Name,
		Description:             do.Desc,
		IconUri:                 do.IconURI,
		OnboardingInfo:          do.OnboardingInfo,
		ModelInfo:               do.ModelInfo,
		PromptInfo:              do.Prompt,
		PluginInfoList:          do.Plugin,
		Knowledge:               do.Knowledge,
		WorkflowInfoList:        do.Workflow,
		SuggestReplyInfo:        do.SuggestReply,
		CreatorId:               do.CreatorID,
		TaskInfo:                &bot_common.TaskInfo{},
		CreateTime:              do.CreatedAt / 1000,
		UpdateTime:              do.UpdatedAt / 1000,
		BotMode:                 bot_common.BotMode_SingleMode,
		BackgroundImageInfoList: do.BackgroundImageInfoList,
		Status:                  bot_common.BotStatus_Using,
		DatabaseList:            do.Database,
		ShortcutSort:            do.ShortcutCommand,
	}

	if do.VariablesMetaID != nil {
		vars, err := s.appContext.VariablesDomainSVC.GetVariableMetaByID(ctx, *do.VariablesMetaID)
		if err != nil {
			return nil, err
		}

		if vars != nil {
			vo.VariableList = vars.ToAgentVariables()
		}
	}

	if vo.IconUri != "" {
		url, err := s.appContext.TosClient.GetObjectUrl(ctx, vo.IconUri)
		if err != nil {
			return nil, err
		}
		vo.IconUrl = url
	}

	if vo.ModelInfo == nil || vo.ModelInfo.ModelId == nil {
		mi, err := s.defaultModelInfo(ctx)
		if err != nil {
			return nil, err
		}
		vo.ModelInfo = mi
	}

	return vo, nil
}

func disabledParam(schemaVal *openapi3.Schema) bool {
	if len(schemaVal.Extensions) == 0 {
		return false
	}
	globalDisable, localDisable := false, false
	if v, ok := schemaVal.Extensions[consts.APISchemaExtendLocalDisable]; ok {
		localDisable = v.(bool)
	}
	if v, ok := schemaVal.Extensions[consts.APISchemaExtendGlobalDisable]; ok {
		globalDisable = v.(bool)
	}
	return globalDisable || localDisable
}

func (s *SingleAgentApplicationService) UpdateAgentDraftDisplayInfo(ctx context.Context, req *developer_api.UpdateDraftBotDisplayInfoRequest) (*developer_api.UpdateDraftBotDisplayInfoResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	_, err := s.ValidateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	draftInfoDo := &entity.AgentDraftDisplayInfo{
		AgentID:     req.BotID,
		DisplayInfo: req.DisplayInfo,
		SpaceID:     req.SpaceID,
	}

	err = s.DomainSVC.UpdateAgentDraftDisplayInfo(ctx, *uid, draftInfoDo)
	if err != nil {
		return nil, err
	}

	return &developer_api.UpdateDraftBotDisplayInfoResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (s *SingleAgentApplicationService) GetAgentDraftDisplayInfo(ctx context.Context, req *developer_api.GetDraftBotDisplayInfoRequest) (*developer_api.GetDraftBotDisplayInfoResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	_, err := s.ValidateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	draftInfoDo, err := s.DomainSVC.GetAgentDraftDisplayInfo(ctx, *uid, req.BotID)
	if err != nil {
		return nil, err
	}

	return &developer_api.GetDraftBotDisplayInfoResponse{
		Code: 0,
		Msg:  "success",
		Data: draftInfoDo.DisplayInfo,
	}, nil
}

func (s *SingleAgentApplicationService) ValidateAgentDraftAccess(ctx context.Context, agentID int64) (*entity.SingleAgent, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session uid not found"))
	}

	do, err := s.DomainSVC.GetSingleAgentDraft(ctx, agentID)
	if err != nil {
		return nil, err
	}

	if do == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KVf("msg", "No agent draft(%d) found for the given agent ID", agentID))
	}

	if do.CreatorID != *uid {
		logs.CtxErrorf(ctx, "user(%d) is not the creator(%d) of the agent draft", *uid, do.CreatorID)

		return do, errorx.New(errno.ErrPermissionCode, errorx.KV("detail", "you are not the agent owner"))
	}

	return do, nil
}

func (s *SingleAgentApplicationService) ListAgentPublishHistory(ctx context.Context, req *developer_api.ListDraftBotHistoryRequest) (*developer_api.ListDraftBotHistoryResponse, error) {
	resp := &developer_api.ListDraftBotHistoryResponse{}
	draftAgent, err := s.ValidateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	var connectorID *int64
	if req.GetConnectorID() != "" {
		var id int64
		id, err = conv.StrToInt64(req.GetConnectorID())
		if err != nil {
			return nil, errorx.New(errno.ErrInvalidParamCode, errorx.KV("msg", fmt.Sprintf("ConnectorID %v invalidate", *req.ConnectorID)))
		}

		connectorID = ptr.Of(id)
	}

	historyList, err := s.DomainSVC.ListAgentPublishHistory(ctx, draftAgent.AgentID, req.PageIndex, req.PageSize, connectorID)
	if err != nil {
		return nil, err
	}

	uid := ctxutil.MustGetUIDFromCtx(ctx)
	resp.Data = &developer_api.ListDraftBotHistoryData{}

	for _, v := range historyList {
		connectorInfos := make([]*developer_api.ConnectorInfo, 0, len(v.ConnectorIds))
		infos, err := s.appContext.ConnectorDomainSVC.GetByIDs(ctx, v.ConnectorIds)
		if err != nil {
			return nil, err
		}
		for _, info := range infos {
			connectorInfos = append(connectorInfos, info.ToVO())
		}

		creator, err := s.appContext.UserDomainSVC.GetUserProfiles(ctx, v.CreatorID)
		if err != nil {
			return nil, err
		}

		info := ""
		if v.PublishInfo != nil {
			info = *v.PublishInfo
		}

		historyInfo := &developer_api.HistoryInfo{
			HistoryType:    developer_api.HistoryType_FLAG,
			Version:        v.Version,
			Info:           info,
			CreateTime:     conv.Int64ToStr(v.CreatedAt / 1000),
			ConnectorInfos: connectorInfos,
			Creator: &developer_api.Creator{
				ID:        v.CreatorID,
				Name:      creator.Name,
				AvatarURL: creator.IconURL,
				Self:      uid == v.CreatorID,
				// UserUniqueName: creator.UserUniqueName, // TODO(@fanlv) : user domain 补完以后再改
				// UserLabel TODO
			},
			PublishID: &v.PublishID,
		}

		resp.Data.HistoryInfos = append(resp.Data.HistoryInfos, historyInfo)
	}

	return resp, nil
}
