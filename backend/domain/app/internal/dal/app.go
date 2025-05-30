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

func NewAPPDAO(db *gorm.DB, idGen idgen.IDGenerator) *APPDAO {
	return &APPDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type APPDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type appPO model.App

func (a appPO) ToDO() *entity.APP {
	return &entity.APP{
		ID:            a.AppID,
		SpaceID:       a.SpaceID,
		IconURI:       &a.IconURI,
		Name:          &a.Name,
		Desc:          &a.Desc,
		OwnerID:       a.OwnerID,
		CreatedAtMS:   a.CreatedAt,
		UpdatedAtMS:   a.UpdatedAt,
		Version:       &a.Version,
		VersionDesc:   &a.VersionDesc,
		PublishedAtMS: &a.PublishAt,
		ConnectorPublishInfo: []entity.ConnectorPublishInfo{
			{
				ConnectorID:   a.ConnectorID,
				PublishStatus: consts.PublishStatusOfSuccess,
				PublishConfig: entity.PublishConfig{
					SelectedWorkflows: a.PublishConfig.SelectedWorkflows,
				},
			},
		},
	}
}

func (a *APPDAO) GetAPP(ctx context.Context, appID int64) (app *entity.APP, exist bool, err error) {
	appTable := a.query.App
	res, err := appTable.WithContext(ctx).
		Where(appTable.AppID.Eq(appID)).
		Find()
	if err != nil {
		return nil, false, err
	}

	if len(res) == 0 {
		return nil, false, nil
	}

	apps := make([]*entity.APP, 0, len(res))
	for _, ap := range res {
		apps = append(apps, appPO(*ap).ToDO())
	}

	app = apps[0]
	if len(apps) == 1 {
		return app, true, nil
	}

	for _, ap := range apps[1:] {
		app.ConnectorPublishInfo = append(app.ConnectorPublishInfo, ap.ConnectorPublishInfo...)
	}

	return app, true, nil
}
