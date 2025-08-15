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
	"encoding/json"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
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

func (dao *RunRecordDAO) UpdateByID(ctx context.Context, id int64, updateMeta *entity.UpdateMeta) error {
	po := &model.RunRecord{
		ID: id,
	}
	if updateMeta.Status != "" {

		po.Status = string(updateMeta.Status)
	}
	if updateMeta.LastError != nil {
		errString, err := json.Marshal(updateMeta.LastError)
		if err != nil {
			return err
		}
		po.LastError = string(errString)
	}
	if updateMeta.CompletedAt != 0 {

		po.CompletedAt = updateMeta.CompletedAt
	}
	if updateMeta.FailedAt != 0 {

		po.FailedAt = updateMeta.FailedAt
	}
	if updateMeta.Usage != nil {

		po.Usage = updateMeta.Usage
	}
	po.UpdatedAt = time.Now().UnixMilli()

	_, err := dao.query.RunRecord.WithContext(ctx).Where(dao.query.RunRecord.ID.Eq(id)).Updates(po)
	return err
}

func (dao *RunRecordDAO) Delete(ctx context.Context, id []int64) error {

	_, err := dao.query.RunRecord.WithContext(ctx).Where(dao.query.RunRecord.ID.In(id...)).UpdateColumns(map[string]interface{}{
		"updated_at": time.Now().UnixMilli(),
		"status":     entity.RunStatusDeleted,
	})

	return err
}

func (dao *RunRecordDAO) List(ctx context.Context, meta *entity.ListRunRecordMeta) ([]*entity.RunRecordMeta, error) {
	logs.CtxInfof(ctx, "list run record req:%v, sectionID:%v, limit:%v", meta.ConversationID, meta.SectionID, meta.Limit)
	m := dao.query.RunRecord
	do := m.WithContext(ctx).Where(m.ConversationID.Eq(meta.ConversationID)).Debug().Where(m.Status.NotIn(string(entity.RunStatusDeleted)))
	if meta.BeforeID > 0 {
		runRecord, err := m.Where(m.ID.Eq(meta.BeforeID)).First()
		if err != nil {
			return nil, err
		}
		do = do.Where(m.CreatedAt.Lt(runRecord.CreatedAt))
	}
	if meta.AfterID > 0 {
		runRecord, err := m.Where(m.ID.Eq(meta.AfterID)).First()
		if err != nil {
			return nil, err
		}
		do = do.Where(m.CreatedAt.Gt(runRecord.CreatedAt))
	}
	if meta.SectionID > 0 {
		do = do.Where(m.SectionID.Eq(meta.SectionID))
	}
	if meta.Limit > 0 {
		do = do.Limit(int(meta.Limit))
	}
	if strings.ToLower(meta.OrderBy) == "asc" {
		do = do.Order(m.CreatedAt.Asc())
	} else {
		do = do.Order(m.CreatedAt.Desc())
	}

	runRecords, err := do.Find()
	return slices.Transform(runRecords, func(item *model.RunRecord) *entity.RunRecordMeta {
		return dao.buildPo2Do(item)
	}), err
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
		UserID:         runMeta.UserID,
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
		Usage:          po.Usage,
	}

	return runMeta
}
