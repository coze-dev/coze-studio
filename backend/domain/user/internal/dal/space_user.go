package dal

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal/query"
)

func NewSpaceUserDAO(db *gorm.DB) *SpaceUserDAO {
	return &SpaceUserDAO{
		query: query.Use(db),
	}
}

type SpaceUserDAO struct {
	query *query.Query
}

func (dao *SpaceUserDAO) AddSpaceUser(ctx context.Context, spaceUser *model.SpaceUser) error {
	return dao.query.SpaceUser.WithContext(ctx).Create(spaceUser)
}

func (dao *SpaceUserDAO) GetSpaceList(ctx context.Context, userID int64) ([]*model.SpaceUser, error) {
	return dao.query.SpaceUser.WithContext(ctx).Where(
		dao.query.SpaceUser.UserID.Eq(userID),
	).Find()
}
