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
	"fmt"
	"strconv"
	"time"

	"github.com/bytedance/sonic"
	"github.com/getkin/kin-openapi/openapi3"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_open_api"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	intelligence "github.com/coze-dev/coze-studio/backend/api/model/app/intelligence/common"
	"github.com/coze-dev/coze-studio/backend/api/model/data/database/table"
	"github.com/coze-dev/coze-studio/backend/api/model/playground"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/crossdomain/agent"
	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/database"
	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	pluginConsts "github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	singleagent "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/service"
	variableEntity "github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	shortcutEntity "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	shortcutCmd "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/service"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type SingleAgentApplicationService struct {
	appContext     *ServiceComponents
	DomainSVC      singleagent.SingleAgent
	ShortcutCmdSvc shortcutCmd.ShortcutCmd
}

func newApplicationService(s *ServiceComponents, domain singleagent.SingleAgent) *SingleAgentApplicationService {
	return &SingleAgentApplicationService{
		appContext:     s,
		DomainSVC:      domain,
		ShortcutCmdSvc: s.ShortcutCMDDomainSVC,
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
			return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("msg", "onboarding_info invalidate"))
		}

		if len(infoStr) > onboardingInfoMaxLength {
			return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("msg", "onboarding_info is too long"))
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
		return nil, fmt.Errorf("agent %d has no database", agentID)
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
		return nil, fmt.Errorf("database %d not found in agent %d", req.GetDatabaseID(), agentID)
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

