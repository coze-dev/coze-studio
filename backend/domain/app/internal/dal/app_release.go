package dal

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/consts"
	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewAPPReleaseDAO(db *gorm.DB, idGen idgen.IDGenerator) *APPReleaseDAO {
	return &APPReleaseDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type APPReleaseDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type appReleasePO model.AppRelease

func (a appReleasePO) ToDO() *entity.APP {
	return &entity.APP{
		ID:            a.AppID,
		SpaceID:       a.SpaceID,
		Version:       &a.Version,
		CreatedAtMS:   a.CreatedAt,
		PublishedAtMS: &a.CreatedAt,
	}
}

func (a *APPReleaseDAO) GetLatestAPP(ctx context.Context, appID int64) (app *entity.APP, exist bool, err error) {
	table := a.query.AppRelease
	res, err := table.WithContext(ctx).
		Where(table.AppID.Eq(appID)).
		Order(table.CreatedAt.Desc()).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	app = appReleasePO(*res).ToDO()

	records, err := table.WithContext(ctx).
		Where(table.AppID.Eq(appID)).
		Where(table.Version.Eq(app.GetVersion())).
		Select(table.ConnectorID).
		Find()
	if err != nil {
		return nil, false, err
	}

	connectorIDs := make([]int64, 0, len(records))
	for _, record := range records {
		if record.Status != int32(consts.PublishStatusOfSuccess) {
			continue
		}
		connectorIDs = append(connectorIDs, record.ConnectorID)
	}

	app.ConnectorIDs = connectorIDs

	return app, true, nil
}
