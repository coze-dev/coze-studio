package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/template/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"

	"code.byted.org/flow/opencoze/backend/domain/template/entity"

	"code.byted.org/flow/opencoze/backend/domain/template/internal/dal/model"
)

func NewTemplateDAO(db *gorm.DB, idGen idgen.IDGenerator) TemplateRepository {
	return dal.NewTemplateDAO(db, idGen)
}

// TemplateRepository defines the interface for template operations
type TemplateRepository interface {
	// Create creates a new template
	Create(ctx context.Context, template *model.Template) (int64, error)

	// List lists templates with filters
	List(ctx context.Context, filter *entity.TemplateFilter, page *entity.Pagination, orderByField string) ([]*model.Template, int64, error)
}
