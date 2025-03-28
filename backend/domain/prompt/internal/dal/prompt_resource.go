package dal

import (
	"context"
	"gorm.io/gen"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal/query"
)

func (d *PromptDAO) CreatePromptResource(ctx context.Context, p *model.PromptResource) (int64, error) {
	id, err := d.IDGen.GenID(ctx)
	if err != nil {
		return 0, err
	}

	p.ID = id
	p.Status = 1
	now := time.Now().Unix()
	p.CreatedAt = now
	p.UpdatedAt = now

	promptModel := query.PromptResource
	err = promptModel.WithContext(ctx).Create(p)
	if err != nil {
		return 0, err
	}

	return id, nil
}

func (d *PromptDAO) GetPromptResource(ctx context.Context, promptID int64) (*model.PromptResource, error) {
	promptModel := query.PromptResource
	promptWhere := []gen.Condition{
		promptModel.ID.Eq(promptID),
	}

	promptResource, err := promptModel.WithContext(ctx).Where(promptWhere...).First()
	if err != nil {
		return nil, err
	}

	return promptResource, nil
}
