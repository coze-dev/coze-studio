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

	"github.com/coze-dev/coze-studio/backend/domain/prompt/entity"
)

type Prompt interface {
	CreatePromptResource(ctx context.Context, p *entity.PromptResource) (int64, error)
	GetPromptResource(ctx context.Context, promptID int64) (*entity.PromptResource, error)
	UpdatePromptResource(ctx context.Context, p *entity.PromptResource) error
	DeletePromptResource(ctx context.Context, promptID int64) error

	ListOfficialPromptResource(ctx context.Context, keyword string) ([]*entity.PromptResource, error)
}
