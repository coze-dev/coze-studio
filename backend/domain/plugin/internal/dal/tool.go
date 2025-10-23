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

package dal

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

func NewToolDAO(db *gorm.DB, idGen idgen.IDGenerator) *ToolDAO {
	return &ToolDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type ToolDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type toolPO model.Tool

func (t toolPO) ToDO() *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:              t.ID,
		PluginID:        t.PluginID,
		CreatedAt:       t.CreatedAt,
		UpdatedAt:       t.UpdatedAt,
		Version:         &t.Version,
		SubURL:          &t.SubURL,
		Method:          ptr.Of(t.Method),
		Operation:       t.Operation,
		ActivatedStatus: ptr.Of(consts.ActivatedStatus(t.ActivatedStatus)),
	}
}

func (t *ToolDAO) getSelected(opt *ToolSelectedOption) (selected []field.Expr) {
	if opt == nil {
		return selected
	}

	table := t.query.Tool

	if opt.ToolID {
		selected = append(selected, table.ID)
	}
	if opt.ActivatedStatus {
		selected = append(selected, table.ActivatedStatus)
	}
	if opt.ToolMethod {
		selected = append(selected, table.Method)
	}
	if opt.ToolSubURL {
		selected = append(selected, table.SubURL)
	}

	return selected
}

func (t *ToolDAO) Get(ctx context.Context, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	table := t.query.Tool
	tl, err := table.WithContext(ctx).
		Where(table.ID.Eq(toolID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	tool = toolPO(*tl).ToDO()

	return tool, true, nil
}

func (t *ToolDAO) MGet(ctx context.Context, toolIDs []int64, opt *ToolSelectedOption) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(toolIDs))

	table := t.query.Tool
	chunks := slices.Chunks(toolIDs, 20)

	for _, chunk := range chunks {
		tls, err := table.WithContext(ctx).
			Select(t.getSelected(opt)...).
			Where(table.ID.In(chunk...)).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, toolPO(*tl).ToDO())
		}
	}

	return tools, nil
}

func (t *ToolDAO) GetAll(ctx context.Context, pluginID int64) (tools []*entity.ToolInfo, err error) {
	const limit = 20
	table := t.query.Tool
	cursor := int64(0)

	for {
		tls, err := table.WithContext(ctx).
			Where(
				table.PluginID.Eq(pluginID),
				table.ID.Gt(cursor),
			).
			Order(table.ID.Asc()).
			Limit(limit).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, toolPO(*tl).ToDO())
		}

		if len(tls) < limit {
			break
		}

		cursor = tls[len(tls)-1].ID
	}

	return tools, nil
}

func (t *ToolDAO) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, tools []*entity.ToolInfo) (err error) {
	tls := make([]*model.Tool, 0, len(tools))

	for _, tool := range tools {
		if tool.GetVersion() == "" {
			return fmt.Errorf("invalid tool version")
		}
		tls = append(tls, &model.Tool{
			ID:              tool.ID,
			PluginID:        tool.PluginID,
			Version:         tool.GetVersion(),
			SubURL:          tool.GetSubURL(),
			Method:          tool.GetMethod(),
			ActivatedStatus: int32(tool.GetActivatedStatus()),
			Operation:       tool.Operation,
		})
	}

	err = tx.Tool.WithContext(ctx).CreateInBatches(tls, 10)
	if err != nil {
		return err
	}

	return nil
}

func (t *ToolDAO) DeleteAllWithTX(ctx context.Context, tx *query.QueryTx, pluginID int64) (err error) {
	const limit = 20
	table := tx.Tool
	for {
		info, err := table.WithContext(ctx).
			Where(table.PluginID.Eq(pluginID)).
			Limit(limit).
			Delete()
		if err != nil {
			return err
		}
		if info.RowsAffected < limit {
			break
		}
	}

	return nil
}
