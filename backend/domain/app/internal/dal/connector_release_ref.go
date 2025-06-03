package dal

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/consts"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewConnectorReleaseRefDAO(db *gorm.DB, idGen idgen.IDGenerator) *ConnectorReleaseRefDAO {
	return &ConnectorReleaseRefDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type ConnectorReleaseRefDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type connectorReleaseRefPO model.ConnectorReleaseRef

func (a connectorReleaseRefPO) ToDO() *entity.ConnectorPublishRecord {
	return &entity.ConnectorPublishRecord{
		ConnectorID:   a.ConnectorID,
		PublishStatus: consts.ConnectorPublishStatus(a.PublishStatus),
		PublishConfig: a.PublishConfig,
	}
}

func (c *ConnectorReleaseRefDAO) MGetConnectorPublishRecords(ctx context.Context, recordID int64, connectorIDs []int64) ([]*entity.ConnectorPublishRecord, error) {
	table := c.query.ConnectorReleaseRef
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
		publishInfo = append(publishInfo, connectorReleaseRefPO(*r).ToDO())
	}

	return publishInfo, nil
}

func (c *ConnectorReleaseRefDAO) GetAllConnectorPublishRecords(ctx context.Context, recordID int64) ([]*entity.ConnectorPublishRecord, error) {
	table := c.query.ConnectorReleaseRef
	res, err := table.WithContext(ctx).
		Where(table.RecordID.Eq(recordID)).
		Find()
	if err != nil {
		return nil, err
	}

	records := make([]*entity.ConnectorPublishRecord, 0, len(res))
	for _, r := range res {
		records = append(records, connectorReleaseRefPO(*r).ToDO())
	}

	return records, nil
}

func (c *ConnectorReleaseRefDAO) GetAllConnectorRecords(ctx context.Context, recordID int64) ([]*entity.ConnectorPublishRecord, error) {
	table := c.query.ConnectorReleaseRef
	res, err := table.WithContext(ctx).
		Where(table.RecordID.Eq(recordID)).
		Find()
	if err != nil {
		return nil, err
	}

	publishInfo := make([]*entity.ConnectorPublishRecord, 0, len(res))
	for _, r := range res {
		publishInfo = append(publishInfo, connectorReleaseRefPO(*r).ToDO())
	}

	return publishInfo, nil
}

func (c *ConnectorReleaseRefDAO) UpdatePublishStatus(ctx context.Context, recordID int64, status consts.ConnectorPublishStatus) error {
	table := c.query.ConnectorReleaseRef

	_, err := table.WithContext(ctx).
		Where(table.RecordID.Eq(recordID)).
		Update(table.PublishStatus, int32(status))
	if err != nil {
		return err
	}

	return nil
}

func (c *ConnectorReleaseRefDAO) BatchCreateWithTX(ctx context.Context, tx *query.QueryTx, recordID int64, publishRecords []*entity.ConnectorPublishRecord) error {
	records := make([]*model.ConnectorReleaseRef, 0, len(publishRecords))
	for _, r := range publishRecords {
		id, err := c.idGen.GenID(ctx)
		if err != nil {
			return err
		}

		records = append(records, &model.ConnectorReleaseRef{
			ID:            id,
			RecordID:      recordID,
			ConnectorID:   r.ConnectorID,
			PublishConfig: r.PublishConfig,
			PublishStatus: int32(r.PublishStatus),
		})
	}

	return tx.ConnectorReleaseRef.WithContext(ctx).Create(records...)
}
