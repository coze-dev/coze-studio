package entity

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
)

type VariableInfos []*VariableInfo

type VariableInfo struct {
	*kvmemory.VariableInfo
}

func (v VariableInfos) ToVariableInfos() []*kvmemory.VariableInfo {
	vars := make([]*kvmemory.VariableInfo, 0)
	for _, vv := range v {
		vars = append(vars, vv.VariableInfo)
	}

	return vars
}

const stringSchema = "{\n    \"type\": \"string\",\n    \"name\": \"%v\",\n    \"required\": false\n}"

func (v VariableInfos) ToVariables() []*project_memory.Variable {
	vars := make([]*project_memory.Variable, 0)
	for _, vv := range v {
		if vv == nil || vv.VariableInfo == nil {
			continue
		}

		vars = append(vars, &project_memory.Variable{
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

	return vars
}

func (v VariableInfos) ToGroupVariableInfos() []*kvmemory.GroupVariableInfo {
	groups := make(map[string]*kvmemory.GroupVariableInfo)

	for _, variable := range v {
		if variable == nil || variable.VariableInfo == nil {
			continue
		}

		groupName := variable.VariableInfo.GroupName
		if groupName == "" {
			groupName = "未分组" // 处理空分组名
		}

		if _, ok := groups[groupName]; !ok {
			groups[groupName] = &kvmemory.GroupVariableInfo{
				GroupName:   groupName,
				VarInfoList: []*kvmemory.VariableInfo{},
			}
		}
		groups[groupName].VarInfoList = append(groups[groupName].VarInfoList, variable.VariableInfo)
	}

	// 转换为切片并按组名排序
	result := make([]*kvmemory.GroupVariableInfo, 0, len(groups))
	for _, group := range groups {
		result = append(result, group)
	}

	// 可选：按组名排序
	// sort.Slice(result, func(i, j int) bool {
	//     return result[i].GroupName < result[j].GroupName
	// })

	return result
}
