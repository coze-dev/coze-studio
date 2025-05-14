package dal

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal/query"
)

func NewSpaceDAO(db *gorm.DB) *SpaceDAO {
	return &SpaceDAO{
		query: query.Use(db),
	}
}

type SpaceDAO struct {
	query *query.Query
}

func (dao *SpaceDAO) CreateSpace(ctx context.Context, space *model.Space) error {
	return dao.query.Space.WithContext(ctx).Create(space)
}

func (dao *SpaceDAO) GetSpaceByIDs(ctx context.Context, spaceIDs []int64) ([]*model.Space, error) {
	return dao.query.Space.WithContext(ctx).Where(
		dao.query.Space.ID.In(spaceIDs...),
	).Find()
}
