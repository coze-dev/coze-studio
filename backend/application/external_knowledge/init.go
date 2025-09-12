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

package external_knowledge

import (
	"gorm.io/gorm"
	
	domainExternalKnowledge "github.com/coze-dev/coze-studio/backend/domain/external_knowledge"
	externalKnowledgeRepo "github.com/coze-dev/coze-studio/backend/infra/repository/external_knowledge"
)

// InitExternalKnowledgeService initializes the external knowledge application service
func InitExternalKnowledgeService(db *gorm.DB) {
	repo := externalKnowledgeRepo.NewRepository(db)
	ExternalKnowledgeApplicationSVC = NewService(repo)
}

// SetRepository sets a custom repository for testing
func SetRepository(repo domainExternalKnowledge.Repository) {
	ExternalKnowledgeApplicationSVC = NewService(repo)
}