package dal

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

func NewToolVersionDAO(db *gorm.DB, idGen idgen.IDGenerator) *ToolVersionDAO {
	return &ToolVersionDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type ToolVersionDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type toolVersionPO model.ToolVersion

func (t toolVersionPO) ToDO() *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:        t.ID,
		PluginID:  t.PluginID,
		CreatedAt: t.CreatedAt,
		Version:   &t.Version,
		SubURL:    &t.SubURL,
		Method:    ptr.Of(t.Method),
		Operation: t.Operation,
	}
}

func (t *ToolVersionDAO) Get(ctx context.Context, vTool entity.VersionTool) (tool *entity.ToolInfo, exist bool, err error) {
	table := t.query.ToolVersion

	if vTool.Version == nil || *vTool.Version == "" {
		return nil, false, fmt.Errorf("invalid tool version")
	}

	tl, err := table.WithContext(ctx).
		Where(
			table.ToolID.Eq(vTool.ToolID),
			table.Version.Eq(*vTool.Version),
		).
		First()
	if err != nil {
		return nil, false, err
	}

	tool = toolVersionPO(*tl).ToDO()

	return tool, true, nil
}

func (t *ToolVersionDAO) MGet(ctx context.Context, vTools []entity.VersionTool) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(vTools))

	table := t.query.ToolVersion
	chunks := slices.Chunks(vTools, 10)

	for _, chunk := range chunks {
		q := table.WithContext(ctx).
			Where(
				table.Where(
					table.ToolID.Eq(chunk[0].ToolID),
					table.Version.Eq(*chunk[0].Version),
				),
			)

		for i, v := range chunk {
			if i == 0 {
				continue
			}
			q = q.Or(
				table.ToolID.Eq(v.ToolID),
				table.Version.Eq(*v.Version),
			)
		}

		tls, err := q.Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, toolVersionPO(*tl).ToDO())
		}
	}

	return tools, nil
}

func (t *ToolVersionDAO) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (err error) {
	tls := make([]*model.ToolVersion, 0, len(tools))

	for _, tool := range tools {
		if tool.GetVersion() == "" {
			return fmt.Errorf("invalid tool version")
		}

		id, err := t.idGen.GenID(ctx)
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
