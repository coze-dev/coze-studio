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

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/variables"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/kvmemory"

	crossvariables "github.com/coze-dev/coze-studio/backend/crossdomain/contract/variables"
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
