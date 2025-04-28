package prompt

import (
	"context"
	"strings"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/official"
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

func (s *promptService) DeletePromptResource(ctx context.Context, promptID int64) error {
	err := s.PromptDAO.DeletePromptResource(ctx, promptID)
	if err != nil {
		return err
	}

	return nil
}

func (s *promptService) ListOfficialPromptResource(ctx context.Context, spaceID int64, keyword string) ([]*entity.PromptResource, error) {
	promptList := official.GetPromptList()

	promptList = searchPromptResourceList(ctx, promptList, keyword)
	return copyAndConvertOfficialPrompts(spaceID, promptList), nil
}

func copyAndConvertOfficialPrompts(spaceID int64, pl []*entity.PromptResource) []*entity.PromptResource {
	retVal := make([]*entity.PromptResource, 0, len(pl))
	for _, promptResource := range pl {
		if promptResource == nil {
			continue
		}

		retVal = append(retVal, &entity.PromptResource{
			ID:          promptResource.ID,
			SpaceID:     spaceID,
			Name:        promptResource.Name,
			Description: promptResource.Description,
			PromptText:  promptResource.PromptText,
			Status:      1,
		})
	}
	return retVal
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
