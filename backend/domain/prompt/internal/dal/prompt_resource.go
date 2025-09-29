/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package dal

import (
	"context"
	"errors"
	"time"

	"gorm.io/gen"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/prompt/entity"
	"github.com/coze-dev/coze-studio/backend/domain/prompt/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/prompt/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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
		return 0, errorx.New(errno.ErrPromptIDGenFailCode, errorx.KV("msg", "CreatePromptResource"))
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
		return 0, errorx.WrapByCode(err, errno.ErrPromptCreateCode)
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
		return nil, errorx.WrapByCode(err, errno.ErrPromptDataNotFoundCode)
	}

	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrPromptGetCode)
	}

	do := d.promptResourcePO2DO(promptResource)

	return do, nil
}

func (d *PromptDAO) UpdatePromptResource(ctx context.Context, promptID int64, name, description, promptText *string) error {
	updateMap := make(map[string]any, 5)

	if name != nil {
		updateMap["name"] = *name
	}

	if description != nil {
		updateMap["description"] = *description
	}

	if promptText != nil {
		updateMap["prompt_text"] = *promptText
	}

	promptModel := query.PromptResource
	promptWhere := []gen.Condition{
		promptModel.ID.Eq(promptID),
	}

	_, err := promptModel.WithContext(ctx).Where(promptWhere...).Updates(updateMap)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrPromptUpdateCode)
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
		return errorx.WrapByCode(err, errno.ErrPromptDeleteCode)
	}

	return nil
}
