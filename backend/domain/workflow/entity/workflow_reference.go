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
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type WorkflowReference struct {
	ID int64
	WorkflowReferenceKey
	CreatedAt time.Time
	Enabled   bool
}

type WorkflowReferenceKey struct {
	ReferredID  int64
	ReferringID int64
	vo.ReferType
	vo.ReferringBizType
}
