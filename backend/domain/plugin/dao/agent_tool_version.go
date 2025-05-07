package dao

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type AgentToolVersionDAO interface {
	Get(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error)
	MGet(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error)

	BatchCreate(ctx context.Context, agentID int64, tools []*entity.ToolInfo) (toolVersions map[int64]int64, err error)
}

var (
	agentToolVersionOnce      sync.Once
	singletonAgentToolVersion *agentToolVersionImpl
)

func NewAgentToolVersionDAO(db *gorm.DB, idGen idgen.IDGenerator) AgentToolVersionDAO {
	agentToolVersionOnce.Do(func() {
		singletonAgentToolVersion = &agentToolVersionImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonAgentToolVersion
}

type agentToolVersionImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func (at *agentToolVersionImpl) Get(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error) {
	table := at.query.AgentToolVersion

	conds := []gen.Condition{
		table.AgentID.Eq(agentID),
		table.ToolID.Eq(vAgentTool.ToolID),
	}
	var tl *model.AgentToolVersion
	if vAgentTool.VersionMs == nil || *vAgentTool.VersionMs <= 0 {
		tl, err = table.WithContext(ctx).
			Where(conds...).
			Order(table.VersionMs.Desc()).
			First()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, false, nil
			}
			return nil, false, err
		}
	} else {
		conds = append(conds, table.VersionMs.Eq(*vAgentTool.VersionMs))
		tl, err = table.WithContext(ctx).
			Where(conds...).
			First()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, false, nil
			}
			return nil, false, err
		}
	}

	tool = model.AgentToolVersionToDO(tl)

	return tool, true, nil
}

func (at *agentToolVersionImpl) MGet(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(vAgentTools))

	table := at.query.AgentToolVersion
	chunks := slices.Chunks(vAgentTools, 20)
	noVersion := make([]entity.VersionAgentTool, 0, len(vAgentTools))

	for _, chunk := range chunks {
		orConds := make([]gen.Condition, 0, len(chunk))
		for _, v := range chunk {
			if v.VersionMs == nil || *v.VersionMs == 0 {
				noVersion = append(noVersion, v)
				continue
			}
			orConds = append(orConds, table.Where(
				table.ToolID.Eq(v.ToolID),
				table.VersionMs.Eq(*v.VersionMs)),
			)
		}

		conds := append([]gen.Condition{table.AgentID.Eq(agentID)}, table.Or(orConds...))
		tls, err := table.WithContext(ctx).Where(conds...).Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, model.AgentToolVersionToDO(tl))
		}
	}

	for _, v := range noVersion {
		tool, exist, err := at.Get(ctx, agentID, v)
		if err != nil {
			return nil, err
		}
		if !exist {
			continue
		}
		tools = append(tools, tool)
	}

	return tools, nil
}

func (at *agentToolVersionImpl) BatchCreate(ctx context.Context, agentID int64,
	tools []*entity.ToolInfo) (toolVersions map[int64]int64, err error) {

	tls := make([]*model.AgentToolVersion, 0, len(tools))
	now := time.Now().UnixMilli()
	for _, tool := range tools {
		if tool.Version == nil || *tool.Version == "" {
			return nil, fmt.Errorf("invalid tool version")
		}

		id, err := at.IDGen.GenID(ctx)
		if err != nil {
			return nil, err
		}

		tls = append(tls, &model.AgentToolVersion{
			ID:          id,
			AgentID:     agentID,
			ToolID:      tool.ID,
			VersionMs:   now,
			ToolVersion: *tool.Version,
			SubURL:      tool.GetSubURL(),
			Method:      tool.GetMethod(),
			Operation:   tool.Operation,
		})
	}

	table := at.query.AgentToolVersion
	err = table.WithContext(ctx).CreateInBatches(tls, 10)
	if err != nil {
		return nil, err
	}

	toolVersions = make(map[int64]int64, len(tools))
	for _, tl := range tls {
		toolVersions[tl.ToolID] = tl.VersionMs
	}

	return toolVersions, nil
}
