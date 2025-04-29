package user

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
)

type Config struct {
	DB     *gorm.DB
	ImageX imagex.ImageX
}

func NewUserDomain(ctx context.Context, conf *Config) (User, error) {
	return &userImpl{
		db:     conf.DB,
		imageX: conf.ImageX,
	}, nil
}

type userImpl struct {
	db     *gorm.DB
	imageX imagex.ImageX
}

func (u *userImpl) Create(ctx context.Context, req *CreateUserRequest) (resp CreateUserResponse, err error) {
	// TODO implement me
	panic("implement me")
}

func (u *userImpl) MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*entity.User, err error) {
	// TODO implement me
	panic("implement me")
}
