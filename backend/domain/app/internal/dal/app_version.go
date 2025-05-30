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

func NewAPPVersionDAO(db *gorm.DB, idGen idgen.IDGenerator) *APPVersionDAO {
	return &APPVersionDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type APPVersionDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

type appVersionPO model.AppVersion

func (a appVersionPO) ToDO() *entity.APP {
	return &entity.APP{
		ID:            a.AppID,
		SpaceID:       a.SpaceID,
		IconURI:       &a.IconURI,
		Name:          &a.Name,
		Desc:          &a.Desc,
		OwnerID:       a.OwnerID,
		CreatedAtMS:   a.CreatedAt,
		Version:       &a.Version,
		VersionDesc:   &a.VersionDesc,
		PublishedAtMS: &a.CreatedAt,
		ConnectorPublishInfo: []entity.ConnectorPublishInfo{
			{
				ConnectorID:   a.ConnectorID,
				PublishStatus: consts.PublishStatus(a.Status),
				PublishConfig: entity.PublishConfig{
					SelectedWorkflows: a.PublishConfig.SelectedWorkflows,
				},
			},
		},
	}
}

func (a *APPVersionDAO) CheckAPPVersionExist(ctx context.Context, appID int64, version string) (exist bool, err error) {
	table := a.query.AppVersion
	_, err = table.WithContext(ctx).
		Where(table.AppID.Eq(appID)).
		Where(table.Version.Eq(version)).
		Select(table.ID).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}
