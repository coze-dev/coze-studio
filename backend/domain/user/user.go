package user

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type UpdateProfileRequest struct {
	UserID      int64
	Name        *string
	UniqueName  *string
	Description *string
}

type CreateUserRequest struct {
	Email       string
	Password    string
	Name        string
	UniqueName  string
	Description string
	SpaceID     int64
}

type CreateUserResponse struct {
	UserID int64
}

type User interface {

	// Create creates or registers a new user.
	Create(ctx context.Context, req *CreateUserRequest) (user *entity.User, err error)
	Login(ctx context.Context, email, password string) (user *entity.User, err error)
	Logout(ctx context.Context, userID int64) (err error)
	ResetPassword(ctx context.Context, email, password string) (err error)
	GetUserInfo(ctx context.Context, userID int64) (user *entity.User, err error)
	UpdateAvatar(ctx context.Context, userID int64, ext string, imagePayload []byte) (url string, err error)
	UpdateProfile(ctx context.Context, req *UpdateProfileRequest) (err error)

	GetUserProfiles(ctx context.Context, userID int64) (user *entity.User, err error)

	MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*entity.User, err error)

	ValidateSession(ctx context.Context, sessionKey string) (session *entity.Session, exist bool, err error)

	GetUserSpaceList(ctx context.Context, userID int64) (spaces []*entity.Space, err error)
}
