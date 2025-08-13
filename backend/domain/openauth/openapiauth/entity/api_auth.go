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

type ApiKey struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	ApiKey      string `json:"api_key"`
	ConnectorID int64  `json:"connector"`
	UserID      int64  `json:"user_id"`
	LastUsedAt  int64  `json:"last_used_at"`
	ExpiredAt   int64  `json:"expired_at"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
}

type CreateApiKey struct {
	Name   string `json:"name"`
	Expire int64  `json:"expire"`
	UserID int64  `json:"user_id"`
	AkType AkType `json:"ak_type"`
}

type DeleteApiKey struct {
	ID     int64 `json:"id"`
	UserID int64 `json:"user_id"`
}

type GetApiKey struct {
	ID int64 `json:"id"`
}

type ListApiKey struct {
	UserID int64 `json:"user_id"`
	Limit  int64 `json:"limit"`
	Page   int64 `json:"page"`
}

type ListApiKeyResp struct {
	ApiKeys []*ApiKey `json:"api_keys"`
	HasMore bool      `json:"has_more"`
}

type SaveMeta struct {
	ID         int64   `json:"id"`
	Name       *string `json:"name"`
	UserID     int64   `json:"user_id"`
	LastUsedAt *int64  `json:"last_used_at"`
}
type CheckPermission struct {
	ApiKey string `json:"api_key"`
	UserID int64  `json:"user_id"`
}
