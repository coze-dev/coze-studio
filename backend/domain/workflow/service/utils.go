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

package service

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/adaptor"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/validate"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/variable"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func validateWorkflowTree(ctx context.Context, config vo.ValidateTreeConfig) ([]*validate.Issue, error) {
	c := &vo.Canvas{}
	err := sonic.UnmarshalString(config.CanvasSchema, &c)
	if err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail,
			fmt.Errorf("failed to unmarshal canvas schema: %w", err))
	}

	c.Nodes, c.Edges = adaptor.PruneIsolatedNodes(c.Nodes, c.Edges, nil)
	validator, err := validate.NewCanvasValidator(ctx, &validate.Config{
		Canvas:              c,
		AppID:               config.AppID,
		AgentID:             config.AgentID,
		VariablesMetaGetter: variable.GetVariablesMetaGetter(),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to new canvas validate : %w", err)
	}

	var issues []*validate.Issue
	issues, err = validator.ValidateConnections(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check connectivity : %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	issues, err = validator.DetectCycles(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check loops: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	issues, err = validator.ValidateNestedFlows(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check nested batch or recurse: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	issues, err = validator.CheckRefVariable(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check ref variable: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	issues, err = validator.CheckGlobalVariables(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check global variables: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	issues, err = validator.CheckSubWorkFlowTerminatePlanType(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check sub workflow terminate plan type: %w", err)
	}
	if len(issues) > 0 {
		return issues, nil
	}

	return issues, nil
}

func convertToValidationError(issue *validate.Issue) *workflow.ValidateErrorData {
	e := &workflow.ValidateErrorData{}
	e.Message = issue.Message
	if issue.NodeErr != nil {
		e.Type = workflow.ValidateErrorType_BotValidateNodeErr
		e.NodeError = &workflow.NodeError{
			NodeID: issue.NodeErr.NodeID,
		}
	} else if issue.PathErr != nil {
		e.Type = workflow.ValidateErrorType_BotValidatePathErr
		e.PathError = &workflow.PathError{
			Start: issue.PathErr.StartNode,
			End:   issue.PathErr.EndNode,
		}
	}

	return e
}

func toValidateErrorData(issues []*validate.Issue) []*workflow.ValidateErrorData {
	validateErrors := make([]*workflow.ValidateErrorData, 0, len(issues))
	for _, issue := range issues {
		validateErrors = append(validateErrors, convertToValidationError(issue))
	}
	return validateErrors
}

func toValidateIssue(id int64, name string, issues []*validate.Issue) *vo.ValidateIssue {
	vIssue := &vo.ValidateIssue{
		WorkflowID:   id,
		WorkflowName: name,
	}
	for _, issue := range issues {
		vIssue.IssueMessages = append(vIssue.IssueMessages, issue.Message)
	}
	return vIssue
}

type version struct {
	Prefix string
	Major  int
	Minor  int
	Patch  int
}

func parseVersion(versionString string) (_ version, err error) {
	defer func() {
		if err != nil {
			err = vo.WrapError(errno.ErrInvalidVersionName, err)
		}
	}()
	if !strings.HasPrefix(versionString, "v") {
		return version{}, fmt.Errorf("invalid prefix format: %s", versionString)
	}
	versionString = strings.TrimPrefix(versionString, "v")
	parts := strings.Split(versionString, ".")
	if len(parts) != 3 {
		return version{}, fmt.Errorf("invalid version format: %s", versionString)
	}

	major, err := strconv.Atoi(parts[0])
	if err != nil {
		return version{}, fmt.Errorf("invalid major version: %s", parts[0])
	}

	minor, err := strconv.Atoi(parts[1])
	if err != nil {
		return version{}, fmt.Errorf("invalid minor version: %s", parts[1])
	}

	patch, err := strconv.Atoi(parts[2])
	if err != nil {
		return version{}, fmt.Errorf("invalid patch version: %s", parts[2])
	}

	return version{Major: major, Minor: minor, Patch: patch}, nil
}

func isIncremental(prev version, next version) bool {
	if next.Major < prev.Major {
		return false
	}
	if next.Major > prev.Major {
		return true
	}

	if next.Minor < prev.Minor {
		return false
	}
	if next.Minor > prev.Minor {
		return true
	}

	return next.Patch > prev.Patch
}
