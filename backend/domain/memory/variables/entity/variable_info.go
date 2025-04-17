package entity

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/memory"
	"code.byted.org/flow/opencoze/backend/api/model/memory_common"
)

type VariableInfos []*VariableInfo

type VariableInfo struct {
	*memory.VariableInfo
}

func (v VariableInfos) ToVariableInfos() []*memory.VariableInfo {
	vars := make([]*memory.VariableInfo, 0)
	for _, vv := range v {
		vars = append(vars, vv.VariableInfo)
	}

	return vars
}

const stringSchema = "{\n    \"type\": \"string\",\n    \"name\": \"%v\",\n    \"required\": false\n}"

func (v VariableInfos) ToVariables() []*memory_common.Variable {
	vars := make([]*memory_common.Variable, 0)
	for _, vv := range v {
		if vv == nil || vv.VariableInfo == nil {
			continue
		}

		vars = append(vars, &memory_common.Variable{
			Keyword:              vv.Key,
			Description:          vv.Description,
			DefaultValue:         vv.DefaultValue,
			VariableType:         memory_common.VariableType_KVVariable,
			Channel:              memory_common.VariableChannel_System,
			IsReadOnly:           true,
			Schema:               fmt.Sprintf(stringSchema, vv.Key),
			EffectiveChannelList: vv.EffectiveChannelList,
		})
	}

	return vars
}

func (v VariableInfos) ToGroupVariableInfos() []*memory.GroupVariableInfo {
	groups := make(map[string]*memory.GroupVariableInfo)

	for _, variable := range v {
		if variable == nil || variable.VariableInfo == nil {
			continue
		}

		groupName := variable.VariableInfo.GroupName
		if groupName == "" {
			groupName = "未分组" // 处理空分组名
		}

		if _, ok := groups[groupName]; !ok {
			groups[groupName] = &memory.GroupVariableInfo{
				GroupName:   groupName,
				VarInfoList: []*memory.VariableInfo{},
			}
		}
		groups[groupName].VarInfoList = append(groups[groupName].VarInfoList, variable.VariableInfo)
	}

	// 转换为切片并按组名排序
	result := make([]*memory.GroupVariableInfo, 0, len(groups))
	for _, group := range groups {
		result = append(result, group)
	}

	// 可选：按组名排序
	// sort.Slice(result, func(i, j int) bool {
	//     return result[i].GroupName < result[j].GroupName
	// })

	return result
}
