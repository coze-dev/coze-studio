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

type User struct {
	UserID int64

	Name         string // 昵称
	UniqueName   string // 唯一名称
	Email        string // 邮箱
	Description  string // 用户描述
	IconURI      string // 头像URI
	IconURL      string // 头像URL
	UserVerified bool   // 用户是否已验证
	Locale       string
	SessionKey   string // 会话密钥

	CreatedAt int64 // 创建时间
	UpdatedAt int64 // 更新时间
}
