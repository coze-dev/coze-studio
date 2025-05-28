package crossuser

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type EntitySpace = entity.Space

type User interface {
	GetUserSpaceList(ctx context.Context, userID int64) (spaces []*EntitySpace, err error)
}

var defaultSVC User

func DefaultSVC() User {
	return defaultSVC
}

func SetDefaultSVC(u User) {
	defaultSVC = u
}
