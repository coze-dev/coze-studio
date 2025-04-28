package prompt

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
)

type Prompt interface {
	CreatePromptResource(ctx context.Context, p *entity.PromptResource) (int64, error)
	GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error)
	UpdatePromptResource(ctx context.Context, p *entity.PromptResource) error
	DeletePromptResource(ctx context.Context, promptID int64) error

	ListOfficialPromptResource(ctx context.Context, spaceID int64, keyword string) ([]*entity.PromptResource, error)
}
