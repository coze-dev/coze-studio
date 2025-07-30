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

	"gorm.io/gen/field"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

func NewAgentToolDraftDAO(db *gorm.DB, idGen idgen.IDGenerator) *AgentToolDraftDAO {
	return &AgentToolDraftDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type AgentToolDraftDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type agentToolDraftPO model.AgentToolDraft

func (a agentToolDraftPO) ToDO() *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:        a.ToolID,
		PluginID:  a.PluginID,
		CreatedAt: a.CreatedAt,
		Version:   &a.ToolVersion,
		Method:    &a.Method,
		SubURL:    &a.SubURL,
		Operation: a.Operation,
	}
}

func (at *AgentToolDraftDAO) getSelected(opt *ToolSelectedOption) (selected []field.Expr) {
	if opt == nil {
		return selected
	}

	table := at.query.AgentToolDraft

	if opt.ToolID {
		selected = append(selected, table.ToolID)
	}
	if opt.ToolMethod {
		selected = append(selected, table.Method)
	}
	if opt.ToolSubURL {
		selected = append(selected, table.SubURL)
	}

	return selected
}

func (at *AgentToolDraftDAO) Get(ctx context.Context, agentID, toolID int64) (tool *entity.ToolInfo, exist bool, err error) {
	table := at.query.AgentToolDraft
	tl, err := table.WithContext(ctx).
		Where(
			table.AgentID.Eq(agentID),
			table.ToolID.Eq(toolID),
		).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	tool = agentToolDraftPO(*tl).ToDO()

	return tool, true, nil
}

func (at *AgentToolDraftDAO) GetWithToolName(ctx context.Context, agentID int64, toolName string) (tool *entity.ToolInfo, exist bool, err error) {
	table := at.query.AgentToolDraft
	tl, err := table.WithContext(ctx).
		Where(
			table.AgentID.Eq(agentID),
			table.ToolName.Eq(toolName),
		).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	tool = agentToolDraftPO(*tl).ToDO()

	return tool, true, nil
}

func (at *AgentToolDraftDAO) MGet(ctx context.Context, agentID int64, toolIDs []int64) (tools []*entity.ToolInfo, err error) {
	tools = make([]*entity.ToolInfo, 0, len(toolIDs))

	table := at.query.AgentToolDraft
	chunks := slices.Chunks(toolIDs, 20)

	for _, chunk := range chunks {
		tls, err := table.WithContext(ctx).
			Where(
				table.AgentID.Eq(agentID),
				table.ToolID.In(chunk...),
			).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, agentToolDraftPO(*tl).ToDO())
		}
	}

	return tools, nil
}

func (at *AgentToolDraftDAO) GetAll(ctx context.Context, agentID int64, opt *ToolSelectedOption) (tools []*entity.ToolInfo, err error) {
	const limit = 20
	table := at.query.AgentToolDraft
	cursor := int64(0)

	for {
		tls, err := table.WithContext(ctx).
			Select(at.getSelected(opt)...).
			Where(
				table.AgentID.Eq(agentID),
				table.ID.Gt(cursor),
			).
			Order(table.ID.Asc()).
			Limit(limit).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			tools = append(tools, agentToolDraftPO(*tl).ToDO())
		}

		if len(tls) < limit {
			break
		}

		cursor = tls[len(tls)-1].ID
	}

	return tools, nil
}

func (at *AgentToolDraftDAO) UpdateWithToolName(ctx context.Context, agentID int64, toolName string, tool *entity.ToolInfo) (err error) {
	m := &model.AgentToolDraft{
		Operation: tool.Operation,
	}
	table := at.query.AgentToolDraft
	_, err = table.WithContext(ctx).
		Where(
			table.AgentID.Eq(agentID),
			table.ToolName.Eq(toolName),
		).
		Updates(m)
	if err != nil {
		return err
	}

	return nil
}

func (at *AgentToolDraftDAO) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, agentID int64, tools []*entity.ToolInfo) (err error) {
	return at.batchCreateWithTX(ctx, tx, agentID, tools, false)
}

func (at *AgentToolDraftDAO) BatchCreateIgnoreConflictWithTX(ctx context.Context, tx *query.QueryTx, agentID int64, tools []*entity.ToolInfo) (err error) {
	return at.batchCreateWithTX(ctx, tx, agentID, tools, true)
}

func (at *AgentToolDraftDAO) batchCreateWithTX(ctx context.Context, tx *query.QueryTx, agentID int64,
	tools []*entity.ToolInfo, ignoreConflict bool) (err error) {

	tls := make([]*model.AgentToolDraft, 0, len(tools))
	for _, tl := range tools {
		id, err := at.idGen.GenID(ctx)
		if err != nil {
			return err
		}
		m := &model.AgentToolDraft{
			ID:          id,
			ToolID:      tl.ID,
			PluginID:    tl.PluginID,
			AgentID:     agentID,
			SubURL:      tl.GetSubURL(),
			Method:      tl.GetMethod(),
			ToolVersion: tl.GetVersion(),
			ToolName:    tl.GetName(),
			Operation:   tl.Operation,
		}
		tls = append(tls, m)
	}

	table := tx.AgentToolDraft

	if ignoreConflict {
		err = table.WithContext(ctx).Clauses(clause.OnConflict{DoNothing: true}).
			CreateInBatches(tls, 20)
	} else {
		err = table.WithContext(ctx).CreateInBatches(tls, 20)
	}
	if err != nil {
		return err
	}

	return nil
}

func (at *AgentToolDraftDAO) GetAllPluginIDs(ctx context.Context, agentID int64) (pluginIDs []int64, err error) {
	const size = 100
	table := at.query.AgentToolDraft
	cursor := int64(0)

	for {
		tls, err := table.WithContext(ctx).
			Select(table.PluginID, table.ID).
			Where(
				table.AgentID.Eq(agentID),
				table.ID.Gt(cursor),
			).
			Order(table.ID.Asc()).
			Limit(size).
			Find()
		if err != nil {
			return nil, err
		}

		for _, tl := range tls {
			pluginIDs = append(pluginIDs, tl.PluginID)
		}

		if len(tls) < size {
			break
		}

		cursor = tls[len(tls)-1].ID
	}

	return slices.Unique(pluginIDs), nil
}

func (at *AgentToolDraftDAO) DeleteWithTX(ctx context.Context, tx *query.QueryTx, agentID int64, toolIDs []int64) (err error) {
	const limit = 20
	table := tx.AgentToolDraft

	chunks := slices.Chunks(toolIDs, limit)
	for _, chunk := range chunks {
		_, err = table.WithContext(ctx).
			Where(
				table.AgentID.Eq(agentID),
				table.ToolID.In(chunk...),
			).
			Limit(limit).
			Delete()
		if err != nil {
			return err
		}
	}

	return nil
}
