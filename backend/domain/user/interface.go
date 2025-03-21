package user

import (
	"context"
)

type CreateUserRequest struct {
}

type CreateUserResponse struct {
}

type Domain interface {
	Create(ctx context.Context, req *CreateUserRequest) (resp CreateUserResponse, err error)
}
