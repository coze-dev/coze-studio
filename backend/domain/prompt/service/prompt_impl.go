package prompt

import (
	"context"
	"strings"

	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/official"
	"code.byted.org/flow/opencoze/backend/domain/prompt/repository"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type promptService struct {
	Repo repository.PromptRepository
}

func NewService(repo repository.PromptRepository) Prompt {
	return &promptService{
		Repo: repo,
	}
}

func (s *promptService) CreatePromptResource(ctx context.Context, p *entity.PromptResource) (int64, error) {
	return s.Repo.CreatePromptResource(ctx, p)
}

func (s *promptService) UpdatePromptResource(ctx context.Context, p *entity.PromptResource) error {
	return s.Repo.UpdatePromptResource(ctx, p)
}

func (s *promptService) GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error) {
	return s.Repo.GetPromptResource(ctx, promptID)
}

func (s *promptService) DeletePromptResource(ctx context.Context, promptID int64) error {
	err := s.Repo.DeletePromptResource(ctx, promptID)
	if err != nil {
		return err
	}

	return nil
}

func (s *promptService) ListOfficialPromptResource(ctx context.Context, keyword string) ([]*entity.PromptResource, error) {
	promptList := official.GetPromptList()

	promptList = searchPromptResourceList(ctx, promptList, keyword)
	return deepCopyPromptResource(promptList), nil
}

func deepCopyPromptResource(pl []*entity.PromptResource) []*entity.PromptResource {
	return slices.Transform(pl, func(p *entity.PromptResource) *entity.PromptResource {
		return &entity.PromptResource{
			ID:          p.ID,
			SpaceID:     p.SpaceID,
			Name:        p.Name,
			Description: p.Description,
			PromptText:  p.PromptText,
			Status:      1,
		}
	})
}

func searchPromptResourceList(ctx context.Context, resource []*entity.PromptResource, keyword string) []*entity.PromptResource {
	if len(keyword) == 0 {
		return resource
	}

	retVal := make([]*entity.PromptResource, 0, len(resource))
	for _, promptResource := range resource {
		if promptResource == nil {
			continue
		}
		// 名称匹配
		if strings.Contains(strings.ToLower(promptResource.Name), strings.ToLower(keyword)) {
			retVal = append(retVal, promptResource)
			continue
		}
		// 正文匹配
		if strings.Contains(strings.ToLower(promptResource.PromptText), strings.ToLower(keyword)) {
			retVal = append(retVal, promptResource)
		}
	}
	return retVal
}
