package variables

import (
	"context"
	"fmt"
	"sort"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
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

func (v *variablesImpl) GetSysVariableConf(_ context.Context) entity.SysConfVariables {
	vars := make([]*kvmemory.VariableInfo, 0)
	vars = append(vars, &kvmemory.VariableInfo{
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
	})

	return vars
}

func (v *variablesImpl) GetProjectVariableList(ctx context.Context, projectID, version string) (*entity.Variables, error) {
	data, err := v.VariablesDAO.GetProjectVariable(ctx, projectID, version)
	if err != nil {
		return nil, err
	}

	sysVariableList := v.GetSysVariableConf(ctx).ToVariables()
	sysVariableList.FilterLocalChannel(ctx)

	if data == nil {
		return sysVariableList, nil
	}

	resVariableList := v.mergeVariableList(ctx, sysVariableList.Variables, data.VariableList)
	resVariableList.SetupSchema(ctx)
	resVariableList.SetupIsReadOnly(ctx)

	return resVariableList, nil
}

func (v *variablesImpl) UpsertProjectMeta(ctx context.Context, projectID, version string, userID int64, e *entity.Variables) (int64, error) {
	return v.upsertVariableMeta(ctx, projectID, project_memory.VariableConnector_Project, version, userID, e)
}

func (v *variablesImpl) UpsertBotMeta(ctx context.Context, agentID int64, version string, userID int64, e *entity.Variables) (int64, error) {
	bizID := fmt.Sprintf("%d", agentID)
	return v.upsertVariableMeta(ctx, bizID, project_memory.VariableConnector_Bot, version, userID, e)
}

func (v *variablesImpl) upsertVariableMeta(ctx context.Context, bizID string, bizType project_memory.VariableConnector, version string, userID int64, e *entity.Variables) (int64, error) {
	// TODO: 机审 rpc.VariableAudit
	meta, err := v.VariablesDAO.GetVariableMeta(ctx, bizID, bizType, version)
	if err != nil {
		return 0, err
	}

	po := &model.VariablesMeta{
		BizID:        bizID,
		Version:      version,
		CreatorID:    int64(userID),
		BizType:      int32(bizType),
		VariableList: e.Variables,
	}

	if meta == nil {
		return v.VariablesDAO.CreateVariableMeta(ctx, po, bizType)
	}

	po.ID = meta.ID
	err = v.VariablesDAO.UpdateProjectVariable(ctx, po, bizType)
	if err != nil {
		return 0, err
	}

	return meta.ID, nil
}

func (*variablesImpl) mergeVariableList(_ context.Context, sysVarsList, variablesList []*entity.Variable) *entity.Variables {
	mergedMap := make(map[string]*entity.Variable)
	for _, sysVar := range sysVarsList {
		mergedMap[sysVar.Keyword] = sysVar
	}

	// 可以覆盖 sysVar
	for _, variable := range variablesList {
		mergedMap[variable.Keyword] = variable
	}

	res := make([]*entity.Variable, 0)
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

	return &entity.Variables{
		Variables: res,
	}
}

func (v *variablesImpl) GetAgentVariableMeta(ctx context.Context, agentID int64, version string) (*entity.Variables, error) {
	bizID := fmt.Sprintf("%d", agentID)
	return v.GetVariableMeta(ctx, bizID, project_memory.VariableConnector_Bot, version)
}

func (v *variablesImpl) GetVariableMetaByID(ctx context.Context, id int64) (*entity.Variables, error) {
	po, err := v.VariablesDAO.GetVariableMetaByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if po == nil {
		return nil, nil
	}

	return &entity.Variables{Variables: po.VariableList}, nil
}

func (v *variablesImpl) GetVariableMeta(ctx context.Context, bizID string, bizType project_memory.VariableConnector, version string) (*entity.Variables, error) {
	var err error
	var vars *entity.Variables
	if bizType == project_memory.VariableConnector_Project {
		vars, err = v.GetProjectVariableList(ctx, bizID, version)
		if err != nil {
			return nil, err
		}
	} else {
		po, err := v.VariablesDAO.GetVariableMeta(ctx, bizID, bizType, version)
		if err != nil {
			return nil, err
		}

		if po == nil {
			return nil, errorx.New(errno.ErrVariableMetaNotFoundCode)
		}

		vars = &entity.Variables{Variables: po.VariableList}
	}

	return vars, nil
}
