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
	"sort"
	"strings"

	"github.com/coze-dev/coze-studio/backend/api/model/kvmemory"
	"github.com/coze-dev/coze-studio/backend/api/model/project_memory"
)

type SysConfVariables []*kvmemory.VariableInfo

func (v SysConfVariables) ToVariables() *VariablesMeta {
	vars := make([]*VariableMeta, 0)
	for _, vv := range v {
		if vv == nil {
			continue
		}

		tmp := &VariableMeta{
			Keyword:              vv.Key,
			Description:          vv.Description,
			DefaultValue:         vv.DefaultValue,
			VariableType:         project_memory.VariableType_KVVariable,
			Channel:              project_memory.VariableChannel_System,
			IsReadOnly:           true,
			EffectiveChannelList: vv.EffectiveChannelList,
		}
		tmp.SetupSchema()
		vars = append(vars, tmp)
	}

	return &VariablesMeta{
		Variables: vars,
	}
}

func (v SysConfVariables) GroupByName() []*kvmemory.GroupVariableInfo {
	groups := make(map[string]*kvmemory.GroupVariableInfo)

	for _, variable := range v {
		if variable == nil {
			continue
		}

		groupName := variable.GroupName
		if groupName == "" {
			groupName = "未分组" // Handling empty group names
		}

		if _, ok := groups[groupName]; !ok {
			groups[groupName] = &kvmemory.GroupVariableInfo{
				GroupName:   groupName,
				GroupDesc:   variable.GroupDesc,
				VarInfoList: []*kvmemory.VariableInfo{},
			}
		}

		groups[groupName].VarInfoList = append(groups[groupName].VarInfoList, variable)
	}

	// Convert to slices and sort by group name
	result := make([]*kvmemory.GroupVariableInfo, 0, len(groups))
	for _, group := range groups {
		result = append(result, group)
	}

	// Optional: sort by group name
	sort.Slice(result, func(i, j int) bool {
		return result[i].GroupName < result[j].GroupName
	})

	return result
}

func (v SysConfVariables) RemoveLocalChannelVariable() SysConfVariables {
	var res []*kvmemory.VariableInfo
	for _, vv := range v {
		ch := v.genChannelFromName(vv.Key)
		if ch == project_memory.VariableChannel_Location {
			continue
		}

		res = append(res, vv)
	}

	return res
}

func (v SysConfVariables) genChannelFromName(name string) project_memory.VariableChannel {
	if strings.Contains(name, "lark") {
		return project_memory.VariableChannel_Feishu
	} else if strings.Contains(name, "lon") || strings.Contains(name, "lat") {
		return project_memory.VariableChannel_Location
	}
	return project_memory.VariableChannel_System
}
