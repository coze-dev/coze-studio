package prompt

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
)

type Service interface {
	CreatePromptResource(ctx context.Context, p *entity.PromptResource) (int64, error)
	GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error)
}
