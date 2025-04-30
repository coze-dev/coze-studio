package dao

import (
	"context"
	"fmt"
	"sync"

	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type ToolVersionDAO interface {
	Get(ctx context.Context, vTool entity.VersionTool) (tool *entity.ToolInfo, err error)
	MGet(ctx context.Context, vTools []entity.VersionTool) (tools []*entity.ToolInfo, err error)

	BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (err error)
}

var (
	toolVersionOnce      sync.Once
	singletonToolVersion *toolVersionImpl
)

func NewToolVersionDAO(db *gorm.DB, idGen idgen.IDGenerator) ToolVersionDAO {
	toolVersionOnce.Do(func() {
		singletonToolVersion = &toolVersionImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})
	return singletonToolVersion
}

type toolVersionImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func (t *toolVersionImpl) Get(ctx context.Context, vTool entity.VersionTool) (tool *entity.ToolInfo, err error) {
	table := t.query.ToolVersion

	if vTool.Version == nil || *vTool.Version == "" {
		return nil, fmt.Errorf("invalid tool version")
	}

	tl, err := table.WithContext(ctx).
		Where(
			table.ToolID.Eq(vTool.ToolID),
			table.Version.Eq(*vTool.Version),
		).
		First()
	if err != nil {
		return nil, err
	}

	tool = model.ToolVersionToDO(tl)

	return tool, nil
}

func (t *toolVersionImpl) MGet(ctx context.Context, vTools []entity.VersionTool) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(vTools))

	table := t.query.ToolVersion
	chunks := slices.Chunks(vTools, 20)

	for _, chunk := range chunks {
		orConds := make([]gen.Condition, 0, len(chunk))
		for _, v := range chunk {
			if v.Version == nil || *v.Version == "" {
				return nil, fmt.Errorf("invalid version")
			}

			orConds = append(orConds, table.Where(
				table.ToolID.Eq(v.ToolID),
				table.Version.Eq(*v.Version)),
			)
		}

		tls, err := table.WithContext(ctx).Where(orConds...).Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, model.ToolVersionToDO(tl))
		}
	}

	return tools, nil
}

func (t *toolVersionImpl) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (err error) {
	tls := make([]*model.ToolVersion, 0, len(tools))

	for _, tool := range tools {
		if tool.GetVersion() == "" {
			return fmt.Errorf("invalid tool version")
		}

		id, err := t.IDGen.GenID(ctx)
		if err != nil {
			return err
		}

		tls = append(tls, &model.ToolVersion{
			ID:        id,
			ToolID:    tool.ID,
			PluginID:  tool.PluginID,
			Version:   tool.GetVersion(),
			SubURL:    tool.GetSubURL(),
			Method:    tool.GetMethod(),
			Operation: tool.Operation,
		})
	}

	err = tx.ToolVersion.WithContext(ctx).CreateInBatches(tls, 10)
	if err != nil {
		return err
	}

	return nil
}
