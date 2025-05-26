package user

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/user/repository"
	"code.byted.org/flow/opencoze/backend/domain/user/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
)

func InitService(ctx context.Context, db *gorm.DB, oss storage.Storage, idgen idgen.IDGenerator) *UserApplicationService {
	UserApplicationSVC.DomainSVC = service.NewUserDomain(ctx, &service.Components{
		IconOSS:   oss,
		IDGen:     idgen,
		UserRepo:  repository.NewUserRepo(db),
		SpaceRepo: repository.NewSpaceRepo(db),
	})
	UserApplicationSVC.oss = oss

	return UserApplicationSVC
}
