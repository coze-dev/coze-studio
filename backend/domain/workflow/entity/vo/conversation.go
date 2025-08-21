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

package vo

type Env string

const (
	Draft  Env = "draft"
	Online Env = "online"
)

type CreateConversationTemplateMeta struct {
	UserID  int64
	AppID   int64
	SpaceID int64
	Name    string
}

type GetConversationTemplatePolicy struct {
	AppID      *int64
	Name       *string
	Version    *string
	TemplateID *int64
}

type ListConversationTemplatePolicy struct {
	AppID    int64
	Page     *Page
	NameLike *string
	Version  *string
}

type ListConversationMeta struct {
	APPID       int64
	UserID      int64
	ConnectorID int64
}

type ListConversationPolicy struct {
	ListConversationMeta

	Page     *Page
	NameLike *string
	Version  *string
}

type CreateStaticConversation struct {
	AppID       int64
	UserID      int64
	ConnectorID int64

	TemplateID int64
}
type CreateDynamicConversation struct {
	AppID       int64
	UserID      int64
	ConnectorID int64

	Name string
}
