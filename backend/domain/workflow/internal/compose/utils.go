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

package compose

import (
	"fmt"
	"reflect"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

func getKeyOrZero[T any](key string, cfg any) T {
	var zero T
	if cfg == nil {
		return zero
	}

	m, ok := cfg.(map[string]any)
	if !ok {
		panic(fmt.Sprintf("m is not a map[string]any, actual type: %v", reflect.TypeOf(cfg)))
	}

	if len(m) == 0 {
		return zero
	}

	if v, ok := m[key]; ok {
		return v.(T)
	}

	return zero
}

func mustGetKey[T any](key string, cfg any) T {
	if cfg == nil {
		panic(fmt.Sprintf("mustGetKey[*any] is nil, key=%s", key))
	}

	m, ok := cfg.(map[string]any)
	if !ok {
		panic(fmt.Sprintf("m is not a map[string]any, actual type: %v", reflect.TypeOf(cfg)))
	}

	if _, ok := m[key]; !ok {
		panic(fmt.Sprintf("key %s does not exist in map: %v", key, m))
	}

	v, ok := m[key].(T)
	if !ok {
		panic(fmt.Sprintf("key %s is not a %v, actual type: %v", key, reflect.TypeOf(v), reflect.TypeOf(m[key])))
	}

	return v
}

func (s *NodeSchema) SetConfigKV(key string, value any) {
	if s.Configs == nil {
		s.Configs = make(map[string]any)
	}

	s.Configs.(map[string]any)[key] = value
}

func (s *NodeSchema) SetInputType(key string, t *vo.TypeInfo) {
	if s.InputTypes == nil {
		s.InputTypes = make(map[string]*vo.TypeInfo)
	}
	s.InputTypes[key] = t
}

func (s *NodeSchema) AddInputSource(info ...*vo.FieldInfo) {
	s.InputSources = append(s.InputSources, info...)
}

func (s *NodeSchema) SetOutputType(key string, t *vo.TypeInfo) {
	if s.OutputTypes == nil {
		s.OutputTypes = make(map[string]*vo.TypeInfo)
	}
	s.OutputTypes[key] = t
}

func (s *NodeSchema) AddOutputSource(info ...*vo.FieldInfo) {
	s.OutputSources = append(s.OutputSources, info...)
}

func (s *NodeSchema) GetSubWorkflowIdentity() (int64, string, bool) {
	if s.Type != entity.NodeTypeSubWorkflow {
		return 0, "", false
	}

	return mustGetKey[int64]("WorkflowID", s.Configs), mustGetKey[string]("WorkflowVersion", s.Configs), true
}
