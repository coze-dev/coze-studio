package repository

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewPromptRepo(db *gorm.DB, generator idgen.IDGenerator) PromptRepository {
	return dal.NewPromptDAO(db, generator)
}

type PromptRepository interface {
	CreatePromptResource(ctx context.Context, do *entity.PromptResource) (int64, error)
	GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error)
	UpdatePromptResource(ctx context.Context, p *entity.PromptResource) error
	DeletePromptResource(ctx context.Context, ID int64) error
}
