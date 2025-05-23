package singleagent

import (
	"context"
	"fmt"
	"math/rand"
	"strconv"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/agentflow"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/repository"
	"code.byted.org/flow/opencoze/backend/domain/plugin/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/jsoner"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type singleAgentImpl struct {
	Components
}

type Components struct {
	PluginSvr    crossdomain.PluginService
	KnowledgeSvr crossdomain.Knowledge
	WorkflowSvr  crossdomain.Workflow
	ModelMgrSvr  crossdomain.ModelMgr
	ModelFactory chatmodel.Factory
	DatabaseSvr  crossdomain.Database
	Connector    crossdomain.Connector

	AgentDraftRepo   repository.SingleAgentDraftRepo
	AgentVersionRepo repository.SingleAgentVersionRepo
	PublishInfoRepo  *jsoner.Jsoner[entity.PublishInfo]
}

func NewService(c *Components) SingleAgent {
	s := &singleAgentImpl{
		Components: *c,
	}

	return s
}

func (s *singleAgentImpl) DeleteAgentDraft(ctx context.Context, spaceID, agentID int64) (err error) {
	return s.AgentDraftRepo.Delete(ctx, spaceID, agentID)
}

func (s *singleAgentImpl) Duplicate(ctx context.Context, req *entity.DuplicateAgentRequest) (draft *entity.SingleAgent, err error) {
	srcAgents, err := s.MGetSingleAgentDraft(ctx, []int64{req.AgentID})
	if err != nil {
		return nil, err
	}

	if len(srcAgents) == 0 {
		return nil, errorx.New(errno.ErrResourceNotFound,
			errorx.KV("type", "agent"), errorx.KV("id", strconv.FormatInt(req.AgentID, 10)))
	}

	srcAgent := srcAgents[0]

	copySuffixNum := rand.Intn(1000)
	srcAgent.Name = fmt.Sprintf("%v%03d", srcAgent.Name, copySuffixNum)
	srcAgent.SpaceID = req.SpaceID
	srcAgent.CreatorID = req.UserID

	agentID, err := s.CreateSingleAgentDraft(ctx, req.UserID, srcAgent)
	if err != nil {
		return nil, err
	}

	srcAgent.AgentID = agentID

	return srcAgent, nil
}

func (s *singleAgentImpl) MGetSingleAgentDraft(ctx context.Context, agentIDs []int64) (agents []*entity.SingleAgent, err error) {
	return s.AgentDraftRepo.MGet(ctx, agentIDs)
}

func (s *singleAgentImpl) StreamExecute(ctx context.Context, req *entity.ExecuteRequest) (events *schema.StreamReader[*entity.AgentEvent], err error) {
	ae, err := s.ObtainAgentByIdentity(ctx, req.Identity)
	if err != nil {
		return nil, err
	}

	conf := &agentflow.Config{
		Agent:        ae,
		ConnectorID:  req.Identity.ConnectorID,
		IsDraft:      req.Identity.IsDraft,
		PluginSvr:    s.PluginSvr,
		KnowledgeSvr: s.KnowledgeSvr,
		WorkflowSvr:  s.WorkflowSvr,
		ModelMgrSvr:  s.ModelMgrSvr,
		ModelFactory: s.ModelFactory,
		DatabaseSvr:  s.DatabaseSvr,
	}
	rn, err := agentflow.BuildAgent(ctx, conf)
	if err != nil {
		return nil, err
	}

	exeReq := &agentflow.AgentRequest{
		Input:   req.Input,
		History: req.History,
	}
	return rn.StreamExecute(ctx, exeReq)
}

func (s *singleAgentImpl) GetSingleAgent(ctx context.Context, agentID int64, version string) (botInfo *entity.SingleAgent, err error) {
	if len(version) == 0 {
		return s.GetSingleAgentDraft(ctx, agentID)
	}

	agentInfo, err := s.AgentVersionRepo.Get(ctx, agentID, version)
	if err != nil {
		return nil, err
	}

	return agentInfo, nil
}

func (s *singleAgentImpl) UpdateSingleAgentDraft(ctx context.Context, agentInfo *entity.SingleAgent) (err error) {
	if agentInfo.Plugin != nil {
		toolIDs := slices.Transform(agentInfo.Plugin, func(item *bot_common.PluginInfo) int64 {
			return item.GetApiId()
		})
		err = s.PluginSvr.BindAgentTools(ctx, &service.BindAgentToolsRequest{
			SpaceID: agentInfo.SpaceID,
			AgentID: agentInfo.AgentID,
			ToolIDs: toolIDs,
		})
		if err != nil {
			return fmt.Errorf("bind agent tools failed, err=%v", err)
		}
	}

	return s.AgentDraftRepo.Update(ctx, agentInfo)
}

func (s *singleAgentImpl) CreateSingleAgentDraft(ctx context.Context, creatorID int64, draft *entity.SingleAgent) (agentID int64, err error) {
	return s.AgentDraftRepo.Create(ctx, creatorID, draft)
}

func (s *singleAgentImpl) GetSingleAgentDraft(ctx context.Context, agentID int64) (*entity.SingleAgent, error) {
	return s.AgentDraftRepo.Get(ctx, agentID)
}

func (s *singleAgentImpl) ObtainAgentByIdentity(ctx context.Context, identity *entity.AgentIdentity) (*entity.SingleAgent, error) {
	if identity.IsDraft {
		return s.GetSingleAgentDraft(ctx, identity.AgentID)
	}

	agentID := identity.AgentID
	connectorID := identity.ConnectorID
	version := identity.Version

	if connectorID == 0 {
		return s.GetSingleAgent(ctx, identity.AgentID, identity.Version)
	}

	if version == "" {
		singleAgentPublish, err := s.ListAgentPublishHistory(ctx, agentID, 1, 1, &connectorID)
		if err != nil {
			return nil, err
		}
		if len(singleAgentPublish) == 0 {
			return nil, errorx.New(errno.ErrAgentInvalidParamCode,
				errorx.KVf("msg", "agent not published, agentID=%d connectorID=%d", agentID, connectorID))
		}

		version = singleAgentPublish[0].Version
	}

	return s.AgentVersionRepo.Get(ctx, agentID, version)
}

func (s *singleAgentImpl) UpdateAgentDraftDisplayInfo(ctx context.Context, userID int64, e *entity.AgentDraftDisplayInfo) error {
	do, err := s.AgentDraftRepo.GetDisplayInfo(ctx, userID, e.AgentID)
	if err != nil {
		return err
	}

	do.SpaceID = e.SpaceID
	if e.DisplayInfo != nil && e.DisplayInfo.TabDisplayInfo != nil {
		if e.DisplayInfo.TabDisplayInfo.PluginTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.PluginTabStatus = e.DisplayInfo.TabDisplayInfo.PluginTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.WorkflowTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.WorkflowTabStatus = e.DisplayInfo.TabDisplayInfo.WorkflowTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.KnowledgeTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.KnowledgeTabStatus = e.DisplayInfo.TabDisplayInfo.KnowledgeTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.DatabaseTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.DatabaseTabStatus = e.DisplayInfo.TabDisplayInfo.DatabaseTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.VariableTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.VariableTabStatus = e.DisplayInfo.TabDisplayInfo.VariableTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.OpeningDialogTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.OpeningDialogTabStatus = e.DisplayInfo.TabDisplayInfo.OpeningDialogTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.ScheduledTaskTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.ScheduledTaskTabStatus = e.DisplayInfo.TabDisplayInfo.ScheduledTaskTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.SuggestionTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.SuggestionTabStatus = e.DisplayInfo.TabDisplayInfo.SuggestionTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.TtsTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.TtsTabStatus = e.DisplayInfo.TabDisplayInfo.TtsTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.FileboxTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.FileboxTabStatus = e.DisplayInfo.TabDisplayInfo.FileboxTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.LongTermMemoryTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.LongTermMemoryTabStatus = e.DisplayInfo.TabDisplayInfo.LongTermMemoryTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.AnswerActionTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.AnswerActionTabStatus = e.DisplayInfo.TabDisplayInfo.AnswerActionTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.ImageflowTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.ImageflowTabStatus = e.DisplayInfo.TabDisplayInfo.ImageflowTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.BackgroundImageTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.BackgroundImageTabStatus = e.DisplayInfo.TabDisplayInfo.BackgroundImageTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.ShortcutTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.ShortcutTabStatus = e.DisplayInfo.TabDisplayInfo.ShortcutTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.KnowledgeTableTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.KnowledgeTableTabStatus = e.DisplayInfo.TabDisplayInfo.KnowledgeTableTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.KnowledgeTextTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.KnowledgeTextTabStatus = e.DisplayInfo.TabDisplayInfo.KnowledgeTextTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.KnowledgePhotoTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.KnowledgePhotoTabStatus = e.DisplayInfo.TabDisplayInfo.KnowledgePhotoTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.HookInfoTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.HookInfoTabStatus = e.DisplayInfo.TabDisplayInfo.HookInfoTabStatus
		}
		if e.DisplayInfo.TabDisplayInfo.DefaultUserInputTabStatus != nil {
			do.DisplayInfo.TabDisplayInfo.DefaultUserInputTabStatus = e.DisplayInfo.TabDisplayInfo.DefaultUserInputTabStatus
		}
	}

	return s.AgentDraftRepo.UpdateDisplayInfo(ctx, userID, do)
}

