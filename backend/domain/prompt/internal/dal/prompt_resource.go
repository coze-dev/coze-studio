package dal

import (
	"context"
	"time"

	"gorm.io/gen"

	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func (d *PromptDAO) CreatePromptResource(ctx context.Context, p *model.PromptResource) (int64, error) {
	id, err := d.IDGen.GenID(ctx)
	if err != nil {
		return 0, errorx.New(errno.ErrIDGenFailCode, errorx.KV("msg", "CreatePromptResource"))
	}

	now := time.Now().Unix()

	p.ID = id
	p.Status = 1
	p.CreatedAt = now
	p.UpdatedAt = now

	promptModel := query.PromptResource
	err = promptModel.WithContext(ctx).Create(p)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrCreatePromptResourceCode)
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
		return nil, errorx.WrapByCode(err, errno.ErrGetPromptResourceCode)
	}

	return promptResource, nil
}

func (d *PromptDAO) UpdatePromptResource(ctx context.Context, p *model.PromptResource) error {
	updateMap := map[string]interface{}{
		"name":        p.Name,
		"description": p.Description,
		"prompt_text": p.PromptText,
	}

	promptModel := query.PromptResource
	promptWhere := []gen.Condition{
		promptModel.ID.Eq(p.ID),
	}

	_, err := promptModel.WithContext(ctx).Where(promptWhere...).Updates(updateMap)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrUpdatePromptResourceCode)
	}

	return nil
}
