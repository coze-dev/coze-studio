package application

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/memory"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type VariableApplicationService struct{}

var VariableSVC = VariableApplicationService{}

func (v *VariableApplicationService) GetSysVariableConf(ctx context.Context, req *memory.GetSysVariableConfRequest) (*memory.GetSysVariableConfResponse, error) {
	vars := variablesDomainSVC.GetSysVariableConf(ctx)

	return &memory.GetSysVariableConfResponse{
		Conf:      vars.ToVariableInfos(),
		GroupConf: vars.ToGroupVariableInfos(),
	}, nil
}

func (v *VariableApplicationService) GetProjectVariableList(ctx context.Context, req *memory.GetProjectVariableListReq) (*memory.GetProjectVariableListResp, error) {
	// TODO:  后面再确认这个鉴权要不要
	// GetProjectKvMemoryHandler - checkParamsAndParams
	// CheckResourceOperatePermissionV2  鉴权

	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	version := ""
	if req.Version != 0 {
		version = fmt.Sprintf("%d", req.Version)
	}

	data, err := variablesDomainSVC.GetProjectVariableList(ctx, req.ProjectID, version)
	if err != nil {
		return nil, err
	}

	return &memory.GetProjectVariableListResp{
		VariableList: data.Variables,
		CanEdit:      *uid == req.UserID, // TODO: 协同编辑的用户也要判断
	}, nil
}

func (*VariableApplicationService) UpdateProjectVariable(ctx context.Context, req memory.UpdateProjectVariableReq) (*memory.UpdateProjectVariableResp, error) {
	return nil, nil
}
