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

	"code.byted.org/data_edc/workflow_engine_next/application/search"
	"code.byted.org/data_edc/workflow_engine_next/domain/prompt/repository"
	prompt "code.byted.org/data_edc/workflow_engine_next/domain/prompt/service"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/idgen"
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator, re search.ResourceEventBus) *PromptApplicationService {
	repo := repository.NewPromptRepo(db, idGenSVC)
	PromptSVC.DomainSVC = prompt.NewService(repo)
	PromptSVC.eventbus = re

	return PromptSVC
}
