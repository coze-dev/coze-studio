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

import product_public_api "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_public_api"

// TemplateModel represents a template model for database operations
type TemplateModel struct {
	ID                int64                                 `json:"id"`
	AgentID           int64                                 `json:"agent_id"`
	SpaceID           int64                                 `json:"space_id"`
	CreatedAt         int64                                 `json:"created_at"`
	Heat              int64                                 `json:"heat"`
	ProductEntityType int64                                 `json:"product_entity_type"`
	MetaInfo          *product_public_api.ProductMetaInfo   `json:"meta_info"`
	PluginExtra       *product_public_api.PluginExtraInfo   `json:"plugin_extra"`
	AgentExtra        *product_public_api.BotExtraInfo      `json:"agent_extra"`
	WorkflowExtra     *product_public_api.WorkflowExtraInfo `json:"workflow_extra"`
	ProjectExtra      *product_public_api.ProjectExtraInfo  `json:"project_extra"`
}

// GetTitle returns the title from MetaInfo
func (t *TemplateModel) GetTitle() string {
	if t.MetaInfo != nil {
		return t.MetaInfo.Name
	}
	return ""
}

// GetDescription returns the description from MetaInfo
func (t *TemplateModel) GetDescription() string {
	if t.MetaInfo != nil {
		return t.MetaInfo.Description
	}
	return ""
}