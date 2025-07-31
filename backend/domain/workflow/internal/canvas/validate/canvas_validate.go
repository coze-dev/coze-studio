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

package validate

import (
	"context"
	"fmt"
	"regexp"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/adaptor"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type Issue struct {
	NodeErr *NodeErr
	PathErr *PathErr
	Message string
}
type NodeErr struct {
	NodeID   string `json:"nodeID"`
	NodeName string `json:"nodeName"`
}
type PathErr struct {
	StartNode string `json:"start"`
	EndNode   string `json:"end"`
}

type reachability struct {
	reachableNodes     map[string]*vo.Node
	nestedReachability map[string]*reachability
}

type Config struct {
	Canvas              *vo.Canvas
	AppID               *int64
	AgentID             *int64
	VariablesMetaGetter variable.VariablesMetaGetter
}

type CanvasValidator struct {
	cfg          *Config
	reachability *reachability
}

func NewCanvasValidator(_ context.Context, cfg *Config) (*CanvasValidator, error) {
	if cfg == nil {
		return nil, fmt.Errorf("config is required")
	}

	if cfg.Canvas == nil {
		return nil, fmt.Errorf("canvas is required")
	}

	reachability, err := analyzeCanvasReachability(cfg.Canvas)
	if err != nil {
		return nil, err
	}

	return &CanvasValidator{reachability: reachability, cfg: cfg}, nil
}

func (cv *CanvasValidator) DetectCycles(_ context.Context) (issues []*Issue, err error) {
	issues = make([]*Issue, 0)
	nodeIDs := make([]string, 0)
	for _, node := range cv.cfg.Canvas.Nodes {
		nodeIDs = append(nodeIDs, node.ID)
	}

	controlSuccessors := map[string][]string{}
	for _, e := range cv.cfg.Canvas.Edges {
		controlSuccessors[e.TargetNodeID] = append(controlSuccessors[e.TargetNodeID], e.SourceNodeID)
	}

	cycles := detectCycles(nodeIDs, controlSuccessors)
	if len(cycles) == 0 {
		return issues, nil
	}

	for _, cycle := range cycles {
		n := len(cycle)
		for i := 0; i < n; i++ {
			if cycle[i] == cycle[(i+1)%n] {
				continue
			}
			issues = append(issues, &Issue{
				PathErr: &PathErr{
					StartNode: cycle[i],
					EndNode:   cycle[(i+1)%n],
				},
				Message: "line connections do not allow parallel lines to intersect and form loops with each other",
			})
		}
	}

	return issues, nil
}

func (cv *CanvasValidator) ValidateConnections(ctx context.Context) (issues []*Issue, err error) {
	issues, err = validateConnections(ctx, cv.cfg.Canvas)
	if err != nil {
		return issues, err
	}

	return issues, nil
}

func (cv *CanvasValidator) CheckRefVariable(ctx context.Context) (issues []*Issue, err error) {
	issues = make([]*Issue, 0)
	var checkRefVariable func(reachability *reachability, reachableNodes map[string]bool) error
	checkRefVariable = func(reachability *reachability, parentReachableNodes map[string]bool) error {
		currentReachableNodes := make(map[string]bool)
		combinedReachable := make(map[string]bool)
		for _, node := range reachability.reachableNodes {
			currentReachableNodes[node.ID] = true
			combinedReachable[node.ID] = true
		}

		if parentReachableNodes != nil {
			for id := range parentReachableNodes {
				combinedReachable[id] = true
			}
		}

		var inputBlockVerify func(node *vo.Node, ref *vo.BlockInput) error
		inputBlockVerify = func(node *vo.Node, inputBlock *vo.BlockInput) error {
			if inputBlock.Value.Type != vo.BlockInputValueTypeRef {
				return nil
			}
			ref, err := parseBlockInputRef(inputBlock.Value.Content)
			if err != nil {
				return err
			}

			if ref.Source == vo.RefSourceTypeGlobalApp || ref.Source == vo.RefSourceTypeGlobalSystem || ref.Source == vo.RefSourceTypeGlobalUser {
				return nil
			}

			if ref.Source == vo.RefSourceTypeBlockOutput && ref.BlockID == "" {
				issues = append(issues, &Issue{
					NodeErr: &NodeErr{
						NodeID:   node.ID,
						NodeName: node.Data.Meta.Title,
					},
					Message: `ref block error,[blockID] is empty`,
				})
				return nil
			}

			if _, exists := combinedReachable[ref.BlockID]; !exists {
				issues = append(issues, &Issue{
					NodeErr: &NodeErr{
						NodeID:   node.ID,
						NodeName: node.Data.Meta.Title,
					},
					Message: fmt.Sprintf(`the node id "%s" on which node id "%s" depends does not exist`, node.ID, ref.BlockID),
				})
			}
			return nil
		}

		for nodeID, node := range reachability.reachableNodes {
			if node.Data != nil && node.Data.Inputs != nil && node.Data.Inputs.InputParameters != nil { // only validate InputParameters
				parameters := node.Data.Inputs.InputParameters
				for _, p := range parameters {
					if p.Input != nil {
						valid := validateInputParameterName(p.Name)
						if !valid {
							issues = append(issues, &Issue{
								NodeErr: &NodeErr{
									NodeID:   nodeID,
									NodeName: node.Data.Meta.Title,
								},
								Message: fmt.Sprintf(`parameter name only allows number or alphabet, and must begin with alphabet, but it's "%s"`, p.Name),
							})
						}
						err = inputBlockVerify(node, p.Input)
						if err != nil {
							return err
						}

					}

					if p.Left != nil {
						err = inputBlockVerify(node, p.Left)
						if err != nil {
							return err
						}

					}

					if p.Right != nil {
						err = inputBlockVerify(node, p.Right)
						if err != nil {
							return err
						}
					}

				}
			}
		}

		for _, r := range reachability.nestedReachability {
			err := checkRefVariable(r, currentReachableNodes)
			if err != nil {
				return err
			}
		}

		return nil

	}

	err = checkRefVariable(cv.reachability, nil)
	if err != nil {
		return nil, err
	}

	return issues, nil
}

