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
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/application/search"
	"github.com/coze-dev/coze-studio/backend/domain/prompt/repository"
	prompt "github.com/coze-dev/coze-studio/backend/domain/prompt/service"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator, re search.ResourceEventBus) *PromptApplicationService {
	repo := repository.NewPromptRepo(db, idGenSVC)
	PromptSVC.DomainSVC = prompt.NewService(repo)
	PromptSVC.eventbus = re

	return PromptSVC
}
