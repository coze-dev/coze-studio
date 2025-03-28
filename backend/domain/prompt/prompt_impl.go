package prompt

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain"
	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal"
)

type promptService struct {
	*dal.PromptDAO
}

func NewService(i domain.InfraClients) Service {
	dao := dal.NewPromptDAO(i.DB, i.IDGen)
	return &promptService{
		PromptDAO: dao,
	}
}

func (s *promptService) CreatePromptResource(ctx context.Context, p *entity.PromptResource) (int64, error) {
	return s.PromptDAO.CreatePromptResource(ctx, p.PromptResource)
}

func (s *promptService) GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error) {
	pr, err := s.PromptDAO.GetPromptResource(ctx, promptID)
	if err != nil {
		return nil, err
	}

	return &entity.PromptResource{
		PromptResource: pr,
	}, nil
}
