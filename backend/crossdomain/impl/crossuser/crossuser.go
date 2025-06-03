package crossuser

import (
	"context"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossuser"
	"code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/domain/user/service"
)

var defaultSVC crossuser.User

type impl struct {
	DomainSVC service.User
}

func InitDomainService(u service.User) crossuser.User {
	defaultSVC = &impl{
		DomainSVC: u,
	}
	return defaultSVC
}

func (u *impl) GetUserSpaceList(ctx context.Context, userID int64) (spaces []*entity.Space, err error) {
	return u.DomainSVC.GetUserSpaceList(ctx, userID)
}
