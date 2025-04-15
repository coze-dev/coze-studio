package memory

import (
	"context"
	"sort"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/memory"
	"code.byted.org/flow/opencoze/backend/api/model/memory_common"
	"code.byted.org/flow/opencoze/backend/domain/memory/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type variablesImpl struct {
	*dal.MemoryDAO
}

func NewService(db *gorm.DB, generator idgen.IDGenerator) Variables {
	dao := dal.NewDAO(db, generator)
	return &variablesImpl{
		MemoryDAO: dao,
	}
}

func (v *variablesImpl) GetSysVariableConf(ctx context.Context) entity.VariableInfos {
	vars := make([]*entity.VariableInfo, 0)
	vars = append(vars, &entity.VariableInfo{
		VariableInfo: &memory.VariableInfo{
			Key:                  "sys_uuid",
			Description:          "用户唯一ID",
			DefaultValue:         "",
			Example:              "",
			ExtDesc:              "",
			GroupDesc:            "",
			GroupExtDesc:         "",
			GroupName:            "用户信息",
			Sensitive:            "false",
			CanWrite:             "false",
			MustNotUseInPrompt:   "false",
			EffectiveChannelList: []string{"全渠道"},
		},
	})

	return vars
}

func (v *variablesImpl) GetProjectVariableList(ctx context.Context, projectID, version string) (*entity.Variables, error) {
	data, err := v.GetProjectVariables(ctx, projectID, version)
	if err != nil {
		return nil, err
	}

	sysVarsList := v.GetSysVariableConf(ctx).ToVariables()
	sysVariableList := entity.NewVariables(sysVarsList)
	sysVariableList.FilterLocalChannel(ctx)

	if len(data.VariableList) == 0 {
		return sysVariableList, nil
	}

	userVariablesList := entity.NewVariables(data.VariableList)

	variablesList := v.mergeVariableList(ctx, sysVarsList, userVariablesList.Variables)

	resVariableList := entity.NewVariables(variablesList)
	resVariableList.SetupSchema(ctx)
	resVariableList.SetupIsReadOnly(ctx)

	return resVariableList, nil
}

func (v *variablesImpl) GetProjectVariables(ctx context.Context, projectID, version string) (*entity.ProjectVariable, error) {
	po, err := v.MemoryDAO.GetProjectVariables(ctx, projectID, version)
	if err != nil {
		return nil, err
	}

	return &entity.ProjectVariable{
		ProjectVariable: po, // po maybe nil
	}, nil
}

func (*variablesImpl) setupSchema(ctx context.Context, variablesList []*memory_common.Variable) []*memory_common.Variable {
	for _, variable := range variablesList {
		if variable.Channel == memory_common.VariableChannel_Feishu ||
			variable.Channel == memory_common.VariableChannel_Location ||
			variable.Channel == memory_common.VariableChannel_System {
			variable.IsReadOnly = true
		}
	}
	return variablesList
}

func (*variablesImpl) mergeVariableList(ctx context.Context, sysVarsList, variablesList []*memory_common.Variable) []*memory_common.Variable {
	mergedMap := make(map[string]*memory_common.Variable)
	for _, sysVar := range sysVarsList {
		mergedMap[sysVar.Keyword] = sysVar
	}

	// 可以覆盖 sysVar
	for _, variable := range variablesList {
		mergedMap[variable.Keyword] = variable
	}

	res := make([]*memory_common.Variable, 0)
	for _, variable := range mergedMap {
		res = append(res, variable)
	}

	sort.Slice(res, func(i, j int) bool {
		if res[i].Channel == memory_common.VariableChannel_System && !(res[j].Channel == memory_common.VariableChannel_System) {
			return false
		}
		if !(res[i].Channel == memory_common.VariableChannel_System) && res[j].Channel == memory_common.VariableChannel_System {
			return true
		}
		indexI := -1
		indexJ := -1

		for index, s := range sysVarsList {
			if s.Keyword == res[i].Keyword {
				indexI = index
			}
			if s.Keyword == res[j].Keyword {
				indexJ = index
			}
		}

		for index, s := range variablesList {
			if s.Keyword == res[i].Keyword && indexI < 0 {
				indexI = index
			}
			if s.Keyword == res[j].Keyword && indexJ < 0 {
				indexJ = index
			}
		}
		return indexI < indexJ
	})

	return res
}
