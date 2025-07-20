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
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/project_memory"
)

type VariableMeta struct {
	Keyword              string
	DefaultValue         string
	VariableType         project_memory.VariableType
	Channel              project_memory.VariableChannel
	Description          string
	Enable               bool
	EffectiveChannelList []string
	Schema               string
	IsReadOnly           bool
	PromptDisabled       bool
}

func NewVariableMeta(e *project_memory.Variable) *VariableMeta {
	return &VariableMeta{
		Keyword:              e.Keyword,
		DefaultValue:         e.DefaultValue,
		VariableType:         e.VariableType,
		Channel:              e.Channel,
		Description:          e.Description,
		Enable:               e.Enable,
		EffectiveChannelList: e.EffectiveChannelList,
		Schema:               e.Schema,
		IsReadOnly:           e.IsReadOnly,
	}
}

func (v *VariableMeta) ToProjectVariable() *project_memory.Variable {
	return &project_memory.Variable{
		Keyword:              v.Keyword,
		DefaultValue:         v.DefaultValue,
		VariableType:         v.VariableType,
		Channel:              v.Channel,
		Description:          v.Description,
		Enable:               v.Enable,
		EffectiveChannelList: v.EffectiveChannelList,
		Schema:               v.Schema,
		IsReadOnly:           v.IsReadOnly,
	}
}

func (v *VariableMeta) GetSchema(ctx context.Context) (*VariableMetaSchema, error) {
	return NewVariableMetaSchema([]byte(v.Schema))
}

func (v *VariableMeta) CheckSchema(ctx context.Context) error {
	schema, err := NewVariableMetaSchema([]byte(v.Schema))
	if err != nil {
		return err
	}

	return schema.check(ctx)
}

const stringSchema = "{\n    \"type\": \"string\",\n    \"name\": \"%v\",\n    \"required\": false\n}"

func (v *VariableMeta) SetupSchema() {
	if v.Schema == "" {
		v.Schema = fmt.Sprintf(stringSchema, v.Keyword)
	}
}

func (v *VariableMeta) SetupIsReadOnly() {
	if v.Channel == project_memory.VariableChannel_Feishu ||
		v.Channel == project_memory.VariableChannel_Location ||
		v.Channel == project_memory.VariableChannel_System {
		v.IsReadOnly = true
	}
}

func (v *VariableMeta) IsSystem() bool {
	return v.Channel == project_memory.VariableChannel_System
}
