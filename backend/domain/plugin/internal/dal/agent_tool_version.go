package dal

import (
	"context"
	"errors"
	"fmt"
	"time"

	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func NewAgentToolVersionDAO(db *gorm.DB, idGen idgen.IDGenerator) *AgentToolVersionDAO {
	return &AgentToolVersionDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type AgentToolVersionDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

func (at *AgentToolVersionDAO) Get(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error) {
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

func (at *AgentToolVersionDAO) MGet(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(vAgentTools))

	table := at.query.AgentToolVersion
	chunks := slices.Chunks(vAgentTools, 20)
	noVersion := make([]entity.VersionAgentTool, 0, len(vAgentTools))

	for _, chunk := range chunks {
		var q query.IAgentToolVersionDo
		for _, v := range chunk {
			if v.VersionMs == nil || *v.VersionMs == 0 {
				noVersion = append(noVersion, v)
				continue
			}
			if q == nil {
				q = table.WithContext(ctx).
					Where(
						table.Where(
							table.ToolID.Eq(chunk[0].ToolID),
							table.VersionMs.Eq(*chunk[0].VersionMs),
						),
					)
			} else {
				q = q.Or(
					table.ToolID.Eq(v.ToolID),
					table.VersionMs.Eq(*v.VersionMs),
				)
			}
		}

		if q == nil {
			continue
		}

		tls, err := q.Find()
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

func (at *AgentToolVersionDAO) BatchCreate(ctx context.Context, agentID int64,
	tools []*entity.ToolInfo) (toolVersions map[int64]int64, err error) {

	tls := make([]*model.AgentToolVersion, 0, len(tools))
	now := time.Now().UnixMilli()
	for _, tool := range tools {
		if tool.Version == nil || *tool.Version == "" {
			return nil, fmt.Errorf("invalid tool version")
		}

		id, err := at.idGen.GenID(ctx)
		if err != nil {
			return nil, err
		}

		tls = append(tls, &model.AgentToolVersion{
			ID:          id,
			AgentID:     agentID,
			ToolID:      tool.ID,
			VersionMs:   now,
			ToolVersion: *tool.Version,
			Operation:   tool.Operation,
		})
	}

	err = at.query.Transaction(func(tx *query.Query) error {
		table := tx.AgentToolVersion
		return table.WithContext(ctx).CreateInBatches(tls, 10)
	})
	if err != nil {
		return nil, err
	}

	toolVersions = make(map[int64]int64, len(tools))
	for _, tl := range tls {
		toolVersions[tl.ToolID] = tl.VersionMs
	}

	return toolVersions, nil
}