func (s *SingleAgentApplicationService) UnBindDatabase(ctx context.Context, req *table.BindDatabaseToBotRequest) (*table.BindDatabaseToBotResponse, error) {
	agentID := req.GetBotID()
	draft, err := s.ValidateAgentDraftAccess(ctx, agentID)
	if err != nil {
		return nil, err
	}

	if len(draft.Database) == 0 {
		return nil, fmt.Errorf("agent %d has no database", agentID)
	}

	dbInfos := draft.Database
	var found bool
	newDBInfos := make([]*bot_common.Database, 0)
	for _, db := range dbInfos {
		if db.GetTableId() == conv.Int64ToStr(req.GetDatabaseID()) {
			found = true
			continue
		}
		newDBInfos = append(newDBInfos, db)
	}

	if !found {
		return nil, fmt.Errorf("database %d not found in agent %d", req.GetDatabaseID(), agentID)
	}

	draft.Database = newDBInfos
	err = s.DomainSVC.UpdateSingleAgentDraft(ctx, draft)
	if err != nil {
		return nil, err
	}

	err = crossdatabase.DefaultSVC().UnBindDatabase(ctx, &database.UnBindDatabaseToAgentRequest{
		AgentID:         agentID,
		DraftDatabaseID: req.GetDatabaseID(),
	})
	if err != nil {
		return nil, err
	}

	return &table.BindDatabaseToBotResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (s *SingleAgentApplicationService) BindDatabase(ctx context.Context, req *table.BindDatabaseToBotRequest) (*table.BindDatabaseToBotResponse, error) {
	agentID := req.GetBotID()
	draft, err := s.ValidateAgentDraftAccess(ctx, agentID)
	if err != nil {
		return nil, err
	}

	dbMap := slices.ToMap(draft.Database, func(d *bot_common.Database) (string, *bot_common.Database) {
		return d.GetTableId(), d
	})
	if _, ok := dbMap[conv.Int64ToStr(req.GetDatabaseID())]; ok {
		return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KVf("msg", "database %d already bound to agent %d", req.GetDatabaseID(), agentID))
	}

	basics := []*database.DatabaseBasic{
		{
			ID:        req.DatabaseID,
			TableType: table.TableType_DraftTable,
		},
	}

	draftRes, err := crossdatabase.DefaultSVC().MGetDatabase(ctx, &database.MGetDatabaseRequest{
		Basics: basics,
	})
	if err != nil {
		return nil, err
	}
	if len(draftRes.Databases) == 0 {
		return nil, fmt.Errorf("database %d not found", req.DatabaseID)
	}

	draftDatabase := draftRes.Databases[0]

	fields := make([]*bot_common.FieldItem, 0, len(draftDatabase.FieldList))
	for _, field := range draftDatabase.FieldList {
		fields = append(fields, &bot_common.FieldItem{
			Name:         ptr.Of(field.Name),
			Desc:         ptr.Of(field.Desc),
			Type:         ptr.Of(bot_common.FieldItemType(field.Type)),
			MustRequired: ptr.Of(field.MustRequired),
			AlterId:      ptr.Of(field.AlterID),
			Id:           ptr.Of(int64(0)),
		})
	}

	bindDB := &bot_common.Database{
		TableId:   ptr.Of(strconv.FormatInt(draftDatabase.ID, 10)),
		TableName: ptr.Of(draftDatabase.TableName),
		TableDesc: ptr.Of(draftDatabase.TableDesc),
		FieldList: fields,
		RWMode:    ptr.Of(bot_common.BotTableRWMode(draftDatabase.RwMode)),
	}

	if len(draft.Database) == 0 {
		draft.Database = make([]*bot_common.Database, 0, 1)
	}
	draft.Database = append(draft.Database, bindDB)

	err = s.DomainSVC.UpdateSingleAgentDraft(ctx, draft)
	if err != nil {
		return nil, err
	}

	err = crossdatabase.DefaultSVC().BindDatabase(ctx, &database.BindDatabaseToAgentRequest{
		AgentID:         agentID,
		DraftDatabaseID: req.GetDatabaseID(),
	})
	if err != nil {
		return nil, err
	}

	return &table.BindDatabaseToBotResponse{
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

	if patch.ModelInfo != nil && patch.ModelInfo.ModelId != nil {
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

	if len(patch.Agents) > 0 && patch.Agents[0].JumpConfig != nil {
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
	if patch.BotMode != nil {
		target.BotMode = ptr.From(patch.BotMode)
	}
	if patch.LayoutInfo != nil {
		target.LayoutInfo = patch.LayoutInfo
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
		BotMode:                 do.BotMode,
		BackgroundImageInfoList: do.BackgroundImageInfoList,
		Status:                  bot_common.BotStatus_Using,
		DatabaseList:            do.Database,
		ShortcutSort:            do.ShortcutCommand,
		LayoutInfo:              do.LayoutInfo,
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
	if v, ok := schemaVal.Extensions[pluginConsts.APISchemaExtendLocalDisable]; ok {
		localDisable = v.(bool)
	}
	if v, ok := schemaVal.Extensions[pluginConsts.APISchemaExtendGlobalDisable]; ok {
		globalDisable = v.(bool)
	}
	return globalDisable || localDisable
}

func (s *SingleAgentApplicationService) UpdateAgentDraftDisplayInfo(ctx context.Context, req *developer_api.UpdateDraftBotDisplayInfoRequest) (*developer_api.UpdateDraftBotDisplayInfoResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("msg", "session required"))
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
		return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("msg", "session required"))
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
		return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("msg", "session uid not found"))
	}

	do, err := s.DomainSVC.GetSingleAgentDraft(ctx, agentID)
	if err != nil {
		return nil, err
	}

	if do == nil {
		return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KVf("msg", "No agent draft(%d) found for the given agent ID", agentID))
	}

	if do.SpaceID == consts.TemplateSpaceID { // duplicate template, not need check uid permission
		return do, nil
	}

	if do.CreatorID != *uid {
		logs.CtxErrorf(ctx, "user(%d) is not the creator(%d) of the agent draft", *uid, do.CreatorID)

		return do, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("detail", "you are not the agent owner"))
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
			return nil, errorx.New(errno.ErrAgentInvalidParamCode, errorx.KV("msg", fmt.Sprintf("ConnectorID %v invalidate", *req.ConnectorID)))
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
				// UserUniqueName: creator. UserUniqueName,
				// UserLabel TODO
			},
			PublishID: &v.PublishID,
		}

		resp.Data.HistoryInfos = append(resp.Data.HistoryInfos, historyInfo)
	}

	return resp, nil
}

