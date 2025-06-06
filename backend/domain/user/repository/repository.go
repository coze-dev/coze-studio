package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal/model"
)

func NewUserRepo(db *gorm.DB) UserRepository {
	return dal.NewUserDAO(db)
}

func NewSpaceRepo(db *gorm.DB) SpaceRepository {
	return dal.NewSpaceDAO(db)
}

type UserRepository interface {
	GetUsersByEmail(ctx context.Context, email string) (*model.User, bool, error)
	UpdateSessionKey(ctx context.Context, userID int64, sessionKey string) error
	ClearSessionKey(ctx context.Context, userID int64) error
	UpdatePassword(ctx context.Context, email, password string) error
	GetUserByID(ctx context.Context, userID int64) (*model.User, error)
	UpdateAvatar(ctx context.Context, userID int64, iconURI string) error
	CheckUniqueNameExist(ctx context.Context, uniqueName string) (bool, error)
	UpdateProfile(ctx context.Context, userID int64, updates map[string]any) error
	CheckEmailExist(ctx context.Context, email string) (bool, error)
	CreateUser(ctx context.Context, user *model.User) error
	GetUserBySessionKey(ctx context.Context, sessionKey string) (*model.User, bool, error)
	GetUsersByIDs(ctx context.Context, userIDs []int64) ([]*model.User, error)
}

type SpaceRepository interface {
	CreateSpace(ctx context.Context, space *model.Space) error
	GetSpaceByIDs(ctx context.Context, spaceIDs []int64) ([]*model.Space, error)
	AddSpaceUser(ctx context.Context, spaceUser *model.SpaceUser) error
	GetSpaceList(ctx context.Context, userID int64) ([]*model.SpaceUser, error)
}
