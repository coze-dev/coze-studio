package crossuser

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type EntitySpace = entity.Space

//go:generate mockgen -destination ../../../internal/mock/crossdomain/crossuser/crossuser.go --package mockCrossUser -source crossuser.go
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
