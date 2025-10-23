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
	"sync"
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/api/model/app/intelligence/common"
	"github.com/coze-dev/coze-studio/backend/api/model/playground"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	search "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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
			return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("msg", fmt.Sprintf("connector %d not allowed", id)))
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
		publishShortcutCommand,
		publishDatabase,
	}

	for _, pubFn := range publishFns {
		draftAgent, err = pubFn(ctx, s.appContext, p, draftAgent)
		if err != nil {
			return nil, err
		}
	}

	err = s.DomainSVC.SavePublishRecord(ctx, p, draftAgent)
	if err != nil {
		return nil, err
	}

	tasks := taskgroup.NewUninterruptibleTaskGroup(ctx, len(connectorIDs))
	publishResult := make(map[string]*developer_api.ConnectorBindResult, len(connectorIDs))
	lock := sync.Mutex{}

	for _, connectorID := range connectorIDs {
		tasks.Go(func() error {
			_, err = s.DomainSVC.CreateSingleAgent(ctx, connectorID, version, draftAgent)
			if err != nil {
				logs.CtxWarnf(ctx, "create single agent failed: %v, agentID: %d, connectorID: %d , version : %s", err, draftAgent.AgentID, connectorID, version)
				lock.Lock()
				publishResult[conv.Int64ToStr(connectorID)] = &developer_api.ConnectorBindResult{
					PublishResultStatus: ptr.Of(developer_api.PublishResultStatus_Failed),
				}
				lock.Unlock()
				return err
			}

			// do other connector publish logic if need

			lock.Lock()
			publishResult[conv.Int64ToStr(connectorID)] = &developer_api.ConnectorBindResult{
				PublishResultStatus: ptr.Of(developer_api.PublishResultStatus_Success),
			}
			lock.Unlock()
			return nil
		})
	}

	_ = tasks.Wait()

	err = s.appContext.EventBus.PublishProject(ctx, &search.ProjectDomainEvent{
		OpType: search.Updated,
		Project: &search.ProjectDocument{
			ID:            draftAgent.AgentID,
			HasPublished:  ptr.Of(1),
			PublishTimeMS: ptr.Of(time.Now().UnixMilli()),
			Type:          common.IntelligenceType_Bot,
		},
	})
	if err != nil {
		logs.CtxWarnf(ctx, "publish project event failed, agentID: %d, err : %v", draftAgent.AgentID, err)
	}

	return &developer_api.PublishDraftBotResponse{
		Data: &developer_api.PublishDraftBotData{
			CheckNotPass:  false,
			PublishResult: publishResult,
		},
	}, nil
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
	if draftAgent.VariablesMetaID == nil || *draftAgent.VariablesMetaID == 0 {
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
	err := appContext.PluginDomainSVC.PublishAgentTools(ctx, agent.AgentID, publishInfo.Version)
	if err != nil {
		return nil, err
	}

	return agent, nil
}

func publishShortcutCommand(ctx context.Context, appContext *ServiceComponents, publishInfo *entity.SingleAgentPublish, agent *entity.SingleAgent) (*entity.SingleAgent, error) {
	logs.CtxInfof(ctx, "publishShortcutCommand agentID: %d, shortcutCommand: %v", agent.AgentID, agent.ShortcutCommand)
	if len(agent.ShortcutCommand) == 0 {
		return agent, nil
	}
	cmdIDs := slices.Transform(agent.ShortcutCommand, func(a string) int64 {
		return conv.StrToInt64D(a, 0)
	})
	err := appContext.ShortcutCMDDomainSVC.PublishCMDs(ctx, agent.AgentID, cmdIDs)
	if err != nil {
		return nil, err
	}

	return agent, nil
}

func publishDatabase(ctx context.Context, appContext *ServiceComponents, publishInfo *entity.SingleAgentPublish, agent *entity.SingleAgent) (*entity.SingleAgent, error) {
	onlineResp, err := appContext.DatabaseDomainSVC.PublishDatabase(ctx, &database.PublishDatabaseRequest{AgentID: agent.AgentID})
	if err != nil {
		return nil, err
	}

	agent.Database = onlineResp.OnlineDatabases
	return agent, nil
}
