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
	"fmt"

	"gorm.io/gorm"

	pluginModel "github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
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
		ID:        t.ToolID,
		PluginID:  t.PluginID,
		CreatedAt: t.CreatedAt,
		Version:   &t.Version,
		SubURL:    &t.SubURL,
		Method:    ptr.Of(t.Method),
		Operation: t.Operation,
	}
}

func (t *ToolVersionDAO) Get(ctx context.Context, vTool pluginModel.VersionTool) (tool *entity.ToolInfo, exist bool, err error) {
	table := t.query.ToolVersion

	if vTool.Version == "" {
		return nil, false, fmt.Errorf("invalid tool version")
	}

	tl, err := table.WithContext(ctx).
		Where(
			table.ToolID.Eq(vTool.ToolID),
			table.Version.Eq(vTool.Version),
		).
		First()
	if err != nil {
		return nil, false, err
	}

	tool = toolVersionPO(*tl).ToDO()

	return tool, true, nil
}

func (t *ToolVersionDAO) MGet(ctx context.Context, vTools []pluginModel.VersionTool) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(vTools))

	table := t.query.ToolVersion
	chunks := slices.Chunks(vTools, 10)

	for _, chunk := range chunks {
		q := table.WithContext(ctx).
			Where(
				table.Where(
					table.ToolID.Eq(chunk[0].ToolID),
					table.Version.Eq(chunk[0].Version),
				),
			)

		for i, v := range chunk {
			if i == 0 {
				continue
			}
			q = q.Or(
				table.ToolID.Eq(v.ToolID),
				table.Version.Eq(v.Version),
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

		id, mErr := t.idGen.GenID(ctx)
		if mErr != nil {
			return mErr
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

func (t *ToolVersionDAO) DeleteWithTX(ctx context.Context, tx *query.QueryTx, toolID int64) (err error) {
	table := tx.ToolVersion
	_, err = table.WithContext(ctx).
		Where(table.ToolID.Eq(toolID)).
		Delete()
	return err
}
