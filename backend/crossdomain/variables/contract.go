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

package variables

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/kvmemory"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	variables "github.com/coze-dev/coze-studio/backend/crossdomain/variables/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
)

// TODO (@fanlv): Parameter references need to be modified.
type Variables interface {
	GetVariableInstance(ctx context.Context, e *variables.UserVariableMeta, keywords []string) ([]*kvmemory.KVItem, error)
	SetVariableInstance(ctx context.Context, e *variables.UserVariableMeta, items []*kvmemory.KVItem) ([]string, error)
	DecryptSysUUIDKey(ctx context.Context, encryptSysUUIDKey string) *variables.UserVariableMeta
	GetVariableChannelInstance(ctx context.Context, e *variables.UserVariableMeta, keywords []string, varChannel *project_memory.VariableChannel) ([]*kvmemory.KVItem, error)
	GetProjectVariablesMeta(ctx context.Context, projectID, version string) (*entity.VariablesMeta, error)
	GetAgentVariableMeta(ctx context.Context, agentID int64, version string) (*entity.VariablesMeta, error)
}

var defaultSVC Variables

func DefaultSVC() Variables {
	return defaultSVC
}

func SetDefaultSVC(svc Variables) {
	defaultSVC = svc
}