func (cv *CanvasValidator) ValidateNestedFlows(ctx context.Context) (issues []*Issue, err error) {
	issues = make([]*Issue, 0)
	for nodeID, node := range cv.reachability.reachableNodes {
		if nestedReachableNodes, ok := cv.reachability.nestedReachability[nodeID]; ok && len(nestedReachableNodes.nestedReachability) > 0 {
			issues = append(issues, &Issue{
				NodeErr: &NodeErr{
					NodeID:   nodeID,
					NodeName: node.Data.Meta.Title,
				},
				Message: "composite nodes such as batch/loop cannot be nested",
			})
		}
	}
	return issues, nil
}

func (cv *CanvasValidator) CheckGlobalVariables(ctx context.Context) (issues []*Issue, err error) {
	if cv.cfg.AppID == nil && cv.cfg.AgentID == nil {
		return issues, nil
	}

	type nodeVars struct {
		node *vo.Node
		vars map[string]*vo.TypeInfo
	}

	nVars := make([]*nodeVars, 0)
	for _, node := range cv.cfg.Canvas.Nodes {
		if node.Type == vo.BlockTypeBotComment {
			continue
		}
		if node.Type == vo.BlockTypeBotAssignVariable {
			v := &nodeVars{node: node, vars: make(map[string]*vo.TypeInfo)}
			for _, p := range node.Data.Inputs.InputParameters {
				v.vars[p.Name], err = adaptor.CanvasBlockInputToTypeInfo(p.Left)
				if err != nil {
					return nil, err
				}
			}
			nVars = append(nVars, v)
		}
	}

	if len(nVars) == 0 {
		return issues, nil
	}

	var varsMeta map[string]*vo.TypeInfo
	if cv.cfg.AppID != nil {
		varsMeta, err = cv.cfg.VariablesMetaGetter.GetAppVariablesMeta(ctx, strconv.FormatInt(*cv.cfg.AppID, 10), "")
	} else {
		varsMeta, err = cv.cfg.VariablesMetaGetter.GetAgentVariablesMeta(ctx, *cv.cfg.AgentID, "")
	}

	for _, nodeVar := range nVars {
		nodeName := nodeVar.node.Data.Meta.Title
		nodeID := nodeVar.node.ID
		for v, info := range nodeVar.vars {
			vInfo, ok := varsMeta[v]
			if !ok {
				continue
			}

			if vInfo.Type != info.Type {
				issues = append(issues, &Issue{
					NodeErr: &NodeErr{
						NodeID:   nodeID,
						NodeName: nodeName,
					},
					Message: fmt.Sprintf("node name %v,param [%s], type mismatch", nodeName, v),
				})
			}

			if vInfo.Type == vo.DataTypeArray && info.Type == vo.DataTypeArray {
				if vInfo.ElemTypeInfo.Type != info.ElemTypeInfo.Type {
					issues = append(issues, &Issue{
						NodeErr: &NodeErr{
							NodeID:   nodeID,
							NodeName: nodeName,
						},
						Message: fmt.Sprintf("node name %v, param [%s], array element type mismatch", nodeName, v),
					})

				}
			}
		}
	}

	return issues, nil
}