func (s *SingleAgentApplicationService) ReportUserBehavior(ctx context.Context, req *playground.ReportUserBehaviorRequest) (resp *playground.ReportUserBehaviorResponse, err error) {
	err = s.appContext.EventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Updated,
		Project: &searchEntity.ProjectDocument{
			ID:             req.ResourceID,
			SpaceID:        req.SpaceID,
			Type:           intelligence.IntelligenceType_Bot,
			IsRecentlyOpen: ptr.Of(1),
			RecentlyOpenMS: ptr.Of(time.Now().UnixMilli()),
		},
	})
	if err != nil {
		logs.CtxWarnf(ctx, "publish updated project event failed id=%v, err=%v", req.ResourceID, err)
	}

	return &playground.ReportUserBehaviorResponse{}, nil
}

func (s *SingleAgentApplicationService) GetAgentOnlineInfo(ctx context.Context, req *bot_open_api.GetBotOnlineInfoReq) (*bot_common.OpenAPIBotInfo, error) {

	uid := ctxutil.MustGetUIDFromApiAuthCtx(ctx)

	connectorID, err := conv.StrToInt64(ptr.From(req.ConnectorID))
	if err != nil {
		return nil, err
	}
	if connectorID == 0 {
		connectorID = ctxutil.GetApiAuthFromCtx(ctx).ConnectorID
	}

	return s.getAgentInfo(ctx, req.BotID, connectorID, uid, req.Version)
}

