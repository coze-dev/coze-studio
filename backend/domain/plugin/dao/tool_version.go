package dao

import (
	"context"
	"fmt"
	"sync"

	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/convertor"
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

	tool = convertor.ToolVersionToDO(tl)

	return tool, nil
}

func (t *toolVersionImpl) MGet(ctx context.Context, vTools []entity.VersionTool) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(vTools))

	table := t.query.ToolVersion
	chunks := slices.SplitSlice(vTools, 20)

	for _, chunk := range chunks {
		conds := make([]gen.Condition, 0, len(chunk))
		for _, v := range chunk {
			if v.Version == nil || *v.Version == "" {
				return nil, fmt.Errorf("invalid version")
			}

			conds = append(conds, table.Where(
				table.ToolID.Eq(v.ToolID),
				table.Version.Eq(*v.Version)),
			)
		}

		tls, err := table.WithContext(ctx).Where(conds...).Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, convertor.ToolVersionToDO(tl))
		}
	}

	return tools, nil
}

func (t *toolVersionImpl) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (err error) {
	ids, err := t.IDGen.GenMultiIDs(ctx, len(tools))
	if err != nil {
		return err
	}

	tls := make([]*model.ToolVersion, 0, len(tools))

	for i, tool := range tools {
		if tool.Version == nil || *tool.Version == "" {
			return fmt.Errorf("invalid tool version")
		}

		tl := &model.ToolVersion{
			ID:             ids[i],
			ToolID:         tool.ID,
			PluginID:       tool.PluginID,
			Version:        *tool.Version,
			RequestParams:  tool.ReqParameters,
			ResponseParams: tool.RespParameters,
		}

		if tool.Name != nil {
			tl.Name = *tool.Name
		}

		if tool.Desc != nil {
			tl.Desc = *tool.Desc
		}

		if tool.IconURI != nil {
			tl.IconURI = *tool.IconURI
		}

		if tool.SubURLPath != nil {
			tl.SubURLPath = *tool.SubURLPath
		}

		tls = append(tls, tl)
	}

	err = tx.ToolVersion.WithContext(ctx).CreateInBatches(tls, 10)
	if err != nil {
		return err
	}

	return nil
}
