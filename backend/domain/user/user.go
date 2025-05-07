package user

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type LoginRequest struct {
	Email    string
	Password string
}

type LoginResponse struct {
	User *entity.User
}

type LogoutRequest struct {
	SessionKey string
	UserID     int64
}

type LogoutResponse struct {
	Success bool
}

type ResetPasswordRequest struct {
	Email    string
	Code     string
	Password string
}

type ResetPasswordResponse struct {
	Success bool
}

type UpdateAvatarRequest struct {
	UserID       int64
	ImagePayload []byte
}

type UpdateAvatarResponse struct {
	Success bool
}

type UpdateProfileRequest struct {
	UserID      int64
	Name        string
	UniqueName  string
	Description string
}

type UpdateProfileResponse struct {
	Success bool
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
	Create(ctx context.Context, req *CreateUserRequest) (resp *CreateUserResponse, err error)
	Login(ctx context.Context, req *LoginRequest) (user *entity.User, err error)
	Logout(ctx context.Context, req *LogoutRequest) (resp *LogoutResponse, err error)
	ResetPassword(ctx context.Context, req *ResetPasswordRequest) (resp *ResetPasswordResponse, err error)
	GetUserInfo(ctx context.Context, userID int64) (user *entity.User, err error)
	UpdateAvatar(ctx context.Context, userID int64, imagePayload []byte) (err error)
	UpdateProfile(ctx context.Context, req *UpdateProfileRequest) (resp *UpdateProfileResponse, err error)

	GetUserProfiles(ctx context.Context, userID int64) (user *entity.User, err error)

	MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*entity.User, err error)

	GetUserBySessionKey(ctx context.Context, sessionKey string) (user *entity.User, err error)
}
