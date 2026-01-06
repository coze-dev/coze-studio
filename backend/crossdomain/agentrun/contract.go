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

package crossagentrun

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
)

//go:generate  mockgen -destination agentrunmock/agent_run_mock.go --package agentrunmock -source agent_run.go
type AgentRun interface {
	Delete(ctx context.Context, runID []int64) error
	List(ctx context.Context, ListMeta *entity.ListRunRecordMeta) ([]*entity.RunRecordMeta, error)
	Create(ctx context.Context, runRecord *entity.AgentRunMeta) (*entity.RunRecordMeta, error)
}

var defaultSVC AgentRun

func DefaultSVC() AgentRun {
	return defaultSVC
}

func SetDefaultSVC(svc AgentRun) {
	defaultSVC = svc
}
