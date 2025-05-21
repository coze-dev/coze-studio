package dal

import (
	"context"
	"errors"
	"time"

	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/prompt/entity"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/prompt/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type PromptDAO struct {
	IDGen idgen.IDGenerator
}

func NewPromptDAO(db *gorm.DB, generator idgen.IDGenerator) *PromptDAO {
	query.SetDefault(db)

	return &PromptDAO{
		IDGen: generator,
	}
}

func (d *PromptDAO) promptResourceDO2PO(p *entity.PromptResource) *model.PromptResource {
	return &model.PromptResource{
		ID:          p.ID,
		Name:        p.Name,
		SpaceID:     p.SpaceID,
		Description: p.Description,
		PromptText:  p.PromptText,
		Status:      p.Status,
		CreatorID:   p.CreatorID,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func (d *PromptDAO) promptResourcePO2DO(p *model.PromptResource) *entity.PromptResource {
	return &entity.PromptResource{
		ID:          p.ID,
		Name:        p.Name,
		SpaceID:     p.SpaceID,
		Description: p.Description,
		PromptText:  p.PromptText,
		Status:      p.Status,
		CreatorID:   p.CreatorID,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func (d *PromptDAO) CreatePromptResource(ctx context.Context, do *entity.PromptResource) (int64, error) {
	id, err := d.IDGen.GenID(ctx)
	if err != nil {
		return 0, errorx.New(errno.ErrIDGenFailCode, errorx.KV("msg", "CreatePromptResource"))
	}

	p := d.promptResourceDO2PO(do)

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

func (d *PromptDAO) GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error) {
	promptModel := query.PromptResource
	promptWhere := []gen.Condition{
		promptModel.ID.Eq(promptID),
	}

	promptResource, err := promptModel.WithContext(ctx).Where(promptWhere...).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errorx.WrapByCode(err, errno.ErrGetPromptResourceNotFoundCode)
	}

	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrGetPromptResourceCode)
	}

	do := d.promptResourcePO2DO(promptResource)

	return do, nil
}

func (d *PromptDAO) UpdatePromptResource(ctx context.Context, p *entity.PromptResource) error {
	updateMap := make(map[string]any, 5)

	if p.Name != "" {
		updateMap["name"] = p.Name
	}

	if p.Description != "" {
		updateMap["description"] = p.Description
	}

	if p.PromptText != "" {
		updateMap["prompt_text"] = p.PromptText
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

func (d *PromptDAO) DeletePromptResource(ctx context.Context, ID int64) error {
	promptModel := query.PromptResource
	promptWhere := []gen.Condition{
		promptModel.ID.Eq(ID),
	}
	_, err := promptModel.WithContext(ctx).Where(promptWhere...).Delete()
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrDeletePromptResourceCode)
	}

	return nil
}
