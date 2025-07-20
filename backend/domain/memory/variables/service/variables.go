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

package service

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/api/model/kvmemory"
	"github.com/coze-dev/coze-studio/backend/api/model/project_memory"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
)

type Variables interface {
	GetVariableMeta(ctx context.Context, bizID string, bizType project_memory.VariableConnector, version string) (*entity.VariablesMeta, error)
	GetVariableMetaByID(ctx context.Context, id int64) (*entity.VariablesMeta, error)
	GetAgentVariableMeta(ctx context.Context, agentID int64, version string) (*entity.VariablesMeta, error)
	GetProjectVariablesMeta(ctx context.Context, projectID, version string) (*entity.VariablesMeta, error)
	GetSysVariableConf(ctx context.Context) entity.SysConfVariables
	UpsertMeta(ctx context.Context, e *entity.VariablesMeta) (int64, error)
	UpsertProjectMeta(ctx context.Context, projectID, version string, userID int64, e *entity.VariablesMeta) (int64, error)
	UpsertBotMeta(ctx context.Context, agentID int64, version string, userID int64, e *entity.VariablesMeta) (int64, error)
	PublishMeta(ctx context.Context, variableMetaID int64, version string) (int64, error)

	SetVariableInstance(ctx context.Context, e *entity.UserVariableMeta, items []*kvmemory.KVItem) ([]string, error)
	GetVariableInstance(ctx context.Context, e *entity.UserVariableMeta, keywords []string) ([]*kvmemory.KVItem, error)
	GetVariableChannelInstance(ctx context.Context, e *entity.UserVariableMeta, keywords []string, varChannel *project_memory.VariableChannel) ([]*kvmemory.KVItem, error)
	DeleteVariableInstance(ctx context.Context, e *entity.UserVariableMeta, keywords []string) error
	DeleteAllVariable(ctx context.Context, bizType project_memory.VariableConnector, bizID string) (err error)

	DecryptSysUUIDKey(ctx context.Context, encryptSysUUIDKey string) *entity.VariableInstance
}
