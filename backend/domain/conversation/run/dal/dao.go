package dal

import (
	"context"
	"encoding/json"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type RunRecordDAO struct {
	db    *gorm.DB
	query *query.Query
	idGen idgen.IDGenerator
}

func NewRunRecordDAO(db *gorm.DB, idGen idgen.IDGenerator) *RunRecordDAO {
	return &RunRecordDAO{
		db:    db,
		idGen: idGen,
		query: query.Use(db),
	}
}

func (dao *RunRecordDAO) Create(ctx context.Context, runMeta *entity.AgentRunRequest) (*model.RunRecord, error) {

	createPO, err := dao.buildCreatePO(ctx, runMeta)
	if err != nil {
		return nil, err
	}

	createErr := dao.query.RunRecord.WithContext(ctx).Create(createPO)
	if createErr != nil {
		return nil, createErr
	}

	return createPO, nil
}

func (dao *RunRecordDAO) GetByID(ctx context.Context, id int64) (*model.RunRecord, error) {
	return dao.query.RunRecord.WithContext(ctx).Where(dao.query.RunRecord.ID.Eq(id)).First()
}

func (dao *RunRecordDAO) UpdateByID(ctx context.Context, id int64, columns map[string]interface{}) error {
	_, err := dao.query.RunRecord.WithContext(ctx).Where(dao.query.RunRecord.ID.Eq(id)).UpdateColumns(columns)
	return err
}

func (dao *RunRecordDAO) List(ctx context.Context, conversationID int64, limit int64) ([]*model.RunRecord, error) {
	m := dao.query.RunRecord
	do := m.WithContext(ctx).Debug().Where(m.ConversationID.Eq(conversationID))

	if limit > 0 {
		do = m.Limit(int(limit))
	}

	chats, err := do.Order(m.CreatedAt.Desc()).Find()
	return chats, err
}

func (dao *RunRecordDAO) buildCreatePO(ctx context.Context, runMeta *entity.AgentRunRequest) (*model.RunRecord, error) {

	runID, err := dao.idGen.GenID(ctx)

	if err != nil {
		return nil, err
	}
	reqOrigin, err := json.Marshal(runMeta)
	if err != nil {
		return nil, err
	}

	timeNow := time.Now().UnixMilli()

	return &model.RunRecord{
		ID:             runID,
		ConversationID: runMeta.ConversationID,
		SectionID:      runMeta.SectionID,
		AgentID:        runMeta.AgentID,
		Status:         string(entity.RunStatusCreated),
		ChatRequest:    string(reqOrigin),
		CreatorID:      runMeta.UserID,
		CreatedAt:      timeNow,
	}, nil
}
