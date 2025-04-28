package user

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type CreateUserRequest struct{}

type CreateUserResponse struct{}

type User interface {
	Create(ctx context.Context, req *CreateUserRequest) (resp CreateUserResponse, err error)

	MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*entity.User, err error)
}
