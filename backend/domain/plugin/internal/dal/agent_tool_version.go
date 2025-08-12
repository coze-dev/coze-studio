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

	"gorm.io/gen"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
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

type agentToolVersionPO model.AgentToolVersion

func (a agentToolVersionPO) ToDO() *entity.ToolInfo {
	return &entity.ToolInfo{
		ID:        a.ToolID,
		PluginID:  a.PluginID,
		Version:   &a.ToolVersion,
		Method:    &a.Method,
		SubURL:    &a.SubURL,
		Operation: a.Operation,
	}
}

// TODO (@maronghong): Simplify query code and encapsulate query conditions
func (at *AgentToolVersionDAO) GetWithToolName(ctx context.Context, agentID int64, toolName string, agentVersion *string) (tool *entity.ToolInfo, exist bool, err error) {
	table := at.query.AgentToolVersion

	conds := []gen.Condition{
		table.AgentID.Eq(agentID),
		table.ToolName.Eq(toolName),
	}
	var tl *model.AgentToolVersion
	if agentVersion == nil || *agentVersion == "" {
		tl, err = table.WithContext(ctx).
			Where(conds...).
			Order(table.CreatedAt.Desc()).
			First()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, false, nil
			}
			return nil, false, err
		}
	} else {
		conds = append(conds, table.AgentVersion.Eq(*agentVersion))
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

	tool = agentToolVersionPO(*tl).ToDO()

	return tool, true, nil
}

func (at *AgentToolVersionDAO) Get(ctx context.Context, agentID int64, vAgentTool entity.VersionAgentTool) (tool *entity.ToolInfo, exist bool, err error) {
	table := at.query.AgentToolVersion

	conds := []gen.Condition{
		table.AgentID.Eq(agentID),
		table.ToolID.Eq(vAgentTool.ToolID),
	}
	var tl *model.AgentToolVersion
	if vAgentTool.AgentVersion == nil || *vAgentTool.AgentVersion == "" {
		tl, err = table.WithContext(ctx).
			Where(conds...).
			Order(table.CreatedAt.Desc()).
			First()
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, false, nil
			}
			return nil, false, err
		}
	} else {
		conds = append(conds, table.AgentVersion.Eq(*vAgentTool.AgentVersion))
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

	tool = agentToolVersionPO(*tl).ToDO()

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
			if v.AgentVersion == nil || *v.AgentVersion == "" {
				noVersion = append(noVersion, v)
				continue
			}
			if q == nil {
				q = table.WithContext(ctx).
					Where(
						table.Where(
							table.ToolID.Eq(chunk[0].ToolID),
							table.AgentVersion.Eq(*chunk[0].AgentVersion),
						),
					)
			} else {
				q = q.Or(
					table.ToolID.Eq(v.ToolID),
					table.AgentVersion.Eq(*v.AgentVersion),
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
			tools = append(tools, agentToolVersionPO(*tl).ToDO())
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

func (at *AgentToolVersionDAO) BatchCreate(ctx context.Context, agentID int64, agentVersion string,
	tools []*entity.ToolInfo) (err error) {

	tls := make([]*model.AgentToolVersion, 0, len(tools))
	for _, tl := range tools {
		if tl.Version == nil || *tl.Version == "" {
			return fmt.Errorf("invalid tool version")
		}

		id, err := at.idGen.GenID(ctx)
		if err != nil {
			return err
		}

		tls = append(tls, &model.AgentToolVersion{
			ID:           id,
			AgentID:      agentID,
			PluginID:     tl.PluginID,
			ToolID:       tl.ID,
			AgentVersion: agentVersion,
			ToolVersion:  *tl.Version,
			SubURL:       tl.GetSubURL(),
			Method:       tl.GetMethod(),
			ToolName:     tl.GetName(),
			Operation:    tl.Operation,
		})
	}

	err = at.query.Transaction(func(tx *query.Query) error {
		table := tx.AgentToolVersion
		return table.WithContext(ctx).CreateInBatches(tls, 10)
	})
	if err != nil {
		return err
	}

	return nil
}
