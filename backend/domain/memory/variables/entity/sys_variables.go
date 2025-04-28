package entity

import (
	"fmt"
	"sort"
	"strings"

	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
)

type SysConfVariables []*kvmemory.VariableInfo

const stringSchema = "{\n    \"type\": \"string\",\n    \"name\": \"%v\",\n    \"required\": false\n}"

func (v SysConfVariables) ToVariables() *VariablesMeta {
	vars := make([]*VariableMeta, 0)
	for _, vv := range v {
		if vv == nil {
			continue
		}

		vars = append(vars, &VariableMeta{
			Keyword:              vv.Key,
			Description:          vv.Description,
			DefaultValue:         vv.DefaultValue,
			VariableType:         project_memory.VariableType_KVVariable,
			Channel:              project_memory.VariableChannel_System,
			IsReadOnly:           true,
			Schema:               fmt.Sprintf(stringSchema, vv.Key),
			EffectiveChannelList: vv.EffectiveChannelList,
		})
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
			groupName = "未分组" // 处理空分组名
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

	// 转换为切片并按组名排序
	result := make([]*kvmemory.GroupVariableInfo, 0, len(groups))
	for _, group := range groups {
		result = append(result, group)
	}

	// 可选：按组名排序
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
