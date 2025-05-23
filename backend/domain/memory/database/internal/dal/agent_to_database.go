package dal

import (
	"context"
	"fmt"
	"sync"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
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

func (d *AgentToDatabaseImpl) BatchCreate(ctx context.Context, relations []*entity.AgentToDatabase) ([]int64, error) {
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
			IsDraft:       relation.TableType == entity.TableType_DraftTable,
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

func (d *AgentToDatabaseImpl) BatchDelete(ctx context.Context, basicRelations []*entity.AgentToDatabaseBasic) error {
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

func (d *AgentToDatabaseImpl) ListByAgentID(ctx context.Context, agentID int64, tableType entity.TableType) ([]*entity.AgentToDatabase, error) {
	res := d.query.AgentToDatabase

	q := res.WithContext(ctx).Where(res.AgentID.Eq(agentID))

	if tableType == entity.TableType_DraftTable {
		q = q.Where(res.IsDraft.Is(true))
	} else {
		q = q.Where(res.IsDraft.Is(false))
	}

	records, err := q.Find()
	if err != nil {
		return nil, fmt.Errorf("list agent to database relations failed: %v", err)
	}

	relations := make([]*entity.AgentToDatabase, 0, len(records))
	for _, info := range records {
		tType := entity.TableType_OnlineTable
		if info.IsDraft {
			tType = entity.TableType_DraftTable
		}
		relation := &entity.AgentToDatabase{
			AgentID:        info.AgentID,
			DatabaseID:     info.DatabaseID,
			TableType:      tType,
			PromptDisabled: info.PromptDisable,
		}
		relations = append(relations, relation)
	}

	return relations, nil
}
