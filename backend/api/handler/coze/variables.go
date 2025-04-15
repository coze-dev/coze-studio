package coze

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"code.byted.org/flow/opencoze/backend/api/model/memory"
	"code.byted.org/flow/opencoze/backend/application"
)

// GetSysVariableConf .
// @router /api/memory/sys_variable_conf [GET]
func GetSysVariableConf(ctx context.Context, c *app.RequestContext) {
	var err error
	var req memory.GetSysVariableConfRequest
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
	var req memory.GetProjectVariableListReq
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
	var req memory.UpdateProjectVariableReq
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(memory.UpdateProjectVariableResp)

	c.JSON(consts.StatusOK, resp)
}
