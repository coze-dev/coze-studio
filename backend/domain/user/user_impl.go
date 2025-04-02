package user

import (
	"context"

	"gorm.io/gorm"
)

func NewUserDomain(ctx context.Context, userDB *gorm.DB) (User, error) {
	return nil, nil
}
