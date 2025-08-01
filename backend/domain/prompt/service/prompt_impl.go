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

package prompt

import (
	"context"
	"strings"

	"github.com/coze-dev/coze-studio/backend/domain/prompt/entity"
	"github.com/coze-dev/coze-studio/backend/domain/prompt/internal/official"
	"github.com/coze-dev/coze-studio/backend/domain/prompt/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
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
		// name match
		if strings.Contains(strings.ToLower(promptResource.Name), strings.ToLower(keyword)) {
			retVal = append(retVal, promptResource)
			continue
		}
		// Body Match
		if strings.Contains(strings.ToLower(promptResource.PromptText), strings.ToLower(keyword)) {
			retVal = append(retVal, promptResource)
		}
	}
	return retVal
}
