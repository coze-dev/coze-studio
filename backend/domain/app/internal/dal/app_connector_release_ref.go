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

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
	"github.com/coze-dev/coze-studio/backend/domain/app/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/app/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

func NewAPPConnectorReleaseRefDAO(db *gorm.DB, idGen idgen.IDGenerator) *APPConnectorReleaseRefDAO {
	return &APPConnectorReleaseRefDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type APPConnectorReleaseRefDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type appConnectorReleaseRefPO model.AppConnectorReleaseRef

func (a appConnectorReleaseRefPO) ToDO() *entity.ConnectorPublishRecord {
	return &entity.ConnectorPublishRecord{
		ConnectorID:   a.ConnectorID,
		PublishStatus: entity.ConnectorPublishStatus(a.PublishStatus),
		PublishConfig: a.PublishConfig,
	}
}

func (c *APPConnectorReleaseRefDAO) MGetConnectorPublishRecords(ctx context.Context, recordID int64, connectorIDs []int64) ([]*entity.ConnectorPublishRecord, error) {
	table := c.query.AppConnectorReleaseRef
	res, err := table.WithContext(ctx).
		Where(
			table.RecordID.Eq(recordID),
			table.ConnectorID.In(connectorIDs...),
		).
		Find()
	if err != nil {
		return nil, err
	}

	publishInfo := make([]*entity.ConnectorPublishRecord, 0, len(res))
	for _, r := range res {
		publishInfo = append(publishInfo, appConnectorReleaseRefPO(*r).ToDO())
	}

	return publishInfo, nil
}

func (c *APPConnectorReleaseRefDAO) GetAllConnectorPublishRecords(ctx context.Context, recordID int64) ([]*entity.ConnectorPublishRecord, error) {
	table := c.query.AppConnectorReleaseRef
	res, err := table.WithContext(ctx).
		Where(table.RecordID.Eq(recordID)).
		Find()
	if err != nil {
		return nil, err
	}

	records := make([]*entity.ConnectorPublishRecord, 0, len(res))
	for _, r := range res {
		records = append(records, appConnectorReleaseRefPO(*r).ToDO())
	}

	return records, nil
}

func (c *APPConnectorReleaseRefDAO) GetAllConnectorRecords(ctx context.Context, recordID int64) ([]*entity.ConnectorPublishRecord, error) {
	table := c.query.AppConnectorReleaseRef
	res, err := table.WithContext(ctx).
		Where(table.RecordID.Eq(recordID)).
		Find()
	if err != nil {
		return nil, err
	}

	publishInfo := make([]*entity.ConnectorPublishRecord, 0, len(res))
	for _, r := range res {
		publishInfo = append(publishInfo, appConnectorReleaseRefPO(*r).ToDO())
	}

	return publishInfo, nil
}

func (c *APPConnectorReleaseRefDAO) UpdatePublishStatus(ctx context.Context, recordID int64, status entity.ConnectorPublishStatus) error {
	table := c.query.AppConnectorReleaseRef

	_, err := table.WithContext(ctx).
		Where(table.RecordID.Eq(recordID)).
		Update(table.PublishStatus, int32(status))
	if err != nil {
		return err
	}

	return nil
}

func (c *APPConnectorReleaseRefDAO) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, recordID int64, publishRecords []*entity.ConnectorPublishRecord) error {
	records := make([]*model.AppConnectorReleaseRef, 0, len(publishRecords))
	for _, r := range publishRecords {
		id, err := c.idGen.GenID(ctx)
		if err != nil {
			return err
		}

		records = append(records, &model.AppConnectorReleaseRef{
			ID:            id,
			RecordID:      recordID,
			ConnectorID:   r.ConnectorID,
			PublishConfig: r.PublishConfig,
			PublishStatus: int32(r.PublishStatus),
		})
	}

	return tx.AppConnectorReleaseRef.WithContext(ctx).Create(records...)
}