func (cv *CanvasValidator) CheckSubWorkFlowTerminatePlanType(ctx context.Context) (issues []*Issue, err error) {
	issues = make([]*Issue, 0)
	subWfMap := make([]*vo.Node, 0)
	var (
		draftIDs         []int64
		subID2SubVersion = map[int64]string{}
	)
	var collectSubWorkFlowNodes func(nodes []*vo.Node)
	collectSubWorkFlowNodes = func(nodes []*vo.Node) {
		for _, n := range nodes {
			if n.Type == vo.BlockTypeBotSubWorkflow {
				subWfMap = append(subWfMap, n)
				wID, err := strconv.ParseInt(n.Data.Inputs.WorkflowID, 10, 64)
				if err != nil {
					return
				}

				if len(n.Data.Inputs.WorkflowVersion) > 0 {
					subID2SubVersion[wID] = n.Data.Inputs.WorkflowVersion
				} else {
					draftIDs = append(draftIDs, wID)
				}
			}
			if len(n.Blocks) > 0 {
				collectSubWorkFlowNodes(n.Blocks)
			}
		}
	}

	collectSubWorkFlowNodes(cv.cfg.Canvas.Nodes)

	if len(subWfMap) == 0 {
		return issues, nil
	}

	wfID2Canvas := make(map[int64]*vo.Canvas)

	if len(draftIDs) > 0 {
		wfs, _, err := workflow.GetRepository().MGetDrafts(ctx, &vo.MGetPolicy{
			MetaQuery: vo.MetaQuery{
				IDs: draftIDs,
			},
		})
		if err != nil {
			return nil, err
		}

		for _, draft := range wfs {
			var canvas vo.Canvas
			if err = sonic.UnmarshalString(draft.Canvas, &canvas); err != nil {
				return nil, err
			}

			wfID2Canvas[draft.ID] = &canvas
		}
	}

	if len(subID2SubVersion) > 0 {
		for id, version := range subID2SubVersion {
			v, err := workflow.GetRepository().GetVersion(ctx, id, version)
			if err != nil {
				return nil, err
			}

			var canvas vo.Canvas
			if err = sonic.UnmarshalString(v.Canvas, &canvas); err != nil {
				return nil, err
			}

			wfID2Canvas[id] = &canvas
		}
	}

	for _, node := range subWfMap {
		wfID, err := strconv.ParseInt(node.Data.Inputs.WorkflowID, 10, 64)
		if err != nil {
			return nil, err
		}
		if c, ok := wfID2Canvas[wfID]; !ok {
			issues = append(issues, &Issue{
				NodeErr: &NodeErr{
					NodeID:   node.ID,
					NodeName: node.Data.Meta.Title,
				},
				Message: "sub workflow has been modified, please refresh the page",
			})
		} else {
			_, endNode, err := findStartAndEndNodes(c.Nodes)
			if err != nil {
				return nil, err
			}
			if endNode != nil {
				if string(*endNode.Data.Inputs.TerminatePlan) != toTerminatePlan(node.Data.Inputs.TerminationType) {
					issues = append(issues, &Issue{
						NodeErr: &NodeErr{
							NodeID:   node.ID,
							NodeName: node.Data.Meta.Title,
						},
						Message: "sub workflow has been modified, please refresh the page",
					})
				}

			}

		}
	}
	return issues, nil
}

