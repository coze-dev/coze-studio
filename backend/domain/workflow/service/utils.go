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

	workflowModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	wf "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/adaptor"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/validate"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/variable"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
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

func getMaxHistoryRoundsRecursively(ctx context.Context, wfEntity *entity.Workflow, repo wf.Repository) (int64, error) {
	visited := make(map[string]struct{})
	maxRounds := int64(0)
	err := getMaxHistoryRoundsRecursiveHelper(ctx, wfEntity, repo, visited, &maxRounds)
	return maxRounds, err
}

func getMaxHistoryRoundsRecursiveHelper(ctx context.Context, wfEntity *entity.Workflow, repo wf.Repository, visited map[string]struct{}, maxRounds *int64) error {
	visitedKey := fmt.Sprintf("%d:%s", wfEntity.ID, wfEntity.GetVersion())
	if _, ok := visited[visitedKey]; ok {
		return nil
	}
	visited[visitedKey] = struct{}{}

	var canvas vo.Canvas
	if err := sonic.UnmarshalString(wfEntity.Canvas, &canvas); err != nil {
		return fmt.Errorf("failed to unmarshal canvas for workflow %d: %w", wfEntity.ID, err)
	}

	return collectMaxHistoryRounds(ctx, canvas.Nodes, repo, visited, maxRounds)
}

func collectMaxHistoryRounds(ctx context.Context, nodes []*vo.Node, repo wf.Repository, visited map[string]struct{}, maxRounds *int64) error {
	for _, node := range nodes {
		if node == nil {
			continue
		}

		if node.Data != nil && node.Data.Inputs != nil && node.Data.Inputs.ChatHistorySetting != nil && node.Data.Inputs.ChatHistorySetting.EnableChatHistory {
			if node.Data.Inputs.ChatHistorySetting.ChatHistoryRound > *maxRounds {
				*maxRounds = node.Data.Inputs.ChatHistorySetting.ChatHistoryRound
			}
		} else if node.Type == entity.NodeTypeLLM.IDStr() && node.Data != nil && node.Data.Inputs != nil && node.Data.Inputs.LLMParam != nil {
			param := node.Data.Inputs.LLMParam
			bs, _ := sonic.Marshal(param)
			llmParam := make(vo.LLMParam, 0)
			if err := sonic.Unmarshal(bs, &llmParam); err != nil {
				return err
			}
			var chatHistoryEnabled bool
			var chatHistoryRound int64
			for _, param := range llmParam {
				switch param.Name {
				case "enableChatHistory":
					if val, ok := param.Input.Value.Content.(bool); ok {
						b := val
						chatHistoryEnabled = b
					}
				case "chatHistoryRound":
					if strVal, ok := param.Input.Value.Content.(string); ok {
						int64Val, err := strconv.ParseInt(strVal, 10, 64)
						if err != nil {
							return err
						}
						chatHistoryRound = int64Val
					}
				}
			}

			if chatHistoryEnabled {
				if chatHistoryRound > *maxRounds {
					*maxRounds = chatHistoryRound
				}
			}
		}

		isSubWorkflow := node.Type == entity.NodeTypeSubWorkflow.IDStr() && node.Data != nil && node.Data.Inputs != nil
		if isSubWorkflow {
			workflowIDStr := node.Data.Inputs.WorkflowID
			if workflowIDStr == "" {
				continue
			}

			workflowID, err := strconv.ParseInt(workflowIDStr, 10, 64)
			if err != nil {
				return fmt.Errorf("invalid workflow ID in sub-workflow node %s: %w", node.ID, err)
			}

			subWfEntity, err := repo.GetEntity(ctx, &vo.GetPolicy{
				ID:      workflowID,
				QType:   ternary.IFElse(len(node.Data.Inputs.WorkflowVersion) == 0, workflowModel.FromDraft, workflowModel.FromSpecificVersion),
				Version: node.Data.Inputs.WorkflowVersion,
			})
			if err != nil {
				return fmt.Errorf("failed to get sub-workflow entity %d: %w", workflowID, err)
			}

			if err := getMaxHistoryRoundsRecursiveHelper(ctx, subWfEntity, repo, visited, maxRounds); err != nil {
				return err
			}
		}

		if len(node.Blocks) > 0 {
			if err := collectMaxHistoryRounds(ctx, node.Blocks, repo, visited, maxRounds); err != nil {
				return err
			}
		}
	}

	return nil
}

