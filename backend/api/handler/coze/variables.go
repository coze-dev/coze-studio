package coze

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	projectMemory "code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/application"
)

// GetSysVariableConf .
// @router /api/memory/sys_variable_conf [GET]
func GetSysVariableConf(ctx context.Context, c *app.RequestContext) {
	var err error
	var req kvmemory.GetSysVariableConfRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp, err := application.VariableSVC.GetSysVariableConf(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}

// GetProjectVariableList .
// @router /api/memory/project/variable/meta_list [GET]
func GetProjectVariableList(ctx context.Context, c *app.RequestContext) {
	var err error
	var req projectMemory.GetProjectVariableListReq
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	if req.ProjectID == "" {
		invalidParamRequestResponse(c, "project_id is empty")
		return
	}

	resp, err := application.VariableSVC.GetProjectVariableList(ctx, &req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	c.JSON(consts.StatusOK, resp)
}

// UpdateProjectVariable .
// @router /api/memory/project/variable/meta_update [POST]
func UpdateProjectVariable(ctx context.Context, c *app.RequestContext) {
	var err error
	var req projectMemory.UpdateProjectVariableReq
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	if req.ProjectID == "" {
		invalidParamRequestResponse(c, "project_id is empty")
		return
	}

	key2Var := make(map[string]*projectMemory.Variable)
	for _, v := range req.VariableList {
		if v.Keyword == "" {
			invalidParamRequestResponse(c, "variable name is empty")
			return
		}

		if key2Var[v.Keyword] != nil {
			invalidParamRequestResponse(c, "variable keyword is duplicate")
			return
		}

		key2Var[v.Keyword] = v
	}

	resp, err := application.VariableSVC.UpdateProjectVariable(ctx, req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}

// SetKvMemory .
// @router /api/memory/variable/upsert [POST]
func SetKvMemory(ctx context.Context, c *app.RequestContext) {
	var err error
	var req kvmemory.SetKvMemoryReq
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	if len(req.GetProjectID()) > 0 {
	}

	resp := new(kvmemory.SetKvMemoryResp)

	c.JSON(consts.StatusOK, resp)
}
