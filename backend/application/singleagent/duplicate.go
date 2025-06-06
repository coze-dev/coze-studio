package singleagent

import (
	"context"
	"strconv"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
	intelligence "code.byted.org/flow/opencoze/backend/api/model/intelligence/common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/api/model/table"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	database "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	searchEntity "code.byted.org/flow/opencoze/backend/domain/search/entity"
	shortcutCMDEntity "code.byted.org/flow/opencoze/backend/domain/shortcutcmd/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type duplicateAgentResourceFn func(ctx context.Context, appContext *ServiceComponents, oldAgent, newAgent *entity.SingleAgent) (*entity.SingleAgent, error)

func (s *SingleAgentApplicationService) DuplicateDraftBot(ctx context.Context, req *developer_api.DuplicateDraftBotRequest) (*developer_api.DuplicateDraftBotResponse, error) {
	draftAgent, err := s.ValidateAgentDraftAccess(ctx, req.BotID)
	if err != nil {
		return nil, err
	}

	newAgentID, err := s.appContext.IDGen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	userID := ctxutil.MustGetUIDFromCtx(ctx)
	duplicateInfo := &entity.DuplicateInfo{
		NewAgentID: newAgentID,
		SpaceID:    req.GetSpaceID(),
		UserID:     userID,
		DraftAgent: draftAgent,
	}

	newAgent, err := s.DomainSVC.DuplicateInMemory(ctx, duplicateInfo)
	if err != nil {
		return nil, err
	}

	duplicateFns := []duplicateAgentResourceFn{
		duplicateVariables,
		duplicatePlugin,
		duplicateShortCommand,
		duplicateDatabase,
	}

	for _, fn := range duplicateFns {
		newAgent, err = fn(ctx, s.appContext, draftAgent, newAgent)
		if err != nil {
			return nil, err
		}
	}

	_, err = s.DomainSVC.CreateSingleAgentDraftWithID(ctx, userID, newAgentID, newAgent)
	if err != nil {
		return nil, err
	}

	userInfo, err := s.appContext.UserDomainSVC.GetUserInfo(ctx, userID)
	if err != nil {
		return nil, err
	}

	err = s.appContext.EventBus.PublishProject(ctx, &searchEntity.ProjectDomainEvent{
		OpType: searchEntity.Created,
		Project: &searchEntity.ProjectDocument{
			Status:  intelligence.IntelligenceStatus_Using,
			Type:    intelligence.IntelligenceType_Bot,
			ID:      newAgent.AgentID,
			SpaceID: &req.SpaceID,
			OwnerID: &userID,
			Name:    &newAgent.Name,
		},
	})
	if err != nil {
		return nil, err
	}

	return &developer_api.DuplicateDraftBotResponse{
		Data: &developer_api.DuplicateDraftBotData{
			BotID: newAgent.AgentID,
			Name:  newAgent.Name,
			UserInfo: &developer_api.Creator{
				ID:             userID,
				Name:           userInfo.Name,
				AvatarURL:      userInfo.IconURL,
				Self:           userID == draftAgent.CreatorID,
				UserUniqueName: userInfo.UniqueName,
				UserLabel:      nil,
			},
		},
		Code: 0,
	}, nil
}

func duplicateVariables(ctx context.Context, appContext *ServiceComponents, oldAgent, newAgent *entity.SingleAgent) (*entity.SingleAgent, error) {
	if oldAgent.VariablesMetaID == nil || *oldAgent.VariablesMetaID <= 0 {
		return newAgent, nil
	}

	vars, err := appContext.VariablesDomainSVC.GetVariableMetaByID(ctx, *oldAgent.VariablesMetaID)
	if err != nil {
		return nil, err
	}

	vars.ID = 0
	vars.BizID = conv.Int64ToStr(newAgent.AgentID)
	vars.BizType = project_memory.VariableConnector_Bot
	vars.Version = ""
	vars.CreatorID = newAgent.CreatorID

	varMetaID, err := appContext.VariablesDomainSVC.UpsertMeta(ctx, vars)
	if err != nil {
		return nil, err
	}

	newAgent.VariablesMetaID = &varMetaID

	return newAgent, nil
}

func duplicatePlugin(ctx context.Context, appContext *ServiceComponents, oldAgent, newAgent *entity.SingleAgent) (*entity.SingleAgent, error) {
	// TODO(mrh): fix me
	//  newAgent.Plugin
	return newAgent, nil
}

func duplicateShortCommand(ctx context.Context, appContext *ServiceComponents, oldAgent, newAgent *entity.SingleAgent) (*entity.SingleAgent, error) {
	metas, err := appContext.ShortcutCMDDomainSVC.ListCMD(ctx, &shortcutCMDEntity.ListMeta{
		SpaceID:  oldAgent.SpaceID,
		ObjectID: oldAgent.AgentID,
		IsOnline: 0,
		CommandIDs: slices.Transform(oldAgent.ShortcutCommand, func(a string) int64 {
			return conv.StrToInt64D(a, 0)
		}),
	})
	if err != nil {
		return nil, err
	}

	shortcutCommandIDs := make([]string, 0, len(metas))
	for _, meta := range metas {
		meta.ObjectID = newAgent.AgentID
		meta.CreatorID = newAgent.CreatorID
		do, err := appContext.ShortcutCMDDomainSVC.CreateCMD(ctx, meta)
		if err != nil {
			return nil, err
		}

		shortcutCommandIDs = append(shortcutCommandIDs, conv.Int64ToStr(do.CommandID))
	}

	newAgent.ShortcutCommand = shortcutCommandIDs

	return newAgent, nil
}

func duplicateDatabase(ctx context.Context, appContext *ServiceComponents, oldAgent, newAgent *entity.SingleAgent) (*entity.SingleAgent, error) {
	databases := oldAgent.Database
	basics := make([]*model.DatabaseBasic, 0, len(databases))
	for _, d := range databases {
		tableID, err := strconv.ParseInt(d.GetTableId(), 10, 64)
		if err != nil {
			return nil, err
		}

		basics = append(basics, &model.DatabaseBasic{
			ID:        tableID,
			TableType: table.TableType_DraftTable,
		})
	}

	res, err := appContext.DatabaseDomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{Basics: basics})
	if err != nil {
		return nil, err
	}

	duplicateDatabases := make([]*bot_common.Database, 0, len(databases))

	for _, srcDB := range res.Databases {
		srcDB.TableName += "_copy"
		srcDB.CreatorID = newAgent.CreatorID
		srcDB.SpaceID = newAgent.SpaceID
		createDatabaseResp, err := appContext.DatabaseDomainSVC.CreateDatabase(ctx, &database.CreateDatabaseRequest{
			Database: srcDB,
		})
		if err != nil {
			return nil, err
		}

		draftResp, err := appContext.DatabaseDomainSVC.GetDraftDatabaseByOnlineID(ctx, &database.GetDraftDatabaseByOnlineIDRequest{
			OnlineID: createDatabaseResp.Database.ID,
		})
		if err != nil {
			return nil, err
		}

		draft := draftResp.Database
		fields := make([]*bot_common.FieldItem, 0, len(draft.FieldList))
		for _, field := range draft.FieldList {
			fields = append(fields, &bot_common.FieldItem{
				Name:         ptr.Of(field.Name),
				Desc:         ptr.Of(field.Desc),
				Type:         ptr.Of(bot_common.FieldItemType(field.Type)),
				MustRequired: ptr.Of(field.MustRequired),
				AlterId:      ptr.Of(field.AlterID),
				Id:           ptr.Of(int64(0)),
			})
		}

		duplicateDatabases = append(duplicateDatabases, &bot_common.Database{
			TableId:   ptr.Of(strconv.FormatInt(draft.ID, 10)),
			TableName: ptr.Of(draft.TableName),
			TableDesc: ptr.Of(draft.TableDesc),
			FieldList: fields,
			RWMode:    ptr.Of(bot_common.BotTableRWMode(draft.RwMode)),
		})
	}

	newAgent.Database = duplicateDatabases
	return newAgent, nil
}