func validateConnections(ctx context.Context, c *vo.Canvas) (issues []*Issue, err error) {
	issues = make([]*Issue, 0)
	nodeMap := buildNodeMap(c)
	for _, node := range nodeMap {
		if len(node.Blocks) > 0 && len(node.Edges) > 0 {
			n := &vo.Node{
				ID:   node.ID,
				Type: node.Type,
				Data: node.Data,
			}
			nestedCanvas := &vo.Canvas{
				Nodes: append(node.Blocks, n),
				Edges: node.Edges,
			}

			is, err := validateConnections(ctx, nestedCanvas)
			if err != nil {
				return nil, err
			}
			issues = append(issues, is...)

		}
	}

	outDegree := make(map[string]int)
	selectorPorts := make(map[string]map[string]bool)

	for nodeID, node := range nodeMap {
		switch node.Type {
		case vo.BlockTypeCondition:
			branches := node.Data.Inputs.Branches
			if _, exists := selectorPorts[nodeID]; !exists {
				selectorPorts[nodeID] = make(map[string]bool)
			}
			selectorPorts[nodeID]["false"] = true
			for index := range branches {
				if index == 0 {
					selectorPorts[nodeID]["true"] = true
				} else {
					selectorPorts[nodeID][fmt.Sprintf("true_%v", index)] = true
				}
			}
		case vo.BlockTypeBotIntent:
			intents := node.Data.Inputs.Intents
			if _, exists := selectorPorts[nodeID]; !exists {
				selectorPorts[nodeID] = make(map[string]bool)
			}
			for index := range intents {
				selectorPorts[nodeID][fmt.Sprintf("branch_%v", index)] = true
			}
			selectorPorts[nodeID]["default"] = true
			if node.Data.Inputs.SettingOnError != nil && node.Data.Inputs.SettingOnError.ProcessType != nil &&
				*node.Data.Inputs.SettingOnError.ProcessType == vo.ErrorProcessTypeExceptionBranch {
				selectorPorts[nodeID]["branch_error"] = true
			}
		case vo.BlockTypeQuestion:
			if node.Data.Inputs.QA.AnswerType == vo.QAAnswerTypeOption {
				if _, exists := selectorPorts[nodeID]; !exists {
					selectorPorts[nodeID] = make(map[string]bool)
				}
				if node.Data.Inputs.QA.OptionType == vo.QAOptionTypeStatic {
					for index := range node.Data.Inputs.QA.Options {
						selectorPorts[nodeID][fmt.Sprintf("branch_%v", index)] = true
					}
				}

				if node.Data.Inputs.QA.OptionType == vo.QAOptionTypeDynamic {
					selectorPorts[nodeID][fmt.Sprintf("branch_%v", 0)] = true
				}
			}
		default:
			if node.Data.Inputs != nil && node.Data.Inputs.SettingOnError != nil &&
				node.Data.Inputs.SettingOnError.ProcessType != nil &&
				*node.Data.Inputs.SettingOnError.ProcessType == vo.ErrorProcessTypeExceptionBranch {
				if _, exists := selectorPorts[nodeID]; !exists {
					selectorPorts[nodeID] = make(map[string]bool)
				}
				selectorPorts[nodeID]["branch_error"] = true
				selectorPorts[nodeID]["default"] = true
			} else {
				outDegree[node.ID] = 0
			}
		}

	}

	for _, edge := range c.Edges {
		outDegree[edge.SourceNodeID]++
	}

	portOutDegree := make(map[string]map[string]int) // Node ID - > Port - > Outgoing
	for _, edge := range c.Edges {

		if _, ok := selectorPorts[edge.SourceNodeID]; !ok {
			continue
		}
		if _, exists := portOutDegree[edge.SourceNodeID]; !exists {
			portOutDegree[edge.SourceNodeID] = make(map[string]int)
		}

		portOutDegree[edge.SourceNodeID][edge.SourcePortID]++

	}

	for nodeID, node := range nodeMap {
		nodeName := node.Data.Meta.Title

		switch node.Type {
		case vo.BlockTypeBotStart:
			if outDegree[nodeID] == 0 {
				issues = append(issues, &Issue{
					NodeErr: &NodeErr{
						NodeID:   nodeID,
						NodeName: nodeName,
					},
					Message: `node "start" not connected`,
				})
			}
		case vo.BlockTypeBotEnd:
		default:
			if ports, isSelector := selectorPorts[nodeID]; isSelector {
				selectorIssues := &Issue{NodeErr: &NodeErr{
					NodeID:   node.ID,
					NodeName: nodeName,
				}}
				message := ""
				for port := range ports {
					if portOutDegree[nodeID][port] == 0 {
						message += fmt.Sprintf(`node "%v"'s port "%v" not connected;`, nodeName, port)
					}
				}
				if len(message) > 0 {
					selectorIssues.Message = message
					issues = append(issues, selectorIssues)
				}
			} else {
				// Break, continue without checking out degrees
				if node.Type == vo.BlockTypeBotBreak || node.Type == vo.BlockTypeBotContinue {
					continue
				}
				if outDegree[nodeID] == 0 {
					issues = append(issues, &Issue{
						NodeErr: &NodeErr{
							NodeID:   node.ID,
							NodeName: nodeName,
						},
						Message: fmt.Sprintf(`node "%v" not connected`, nodeName),
					})

				}
			}
		}
	}

	return issues, nil
}

