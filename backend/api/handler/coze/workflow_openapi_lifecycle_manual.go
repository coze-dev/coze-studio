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

package coze

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	appworkflow "github.com/coze-dev/coze-studio/backend/application/workflow"
)

// OpenAPIGetWorkflowDetail .
// @router /v1/workflows/:workflow_id/detail [GET]
func OpenAPIGetWorkflowDetail(ctx context.Context, c *app.RequestContext) {
	var req workflow.OpenAPIGetWorkflowDetailRequest
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	req.WorkflowID = c.Param("workflow_id")
	if req.WorkflowID == "" {
		invalidParamRequestResponse(c, "workflow_id is required")
		return
	}
	if req.SpaceID == "" {
		invalidParamRequestResponse(c, "space_id is required")
		return
	}

	resp, err := appworkflow.SVC.OpenAPIGetWorkflowDetail(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}

// OpenAPIUpdateWorkflow .
// @router /v1/workflows/:workflow_id [PUT]
func OpenAPIUpdateWorkflow(ctx context.Context, c *app.RequestContext) {
	var req workflow.OpenAPIUpdateWorkflowRequest
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	req.WorkflowID = c.Param("workflow_id")
	if req.WorkflowID == "" {
		invalidParamRequestResponse(c, "workflow_id is required")
		return
	}
	if req.SpaceID == "" {
		invalidParamRequestResponse(c, "space_id is required")
		return
	}
	if !req.IsSetName() && !req.IsSetDescription() && !req.IsSetIconURI() &&
		!req.IsSetFlowMode() && !req.IsSetSchema() && !req.IsSetValidate() {
		invalidParamRequestResponse(c, "at least one of name, description, icon_uri, flow_mode, schema or validate must be provided")
		return
	}

	resp, err := appworkflow.SVC.OpenAPIUpdateWorkflow(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}

// OpenAPIPublishWorkflow .
// @router /v1/workflows/:workflow_id/publish [POST]
func OpenAPIPublishWorkflow(ctx context.Context, c *app.RequestContext) {
	var req workflow.OpenAPIPublishWorkflowRequest
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	req.WorkflowID = c.Param("workflow_id")
	if req.WorkflowID == "" {
		invalidParamRequestResponse(c, "workflow_id is required")
		return
	}
	if req.SpaceID == "" {
		invalidParamRequestResponse(c, "space_id is required")
		return
	}
	if req.GetWorkflowVersion() == "" {
		invalidParamRequestResponse(c, "workflow_version is required")
		return
	}

	resp, err := appworkflow.SVC.OpenAPIPublishWorkflow(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}

// OpenAPIDeleteWorkflow .
// @router /v1/workflows/:workflow_id [DELETE]
func OpenAPIDeleteWorkflow(ctx context.Context, c *app.RequestContext) {
	var req workflow.OpenAPIDeleteWorkflowRequest
	if err := c.BindAndValidate(&req); err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	req.WorkflowID = c.Param("workflow_id")
	if req.WorkflowID == "" {
		invalidParamRequestResponse(c, "workflow_id is required")
		return
	}
	if req.SpaceID == "" {
		invalidParamRequestResponse(c, "space_id is required")
		return
	}

	resp, err := appworkflow.SVC.OpenAPIDeleteWorkflow(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}
