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

package workflow

import (
	workflowModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
)

const (
	// DefaultListWorkflowExecutionLimit defines the fallback pagination limit when the caller does not specify one.
	DefaultListWorkflowExecutionLimit = 50
	// MaxListWorkflowExecutionLimit caps the number of executions returned in a single request to protect storage.
	MaxListWorkflowExecutionLimit = 200
)

// ListWorkflowExecutionPolicy describes the filter conditions when listing workflow execution records.
type ListWorkflowExecutionPolicy struct {
	WorkflowID      int64
	StartAtMilli    int64
	EndAtMilli      int64
	Statuses        []entity.WorkflowExecuteStatus
	Modes           []workflowModel.ExecuteMode
	InputLike       string
	Limit           int
	Offset          int
	DescByStartTime bool
}

// Normalize prepares the policy with sane defaults and bounds.
func (p *ListWorkflowExecutionPolicy) Normalize() {
	if p == nil {
		return
	}
	if p.Limit <= 0 {
		p.Limit = DefaultListWorkflowExecutionLimit
	}
	if p.Limit > MaxListWorkflowExecutionLimit {
		p.Limit = MaxListWorkflowExecutionLimit
	}
	if p.Offset < 0 {
		p.Offset = 0
	}
	if p.EndAtMilli > 0 && p.StartAtMilli > 0 && p.EndAtMilli < p.StartAtMilli {
		p.EndAtMilli = p.StartAtMilli
	}
}
