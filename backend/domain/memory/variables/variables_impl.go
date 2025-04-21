package variables

import (
	"context"
	"sort"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type variablesImpl struct {
	*dal.VariablesDAO
}

func NewService(db *gorm.DB, generator idgen.IDGenerator) Variables {
	dao := dal.NewDAO(db, generator)
	return &variablesImpl{
		VariablesDAO: dao,
	}
}

func (v *variablesImpl) GetSysVariableConf(ctx context.Context) entity.VariableInfos {
	vars := make([]*entity.VariableInfo, 0)
	vars = append(vars, &entity.VariableInfo{
		VariableInfo: &kvmemory.VariableInfo{
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

	if data == nil {
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
	po, err := v.VariablesDAO.GetProjectVariable(ctx, projectID, version)
	if err != nil {
		return nil, err
	}

	if po == nil {
		return nil, nil
	}

	return &entity.ProjectVariable{
		VariablesMeta: po, // po maybe nil
	}, nil
}

func (v *variablesImpl) UpsertProjectMeta(ctx context.Context, projectID, version string, userID int64, e *entity.Variables) error {
	// TODO: 机审 rpc.VariableAudit
	meta, err := v.GetProjectVariables(ctx, projectID, "")
	if err != nil {
		return err
	}

	po := &entity.ProjectVariable{
		VariablesMeta: &model.VariablesMeta{
			BizID:        projectID,
			Version:      version,
			CreatorID:    userID,
			VariableList: e.Variables,
		},
	}

	if meta == nil {
		_, err = v.VariablesDAO.CreateProjectVariable(ctx, po.VariablesMeta)
		return err
	}

	po.ID = meta.ID
	return v.VariablesDAO.UpdateProjectVariable(ctx, po.VariablesMeta)
}

func (*variablesImpl) setupSchema(ctx context.Context, variablesList []*project_memory.Variable) []*project_memory.Variable {
	for _, variable := range variablesList {
		if variable.Channel == project_memory.VariableChannel_Feishu ||
			variable.Channel == project_memory.VariableChannel_Location ||
			variable.Channel == project_memory.VariableChannel_System {
			variable.IsReadOnly = true
		}
	}
	return variablesList
}

func (*variablesImpl) mergeVariableList(ctx context.Context, sysVarsList, variablesList []*project_memory.Variable) []*project_memory.Variable {
	mergedMap := make(map[string]*project_memory.Variable)
	for _, sysVar := range sysVarsList {
		mergedMap[sysVar.Keyword] = sysVar
	}

	// 可以覆盖 sysVar
	for _, variable := range variablesList {
		mergedMap[variable.Keyword] = variable
	}

	res := make([]*project_memory.Variable, 0)
	for _, variable := range mergedMap {
		res = append(res, variable)
	}

	sort.Slice(res, func(i, j int) bool {
		if res[i].Channel == project_memory.VariableChannel_System && !(res[j].Channel == project_memory.VariableChannel_System) {
			return false
		}
		if !(res[i].Channel == project_memory.VariableChannel_System) && res[j].Channel == project_memory.VariableChannel_System {
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