func getHistoryRoundsFromNode(ctx context.Context, wfEntity *entity.Workflow, nodeID string, repo wf.Repository) (int64, error) {
	if wfEntity == nil {
		return 0, nil
	}
	visited := make(map[string]struct{})
	visitedKey := fmt.Sprintf("%d:%s", wfEntity.ID, wfEntity.GetVersion())
	if _, ok := visited[visitedKey]; ok {
		return 0, nil
	}
	visited[visitedKey] = struct{}{}
	maxRounds := int64(0)
	c := &vo.Canvas{}
	if err := sonic.UnmarshalString(wfEntity.Canvas, c); err != nil {
		return 0, fmt.Errorf("failed to unmarshal canvas: %w", err)
	}
	var (
		n          *vo.Node
		nodeFinder func(nodes []*vo.Node) *vo.Node
	)
	nodeFinder = func(nodes []*vo.Node) *vo.Node {
		for i := range nodes {
			if nodes[i].ID == nodeID {
				return nodes[i]
			}
			if len(nodes[i].Blocks) > 0 {
				if n := nodeFinder(nodes[i].Blocks); n != nil {
					return n
				}
			}
		}
		return nil
	}

	n = nodeFinder(c.Nodes)
	if n.Type == entity.NodeTypeLLM.IDStr() {
		if n.Data == nil || n.Data.Inputs == nil {
			return 0, nil
		}
		param := n.Data.Inputs.LLMParam
		bs, _ := sonic.Marshal(param)
		llmParam := make(vo.LLMParam, 0)
		if err := sonic.Unmarshal(bs, &llmParam); err != nil {
			return 0, err
		}
		var chatHistoryEnabled bool
		var chatHistoryRound int64
		for _, param := range llmParam {
			switch param.Name {
			case "enableChatHistory":
				if val, ok := param.Input.Value.Content.(bool); ok {
					b := val
					chatHistoryEnabled = b
				}
			case "chatHistoryRound":
				if strVal, ok := param.Input.Value.Content.(string); ok {
					int64Val, err := strconv.ParseInt(strVal, 10, 64)
					if err != nil {
						return 0, err
					}
					chatHistoryRound = int64Val
				}
			}
		}
		if chatHistoryEnabled {
			return chatHistoryRound, nil
		}
		return 0, nil
	}

	if n.Type == entity.NodeTypeIntentDetector.IDStr() || n.Type == entity.NodeTypeKnowledgeRetriever.IDStr() {
		if n.Data != nil && n.Data.Inputs != nil && n.Data.Inputs.ChatHistorySetting != nil && n.Data.Inputs.ChatHistorySetting.EnableChatHistory {
			return n.Data.Inputs.ChatHistorySetting.ChatHistoryRound, nil
		}
		return 0, nil
	}

	if n.Type == entity.NodeTypeSubWorkflow.IDStr() {
		if n.Data != nil && n.Data.Inputs != nil {
			workflowIDStr := n.Data.Inputs.WorkflowID
			if workflowIDStr == "" {
				return 0, nil
			}
			workflowID, err := strconv.ParseInt(workflowIDStr, 10, 64)
			if err != nil {
				return 0, fmt.Errorf("invalid workflow ID in sub-workflow node %s: %w", n.ID, err)
			}
			subWfEntity, err := repo.GetEntity(ctx, &vo.GetPolicy{
				ID:      workflowID,
				QType:   ternary.IFElse(len(n.Data.Inputs.WorkflowVersion) == 0, workflowModel.FromDraft, workflowModel.FromSpecificVersion),
				Version: n.Data.Inputs.WorkflowVersion,
			})
			if err != nil {
				return 0, fmt.Errorf("failed to get sub-workflow entity %d: %w", workflowID, err)
			}
			if err := getMaxHistoryRoundsRecursiveHelper(ctx, subWfEntity, repo, visited, &maxRounds); err != nil {
				return 0, err
			}
			return maxRounds, nil
		}
	}

	if len(n.Blocks) > 0 {
		if err := collectMaxHistoryRounds(ctx, n.Blocks, repo, visited, &maxRounds); err != nil {
			return 0, err
		}
	}
	return maxRounds, nil
}