func (s *SingleAgentApplicationService) getAgentInfo(ctx context.Context, botID int64, connectorID int64, uid int64, version *string) (*bot_common.OpenAPIBotInfo, error) {
	ae := &entity.AgentIdentity{
		AgentID:     botID,
		ConnectorID: connectorID,
	}
	if version != nil {
		ae.Version = ptr.From(version)
	}
	agentInfo, err := s.DomainSVC.ObtainAgentByIdentity(ctx, ae)
	if err != nil {
		return nil, err
	}
	if agentInfo == nil {
		logs.CtxErrorf(ctx, "agent(%d) is not exist", botID)
		return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("msg", "agent not exist"))
	}
	if agentInfo.CreatorID != uid {
		return nil, errorx.New(errno.ErrPromptPermissionCode, errorx.KV("msg", "agent not own"))
	}
	combineInfo := &bot_common.OpenAPIBotInfo{
		BotID:            agentInfo.AgentID,
		Name:             agentInfo.Name,
		Description:      agentInfo.Desc,
		IconURL:          agentInfo.IconURI,
		Version:          agentInfo.Version,
		BotMode:          bot_common.BotMode_SingleMode,
		PromptInfo:       agentInfo.Prompt,
		OnboardingInfo:   agentInfo.OnboardingInfo,
		ModelInfo:        agentInfo.ModelInfo,
		WorkflowInfoList: agentInfo.Workflow,
		PluginInfoList:   agentInfo.Plugin,
	}

	if agentInfo.IconURI != "" {
		url, err := s.appContext.TosClient.GetObjectUrl(ctx, agentInfo.IconURI)
		if err != nil {
			return nil, err
		}
		combineInfo.IconURL = url
	}

	if len(agentInfo.ShortcutCommand) > 0 {
		shortcutInfos, err := s.ShortcutCmdSvc.ListCMD(ctx, &shortcutEntity.ListMeta{
			ObjectID: agentInfo.AgentID,
			IsOnline: 1,
			CommandIDs: slices.Transform(agentInfo.ShortcutCommand, func(s string) int64 {
				i, _ := conv.StrToInt64(s)
				return i
			}),
		})
		if err != nil {
			return nil, err
		}
		combineInfo.ShortcutCommands = make([]*bot_common.ShortcutCommandInfo, 0, len(shortcutInfos))
		combineInfo.ShortcutCommands = slices.Transform(shortcutInfos, func(si *shortcutEntity.ShortcutCmd) *bot_common.ShortcutCommandInfo {
			url := ""
			if si.ShortcutIcon != nil && si.ShortcutIcon.URI != "" {
				getUrl, e := s.appContext.TosClient.GetObjectUrl(ctx, si.ShortcutIcon.URI)
				if e == nil {
					url = getUrl
				}
			}

			return &bot_common.ShortcutCommandInfo{
				ID:            si.CommandID,
				Name:          si.CommandName,
				Description:   si.Description,
				IconURL:       url,
				QueryTemplate: si.TemplateQuery,
				AgentID:       ptr.Of(si.ObjectID),
				Command:       si.ShortcutCommand,
				Components: slices.Transform(si.Components, func(i *playground.Components) *bot_common.ShortcutCommandComponent {
					sc := &bot_common.ShortcutCommandComponent{
						Name:          i.Name,
						Description:   i.Description,
						Type:          getShortcutCommandComponentType(i.InputType),
						ToolParameter: ptr.Of(i.Parameter),
						IsHide:        i.Hide,
					}
					if i.DefaultValue != nil {
						sc.DefaultValue = ptr.Of(i.DefaultValue.Value)
					}

					switch i.InputType {
					case playground.InputType_Select:
						sc.Options = i.Options
					case playground.InputType_MixUpload:
						options := make([]string, 0, len(i.UploadOptions))
						for _, uploadOption := range i.UploadOptions {
							options = append(options, string(getShortcutCommandComponentFileType(uploadOption)))
						}
						sc.Options = options
					case playground.InputType_UploadImage, playground.InputType_UploadDoc, playground.InputType_UploadTable, playground.InputType_UploadAudio,
						playground.InputType_VIDEO, playground.InputType_ARCHIVE, playground.InputType_CODE, playground.InputType_TXT,
						playground.InputType_PPT:
						sc.Options = []string{string(getShortcutCommandComponentFileType(i.InputType))}
					default:
					}

					return sc
				}),
				Tool: &bot_common.ShortcutCommandToolInfo{
					Name: si.ToolInfo.ToolName,
					Type: func() string {
						if si.ToolType == 1 {
							return string(agent.ShortcutCommandToolTypePlugin)
						}
						if si.ToolType == 2 {
							return string(agent.ShortcutCommandToolTypeWorkflow)
						}
						return ""
					}(),
					PluginID:      ptr.Of(si.PluginID),
					WorkflowID:    ptr.Of(si.WorkFlowID),
					PluginAPIName: &si.PluginToolName,
					Params: slices.Transform(si.ToolInfo.ToolParamsList, func(i *playground.ToolParams) *bot_common.ShortcutToolParam {
						return &bot_common.ShortcutToolParam{
							Name:             i.Name,
							Type:             i.Type,
							DefaultValue:     i.DefaultValue,
							IsReferComponent: i.ReferComponent,
							IsRequired:       i.Required,
							Description:      i.Desc,
						}
					}),
				},
				SendType: func() *bot_common.ShortcutSendType {
					if si.SendType == 1 {
						return ptr.Of(bot_common.ShortcutSendTypePanel)
					}
					return ptr.Of(bot_common.ShortcutSendTypeQuery)
				}(),
				CardSchema: ptr.Of(si.CardSchema),
			}
		})

	}
	return combineInfo, nil
}

func (s *SingleAgentApplicationService) OpenGetBotInfo(ctx context.Context, req *bot_open_api.OpenGetBotInfoRequest) (*bot_open_api.OpenGetBotInfoResponse, error) {
	resp := new(bot_open_api.OpenGetBotInfoResponse)

	uid := ctxutil.MustGetUIDFromApiAuthCtx(ctx)

	connectorID := ptr.From(req.ConnectorID)

	if connectorID == 0 {
		connectorID = ctxutil.GetApiAuthFromCtx(ctx).ConnectorID
	}
	agentInfo, err := s.getAgentInfo(ctx, req.BotID, connectorID, uid, nil)
	if err != nil {
		return nil, err
	}
	resp.Data = agentInfo
	return resp, nil
}

func getShortcutCommandComponentType(inputType playground.InputType) string {
	componentType := agent.ShortcutCommandComponentTypeMapping[inputType]
	return string(componentType)
}

func getShortcutCommandComponentFileType(inputType playground.InputType) string {
	return string(agent.ShortcutCommandComponentFileTypeMapping[inputType])
}
