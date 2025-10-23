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
	model "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
)

type Slice = model.Slice

type WhereSliceOpt struct {
	KnowledgeID int64
	DocumentID  int64
	DocumentIDs []int64
	Keyword     *string
	PageSize    int64
	Offset      int64
	NotEmpty    *bool
}

type WherePhotoSliceOpt struct {
	KnowledgeID int64
	DocumentIDs []int64
	Limit       *int
	Offset      *int
	HasCaption  *bool
}
