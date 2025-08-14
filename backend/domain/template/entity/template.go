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

package entity

import (
	product_public_api "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_public_api"
)

// TemplateFilter defines filters for listing templates
type TemplateFilter struct {
	AgentID           *int64
	SpaceID           *int64
	ProductEntityType *int64
	CreatorID         *int64
}

// Template defines a template entity
type Template struct {
	ID                int64
	AgentID           int64
	SpaceID           int64
	ProductEntityType int64
	MetaInfo          *product_public_api.ProductMetaInfo
	Heat              int64
	CreatedAt         int64
	CreatorID         int64
}

// GetTitle extracts title from meta info
func (t *Template) GetTitle() string {
	if t.MetaInfo == nil {
		return ""
	}
	return t.MetaInfo.Name
}

// GetDescription extracts description from meta info
func (t *Template) GetDescription() string {
	if t.MetaInfo == nil {
		return ""
	}
	return t.MetaInfo.Description
}

type Pagination struct {
	Limit  int
	Offset int
}
