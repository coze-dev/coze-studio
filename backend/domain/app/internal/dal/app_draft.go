package dal

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/app/entity"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewAPPDraftDAO(db *gorm.DB, idGen idgen.IDGenerator) *APPDraftDAO {
	return &APPDraftDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type APPDraftDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type appDraftPO model.AppDraft

func (a appDraftPO) ToDO() *entity.Application {
	return &entity.Application{
		ID:          a.ID,
		SpaceID:     a.SpaceID,
		IconURI:     a.IconURI,
		Name:        a.Name,
		Desc:        a.Desc,
		OwnerID:     a.OwnerID,
		CreatedAtMS: a.CreatedAt,
		UpdatedAtMS: a.UpdatedAt,
	}
}

func (a *APPDraftDAO) Create(ctx context.Context, app *entity.Application) (appID int64, err error) {
	appID, err = a.idGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	m := &model.AppDraft{
		ID:      appID,
		SpaceID: app.SpaceID,
		OwnerID: app.OwnerID,
		IconURI: app.IconURI,
		Name:    app.Name,
		Desc:    app.Desc,
	}
	err = a.query.AppDraft.WithContext(ctx).Create(m)
	if err != nil {
		return 0, err
	}

	return appID, nil
}

func (a *APPDraftDAO) Get(ctx context.Context, appID int64) (app *entity.Application, exist bool, err error) {
	table := a.query.AppDraft
	res, err := table.WithContext(ctx).
		Where(table.ID.Eq(appID)).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	app = appDraftPO(*res).ToDO()

	return app, true, nil
}
