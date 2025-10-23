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

package impl

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/kvmemory"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	crossvariables "github.com/coze-dev/coze-studio/backend/crossdomain/variables"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/variables/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
	variables "github.com/coze-dev/coze-studio/backend/domain/memory/variables/service"
)

var defaultSVC crossvariables.Variables

type impl struct {
	DomainSVC variables.Variables
}

func InitDomainService(c variables.Variables) crossvariables.Variables {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (s *impl) GetVariableInstance(ctx context.Context, e *model.UserVariableMeta, keywords []string) ([]*kvmemory.KVItem, error) {
	m := entity.NewUserVariableMeta(e)
	return s.DomainSVC.GetVariableInstance(ctx, m, keywords)
}

func (s *impl) SetVariableInstance(ctx context.Context, e *model.UserVariableMeta, items []*kvmemory.KVItem) ([]string, error) {
	m := entity.NewUserVariableMeta(e)
	return s.DomainSVC.SetVariableInstance(ctx, m, items)
}

func (s *impl) DecryptSysUUIDKey(ctx context.Context, encryptSysUUIDKey string) *model.UserVariableMeta {
	m := s.DomainSVC.DecryptSysUUIDKey(ctx, encryptSysUUIDKey)
	if m == nil {
		return nil
	}

	return &model.UserVariableMeta{
		BizType:      m.BizType,
		BizID:        m.BizID,
		Version:      m.Version,
		ConnectorUID: m.ConnectorUID,
		ConnectorID:  m.ConnectorID,
	}
}

func (s *impl) GetVariableChannelInstance(ctx context.Context, e *model.UserVariableMeta, keywords []string, varChannel *project_memory.VariableChannel) ([]*kvmemory.KVItem, error) {
	m := entity.NewUserVariableMeta(e)
	return s.DomainSVC.GetVariableChannelInstance(ctx, m, keywords, varChannel)
}

func (s *impl) GetProjectVariablesMeta(ctx context.Context, projectID string, version string) (*entity.VariablesMeta, error) {
	return s.DomainSVC.GetProjectVariablesMeta(ctx, projectID, version)
}

func (s *impl) GetAgentVariableMeta(ctx context.Context, agentID int64, version string) (*entity.VariablesMeta, error) {
	return s.DomainSVC.GetAgentVariableMeta(ctx, agentID, version)
}
