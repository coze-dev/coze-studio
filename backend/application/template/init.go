package template

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/template/repository"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type ServiceComponents struct {
	DB    *gorm.DB
	IDGen idgen.IDGenerator
}

func InitService(ctx context.Context, components *ServiceComponents) *ApplicationService {

	tRepo := repository.NewTemplateDAO(components.DB, components.IDGen)

	ApplicationSVC.templateRepo = tRepo

	return ApplicationSVC
}
