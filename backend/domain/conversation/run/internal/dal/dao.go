package dal

import (
	"context"
	"encoding/json"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
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

func (dao *RunRecordDAO) Create(ctx context.Context, runMeta *entity.AgentRunMeta) (*entity.RunRecordMeta, error) {

	createPO, err := dao.buildCreatePO(ctx, runMeta)
	if err != nil {
		return nil, err
	}

	createErr := dao.query.RunRecord.WithContext(ctx).Create(createPO)
	if createErr != nil {
		return nil, createErr
	}

	return dao.buildPo2Do(createPO), nil
}

func (dao *RunRecordDAO) GetByID(ctx context.Context, id int64) (*model.RunRecord, error) {
	return dao.query.RunRecord.WithContext(ctx).Where(dao.query.RunRecord.ID.Eq(id)).First()
}

func (dao *RunRecordDAO) UpdateByID(ctx context.Context, id int64, columns map[string]interface{}) error {
	_, err := dao.query.RunRecord.WithContext(ctx).Where(dao.query.RunRecord.ID.Eq(id)).UpdateColumns(columns)
	return err
}

func (dao *RunRecordDAO) Delete(ctx context.Context, id []int64) error {

	_, err := dao.query.RunRecord.WithContext(ctx).Where(dao.query.RunRecord.ID.In(id...)).UpdateColumns(map[string]interface{}{
		"updated_at": time.Now().UnixMilli(),
		"status":     entity.RunStatusDeleted,
	})

	return err
}

func (dao *RunRecordDAO) List(ctx context.Context, conversationID int64, sectionID int64, limit int64) ([]*model.RunRecord, error) {
	logs.CtxInfof(ctx, "list run record req:%v, sectionID:%v, limit:%v", conversationID, sectionID, limit)
	m := dao.query.RunRecord
	do := m.WithContext(ctx).Where(m.ConversationID.Eq(conversationID)).Debug().Where(m.Status.NotIn(string(entity.RunStatusDeleted)))

	if sectionID > 0 {
		do = do.Where(m.SectionID.Eq(sectionID))
	}
	if limit > 0 {
		do = do.Limit(int(limit))
	}

	runRecords, err := do.Order(m.CreatedAt.Desc()).Find()
	return runRecords, err
}

func (dao *RunRecordDAO) buildCreatePO(ctx context.Context, runMeta *entity.AgentRunMeta) (*model.RunRecord, error) {

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

func (dao *RunRecordDAO) buildPo2Do(po *model.RunRecord) *entity.RunRecordMeta {
	runMeta := &entity.RunRecordMeta{
		ID:             po.ID,
		ConversationID: po.ConversationID,
		SectionID:      po.SectionID,
		AgentID:        po.AgentID,
		Status:         entity.RunStatus(po.Status),
		Ext:            po.Ext,
		CreatedAt:      po.CreatedAt,
		UpdatedAt:      po.UpdatedAt,
		CompletedAt:    po.CompletedAt,
		FailedAt:       po.FailedAt,
		Usage: &entity.Usage{
			LlmPromptTokens:     int64(po.InputTokens),
			LlmCompletionTokens: int64(po.OutputTokens),
			LlmTotalTokens:      int64(po.InputTokens + po.OutputTokens),
		},
	}

	return runMeta
}
