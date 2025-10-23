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
	"sync"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/data/database/table"
	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

var (
	agentToDatabaseOnce sync.Once
	singletonAgentToDb  *AgentToDatabaseImpl
)

type AgentToDatabaseImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func NewAgentToDatabaseDAO(db *gorm.DB, idGen idgen.IDGenerator) *AgentToDatabaseImpl {
	agentToDatabaseOnce.Do(func() {
		singletonAgentToDb = &AgentToDatabaseImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonAgentToDb
}

func (d *AgentToDatabaseImpl) BatchCreate(ctx context.Context, relations []*database.AgentToDatabase) ([]int64, error) {
	if len(relations) == 0 {
		return []int64{}, nil
	}

	ids, err := d.IDGen.GenMultiIDs(ctx, len(relations))
	if err != nil {
		return nil, fmt.Errorf("generate IDs failed: %v", err)
	}

	agentToDbs := make([]*model.AgentToDatabase, len(relations))
	for i, relation := range relations {
		agentToDbs[i] = &model.AgentToDatabase{
			ID:            ids[i],
			AgentID:       relation.AgentID,
			DatabaseID:    relation.DatabaseID,
			IsDraft:       relation.TableType == table.TableType_DraftTable,
			PromptDisable: relation.PromptDisabled,
		}
	}

	res := d.query.AgentToDatabase
	err = res.WithContext(ctx).CreateInBatches(agentToDbs, 10)
	if err != nil {
		return nil, fmt.Errorf("batch create agent to database relations failed: %v", err)
	}

	return ids, nil
}

func (d *AgentToDatabaseImpl) BatchDelete(ctx context.Context, basicRelations []*database.AgentToDatabaseBasic) error {
	if len(basicRelations) == 0 {
		return nil
	}

	res := d.query.AgentToDatabase

	for _, relation := range basicRelations {
		q := res.WithContext(ctx).
			Where(res.AgentID.Eq(relation.AgentID)).
			Where(res.DatabaseID.Eq(relation.DatabaseID))

		_, err := q.Delete()
		if err != nil {
			return fmt.Errorf("delete relation failed for agent=%d, database=%d: %v",
				relation.AgentID, relation.DatabaseID, err)
		}
	}

	return nil
}

func (d *AgentToDatabaseImpl) ListByAgentID(ctx context.Context, agentID int64, tableType table.TableType) ([]*database.AgentToDatabase, error) {
	res := d.query.AgentToDatabase

	q := res.WithContext(ctx).Where(res.AgentID.Eq(agentID))

	if tableType == table.TableType_DraftTable {
		q = q.Where(res.IsDraft.Is(true))
	} else {
		q = q.Where(res.IsDraft.Is(false))
	}

	records, err := q.Find()
	if err != nil {
		return nil, fmt.Errorf("list agent to database relations failed: %v", err)
	}

	relations := make([]*database.AgentToDatabase, 0, len(records))
	for _, info := range records {
		tType := table.TableType_OnlineTable
		if info.IsDraft {
			tType = table.TableType_DraftTable
		}
		relation := &database.AgentToDatabase{
			AgentID:        info.AgentID,
			DatabaseID:     info.DatabaseID,
			TableType:      tType,
			PromptDisabled: info.PromptDisable,
		}
		relations = append(relations, relation)
	}

	return relations, nil
}
