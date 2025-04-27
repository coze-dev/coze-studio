package prompt

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type promptService struct {
	*dal.PromptDAO
}

func NewService(db *gorm.DB, generator idgen.IDGenerator) Prompt {
	dao := dal.NewPromptDAO(db, generator)
	return &promptService{
		PromptDAO: dao,
	}
}

func (s *promptService) CreatePromptResource(ctx context.Context, p *entity.PromptResource) (int64, error) {
	return s.PromptDAO.CreatePromptResource(ctx, p)
}

func (s *promptService) UpdatePromptResource(ctx context.Context, p *entity.PromptResource) error {
	return s.PromptDAO.UpdatePromptResource(ctx, p)
}

func (s *promptService) GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error) {
	return s.PromptDAO.GetPromptResource(ctx, promptID)
}