func (s *singleAgentImpl) GetAgentDraftDisplayInfo(ctx context.Context, userID, agentID int64) (*entity.AgentDraftDisplayInfo, error) {
	return s.AgentDraftRepo.GetDisplayInfo(ctx, userID, agentID)
}

func (s *singleAgentImpl) ListAgentPublishHistory(ctx context.Context, agentID int64, pageIndex, pageSize int32, connectorID *int64) ([]*entity.SingleAgentPublish, error) {
	if connectorID == nil {
		return s.AgentVersionRepo.List(ctx, agentID, pageIndex, pageSize)
	}

	logs.CtxInfof(ctx, "ListAgentPublishHistory, agentID=%v, pageIndex=%v, pageSize=%v, connectorID=%v",
		agentID, pageIndex, pageSize, *connectorID)

	var (
		allResults  []*entity.SingleAgentPublish
		currentPage int32 = 1
		maxCount          = pageSize * pageIndex
	)

	// 全量拉取符合条件的记录
	for {
		pageData, err := s.AgentVersionRepo.List(ctx, agentID, currentPage, 50)
		if err != nil {
			return nil, err
		}
		if len(pageData) == 0 {
			break
		}

		// 过滤当前页数据
		for _, item := range pageData {
			for _, cID := range item.ConnectorIds {
				if cID == *connectorID {
					allResults = append(allResults, item)
					break
				}
			}
		}

		if len(allResults) > int(maxCount) {
			break
		}

		currentPage++
	}

	start := (pageIndex - 1) * pageSize
	if start >= int32(len(allResults)) {
		return []*entity.SingleAgentPublish{}, nil
	}

	end := start + pageSize
	if end > int32(len(allResults)) {
		end = int32(len(allResults))
	}

	return allResults[start:end], nil
}
