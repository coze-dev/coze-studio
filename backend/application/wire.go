package application

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/user"
)

var (
	userDomain user.User
)

func InitInfraAndDomain(ctx context.Context) (err error) {

	var userDB *gorm.DB

	userDomain, err = user.NewUserDomain(ctx, userDB)
	if err != nil {
		return err
	}

	_ = userDomain

	return nil
}
