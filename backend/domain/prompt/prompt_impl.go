package prompt

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
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
	return s.PromptDAO.CreatePromptResource(ctx, p.PromptResource)
}

func (s *promptService) UpdatePromptResource(ctx context.Context, p *entity.PromptResource) error {
	return s.PromptDAO.UpdatePromptResource(ctx, p.PromptResource)
}

func (s *promptService) GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error) {
	pr, err := s.PromptDAO.GetPromptResource(ctx, promptID)
	if err != nil {
		return nil, errorx.New(errno.ErrGetPromptResourceCode)
	}

	return &entity.PromptResource{
		PromptResource: pr,
	}, nil
}