func analyzeCanvasReachability(c *vo.Canvas) (*reachability, error) {
	nodeMap := buildNodeMap(c)
	reachable := &reachability{}

	if err := processNestedReachability(c, reachable); err != nil {
		return nil, err
	}

	startNode, endNode, err := findStartAndEndNodes(c.Nodes)
	if err != nil {
		return nil, err
	}

	edgeMap := make(map[string][]string)
	for _, edge := range c.Edges {
		edgeMap[edge.SourceNodeID] = append(edgeMap[edge.SourceNodeID], edge.TargetNodeID)
	}

	reachable.reachableNodes, err = performReachabilityAnalysis(nodeMap, edgeMap, startNode, endNode)
	if err != nil {
		return nil, err
	}

	return reachable, nil
}

func buildNodeMap(c *vo.Canvas) map[string]*vo.Node {
	nodeMap := make(map[string]*vo.Node, len(c.Nodes))
	for _, node := range c.Nodes {
		nodeMap[node.ID] = node
	}
	return nodeMap
}

func processNestedReachability(c *vo.Canvas, r *reachability) error {
	for _, node := range c.Nodes {
		if len(node.Blocks) > 0 && len(node.Edges) > 0 {
			nestedCanvas := &vo.Canvas{
				Nodes: append([]*vo.Node{
					{
						ID:   node.ID,
						Type: vo.BlockTypeBotStart,
						Data: node.Data,
					},
					{
						ID:   node.ID,
						Type: vo.BlockTypeBotEnd,
					},
				}, node.Blocks...),
				Edges: node.Edges,
			}
			nestedReachable, err := analyzeCanvasReachability(nestedCanvas)
			if err != nil {
				return fmt.Errorf("processing nested canvas for node %s: %w", node.ID, err)
			}
			if r.nestedReachability == nil {
				r.nestedReachability = make(map[string]*reachability)
			}
			r.nestedReachability[node.ID] = nestedReachable
		}
	}
	return nil
}

func findStartAndEndNodes(nodes []*vo.Node) (*vo.Node, *vo.Node, error) {
	var startNode, endNode *vo.Node

	for _, node := range nodes {
		switch node.Type {
		case vo.BlockTypeBotStart:
			startNode = node
		case vo.BlockTypeBotEnd:
			endNode = node
		}
	}

	if startNode == nil {
		return nil, nil, fmt.Errorf("start node not found")
	}
	if endNode == nil {
		return nil, nil, fmt.Errorf("end node not found")
	}

	return startNode, endNode, nil
}

func performReachabilityAnalysis(nodeMap map[string]*vo.Node, edgeMap map[string][]string, startNode *vo.Node, endNode *vo.Node) (map[string]*vo.Node, error) {
	result := make(map[string]*vo.Node)
	result[startNode.ID] = startNode

	queue := []string{startNode.ID}
	visited := make(map[string]bool)
	visited[startNode.ID] = true

	for len(queue) > 0 {
		currentID := queue[0]
		queue = queue[1:]
		for _, targetNodeID := range edgeMap[currentID] {
			if !visited[targetNodeID] {
				visited[targetNodeID] = true
				node, ok := nodeMap[targetNodeID]
				if !ok {
					return nil, fmt.Errorf("node not found for %s in nodeMap", targetNodeID)
				}
				result[targetNodeID] = node
				queue = append(queue, targetNodeID)
			}
		}
	}

	return result, nil
}

func toTerminatePlan(p int) string {
	switch p {
	case 0:
		return "returnVariables"
	case 1:
		return "useAnswerContent"
	default:
		return ""
	}
}

func detectCycles(nodes []string, controlSuccessors map[string][]string) [][]string {
	visited := map[string]bool{}
	var dfs func(path []string) [][]string
	dfs = func(path []string) [][]string {
		var ret [][]string
		pathEnd := path[len(path)-1]
		successors, ok := controlSuccessors[pathEnd]
		if !ok {
			return nil
		}
		for _, successor := range successors {
			visited[successor] = true
			var looped bool
			for i, node := range path {
				if node == successor {
					ret = append(ret, append(path[i:], successor))
					looped = true
					break
				}
			}
			if looped {
				continue
			}

			ret = append(ret, dfs(append(path, successor))...)
		}
		return ret
	}

	var ret [][]string
	for _, node := range nodes {
		if !visited[node] {
			ret = append(ret, dfs([]string{node})...)
		}
	}
	return ret
}

func parseBlockInputRef(content any) (*vo.BlockInputReference, error) {
	m, ok := content.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid content type: %T when parse BlockInputRef", content)
	}

	marshaled, err := sonic.Marshal(m)
	if err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	p := &vo.BlockInputReference{}
	if err = sonic.Unmarshal(marshaled, p); err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	return p, nil
}

var validateNameRegex = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]*$`)

func validateInputParameterName(name string) bool {
	return validateNameRegex.Match([]byte(name))
}
