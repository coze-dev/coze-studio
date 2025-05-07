package user

import (
	"context"
	"strconv"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
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

func (u *userImpl) GetUserProfiles(ctx context.Context, userID int64) (user *entity.User, err error) {
	userInfos, err := u.MGetUserProfiles(ctx, []int64{userID})
	if err != nil {
		return nil, err
	}

	if len(userInfos) == 0 {
		return nil, errorx.New(errno.ErrResourceNotFound, errorx.KV("type", "user"),
			errorx.KV("id", strconv.FormatInt(userID, 10)))
	}

	return userInfos[0], nil
}

func (u *userImpl) MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*entity.User, err error) {
	// TODO implement me
	panic("implement me")
}
