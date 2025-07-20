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

	cloudworkflow "github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/adaptor"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/validate"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
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

func convertToValidationError(issue *validate.Issue) *cloudworkflow.ValidateErrorData {
	e := &cloudworkflow.ValidateErrorData{}
	e.Message = issue.Message
	if issue.NodeErr != nil {
		e.Type = cloudworkflow.ValidateErrorType_BotValidateNodeErr
		e.NodeError = &cloudworkflow.NodeError{
			NodeID: issue.NodeErr.NodeID,
		}
	} else if issue.PathErr != nil {
		e.Type = cloudworkflow.ValidateErrorType_BotValidatePathErr
		e.PathError = &cloudworkflow.PathError{
			Start: issue.PathErr.StartNode,
			End:   issue.PathErr.EndNode,
		}
	}

	return e
}

func toValidateErrorData(issues []*validate.Issue) []*cloudworkflow.ValidateErrorData {
	validateErrors := make([]*cloudworkflow.ValidateErrorData, 0, len(issues))
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

func replaceRelatedWorkflowOrPluginInWorkflowNodes(nodes []*vo.Node, relatedWorkflows map[int64]entity.IDVersionPair, relatedPlugins map[int64]vo.PluginEntity) error {
	for _, node := range nodes {
		if node.Type == vo.BlockTypeBotSubWorkflow {
			workflowID, err := strconv.ParseInt(node.Data.Inputs.WorkflowID, 10, 64)
			if err != nil {
				return err
			}
			if wf, ok := relatedWorkflows[workflowID]; ok {
				node.Data.Inputs.WorkflowID = strconv.FormatInt(wf.ID, 10)
				node.Data.Inputs.WorkflowVersion = wf.Version
			}
		}
		if node.Type == vo.BlockTypeBotAPI {
			apiParams := slices.ToMap(node.Data.Inputs.APIParams, func(e *vo.Param) (string, *vo.Param) {
				return e.Name, e
			})
			pluginIDParam, ok := apiParams["pluginID"]
			if !ok {
				return fmt.Errorf("plugin id param is not found")
			}

			pID, err := strconv.ParseInt(pluginIDParam.Input.Value.Content.(string), 10, 64)
			if err != nil {
				return err
			}

			pluginVersionParam, ok := apiParams["pluginVersion"]
			if !ok {
				return fmt.Errorf("plugin version param is not found")
			}

			if refPlugin, ok := relatedPlugins[pID]; ok {
				pluginIDParam.Input.Value.Content = refPlugin.PluginID
				if refPlugin.PluginVersion != nil {
					pluginVersionParam.Input.Value.Content = *refPlugin.PluginVersion
				}

			}
		}

		if node.Type == vo.BlockTypeBotLLM {
			if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.WorkflowFCParam != nil {
				for idx := range node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList {
					wf := node.Data.Inputs.FCParam.WorkflowFCParam.WorkflowList[idx]
					workflowID, err := strconv.ParseInt(wf.WorkflowID, 10, 64)
					if err != nil {
						return err
					}
					if refWf, ok := relatedWorkflows[workflowID]; ok {
						wf.WorkflowID = strconv.FormatInt(refWf.ID, 10)
						wf.WorkflowVersion = refWf.Version
					}

				}
			}
			if node.Data.Inputs.FCParam != nil && node.Data.Inputs.FCParam.PluginFCParam != nil {
				for idx := range node.Data.Inputs.FCParam.PluginFCParam.PluginList {
					pl := node.Data.Inputs.FCParam.PluginFCParam.PluginList[idx]
					pluginID, err := strconv.ParseInt(pl.PluginID, 10, 64)
					if err != nil {
						return err
					}
					if refPlugin, ok := relatedPlugins[pluginID]; ok {
						pl.PluginID = strconv.FormatInt(refPlugin.PluginID, 10)
						if refPlugin.PluginVersion != nil {
							pl.PluginVersion = *refPlugin.PluginVersion
						}

					}

				}
			}

		}
		if len(node.Blocks) > 0 {
			err := replaceRelatedWorkflowOrPluginInWorkflowNodes(node.Blocks, relatedWorkflows, relatedPlugins)
			if err != nil {
				return err
			}
		}

	}
	return nil
}

// entityNodeTypeToBlockType converts an entity.NodeType to the corresponding vo.BlockType.
func entityNodeTypeToBlockType(nodeType entity.NodeType) (vo.BlockType, error) {
	switch nodeType {
	case entity.NodeTypeEntry:
		return vo.BlockTypeBotStart, nil
	case entity.NodeTypeExit:
		return vo.BlockTypeBotEnd, nil
	case entity.NodeTypeLLM:
		return vo.BlockTypeBotLLM, nil
	case entity.NodeTypePlugin:
		return vo.BlockTypeBotAPI, nil
	case entity.NodeTypeCodeRunner:
		return vo.BlockTypeBotCode, nil
	case entity.NodeTypeKnowledgeRetriever:
		return vo.BlockTypeBotDataset, nil
	case entity.NodeTypeSelector:
		return vo.BlockTypeCondition, nil
	case entity.NodeTypeSubWorkflow:
		return vo.BlockTypeBotSubWorkflow, nil
	case entity.NodeTypeDatabaseCustomSQL:
		return vo.BlockTypeDatabase, nil
	case entity.NodeTypeOutputEmitter:
		return vo.BlockTypeBotMessage, nil
	case entity.NodeTypeTextProcessor:
		return vo.BlockTypeBotText, nil
	case entity.NodeTypeQuestionAnswer:
		return vo.BlockTypeQuestion, nil
	case entity.NodeTypeBreak:
		return vo.BlockTypeBotBreak, nil
	case entity.NodeTypeVariableAssigner:
		return vo.BlockTypeBotAssignVariable, nil
	case entity.NodeTypeVariableAssignerWithinLoop:
		return vo.BlockTypeBotLoopSetVariable, nil
	case entity.NodeTypeLoop:
		return vo.BlockTypeBotLoop, nil
	case entity.NodeTypeIntentDetector:
		return vo.BlockTypeBotIntent, nil
	case entity.NodeTypeKnowledgeIndexer:
		return vo.BlockTypeBotDatasetWrite, nil
	case entity.NodeTypeBatch:
		return vo.BlockTypeBotBatch, nil
	case entity.NodeTypeContinue:
		return vo.BlockTypeBotContinue, nil
	case entity.NodeTypeInputReceiver:
		return vo.BlockTypeBotInput, nil
	case entity.NodeTypeDatabaseUpdate:
		return vo.BlockTypeDatabaseUpdate, nil
	case entity.NodeTypeDatabaseQuery:
		return vo.BlockTypeDatabaseSelect, nil
	case entity.NodeTypeDatabaseDelete:
		return vo.BlockTypeDatabaseDelete, nil
	case entity.NodeTypeHTTPRequester:
		return vo.BlockTypeBotHttp, nil
	case entity.NodeTypeDatabaseInsert:
		return vo.BlockTypeDatabaseInsert, nil
	case entity.NodeTypeVariableAggregator:
		return vo.BlockTypeBotVariableMerge, nil
	case entity.NodeTypeJsonSerialization:
		return vo.BlockTypeJsonSerialization, nil
	case entity.NodeTypeJsonDeserialization:
		return vo.BlockTypeJsonDeserialization, nil
	case entity.NodeTypeKnowledgeDeleter:
		return vo.BlockTypeBotDatasetDelete, nil

	default:
		return "", vo.WrapError(errno.ErrSchemaConversionFail,
			fmt.Errorf("cannot map entity node type '%s' to a workflow.NodeTemplateType", nodeType))
	}
}
