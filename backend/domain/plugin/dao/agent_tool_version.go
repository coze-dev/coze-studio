package dao

import (
	"context"
	"fmt"
	"sync"
	"time"

	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/convertor"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type AgentToolVersionDAO interface {
	Get(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, err error)
	MGet(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error)

	BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, agentID int64, tools []*entity.ToolInfo) (toolVersions map[int64]int64, err error)
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

func (at *agentToolVersionImpl) Get(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, err error) {
	if vAgentTool.VersionMs == nil || *vAgentTool.VersionMs == 0 {
		return nil, fmt.Errorf("invalid versionMs")
	}

	table := at.query.AgentToolVersion

	tl, err := table.WithContext(ctx).
		Where(
			table.AgentID.Eq(agentID),
			table.ToolID.Eq(vAgentTool.ToolID),
			table.VersionMs.Eq(*vAgentTool.VersionMs),
		).First()
	if err != nil {
		return nil, err
	}

	tool = convertor.AgentToolVersionToDO(tl)

	return tool, nil
}

func (at *agentToolVersionImpl) MGet(ctx context.Context, agentID int64, vAgentTools []entity.VersionAgentTool) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(vAgentTools))

	table := at.query.AgentToolVersion
	chunks := slices.SplitSlice(vAgentTools, 20)

	for _, chunk := range chunks {
		conds := make([]gen.Condition, 0, len(chunk))
		conds = append(conds, table.AgentID.Eq(agentID))

		for _, v := range chunk {
			if v.VersionMs == nil || *v.VersionMs == 0 {
				return nil, fmt.Errorf("invalid versionMs")
			}

			conds = append(conds, table.Where(
				table.ToolID.Eq(v.ToolID),
				table.VersionMs.Eq(*v.VersionMs)),
			)
		}

		tls, err := table.WithContext(ctx).Where(conds...).Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, convertor.AgentToolVersionToDO(tl))
		}
	}

	return tools, nil
}

func (at *agentToolVersionImpl) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, agentID int64,
	tools []*entity.ToolInfo) (toolVersions map[int64]int64, err error) {

	ids, err := at.IDGen.GenMultiIDs(ctx, len(tools))
	if err != nil {
		return nil, err
	}

	tls := make([]*model.AgentToolVersion, 0, len(tools))
	now := time.Now().UnixMilli()

	for i, tool := range tools {
		if tool.Version == nil || *tool.Version == "" {
			return nil, fmt.Errorf("invalid tool version")
		}

		tl := &model.AgentToolVersion{
			ID:             ids[i],
			AgentID:        agentID,
			ToolID:         tool.ID,
			VersionMs:      now,
			ToolVersion:    *tool.Version,
			RequestParams:  tool.ReqParameters,
			ResponseParams: tool.RespParameters,
		}

		tls = append(tls, tl)
	}

	err = tx.AgentToolVersion.WithContext(ctx).CreateInBatches(tls, 10)
	if err != nil {
		return nil, err
	}

	toolVersions = make(map[int64]int64, len(tools))
	for _, tl := range tls {
		toolVersions[tl.ToolID] = tl.VersionMs
	}

	return toolVersions, nil
}
