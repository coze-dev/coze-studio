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

import "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/internal/dal/model"

type ShortcutCmd = model.ShortcutCommand

type ListMeta struct {
	ObjectID   int64   `json:"object_id"`
	SpaceID    int64   `json:"space_id"`
	IsOnline   int32   `json:"is_online"`
	CommandIDs []int64 `json:"command_ids"`
}
