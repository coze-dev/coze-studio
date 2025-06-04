package validate

import (
	"context"
	"fmt"
	"strconv"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
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
	APPID               *int64
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

func (cv *CanvasValidator) DetectCycles(ctx context.Context) (issues []*Issue, err error) {
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

		for nodeID, node := range reachability.reachableNodes {
			if node.Data != nil && node.Data.Inputs != nil && node.Data.Inputs.InputParameters != nil { // only validate InputParameters
				parameters := node.Data.Inputs.InputParameters
				for _, p := range parameters {
					if p.Input != nil {
						if p.Input.Value.Type != vo.BlockInputValueTypeRef {
							continue
						}
						ref, err := parseBlockInputRef(p.Input.Value.Content)
						if err != nil {
							return err
						}
						if ref.BlockID == "" {
							continue
						}
						if _, exists := combinedReachable[ref.BlockID]; !exists {
							issues = append(issues, &Issue{
								NodeErr: &NodeErr{
									NodeID:   nodeID,
									NodeName: node.Data.Meta.Title,
								},
								Message: fmt.Sprintf(`the node id "%v" on which node id "%v" depends does not exist`, nodeID, ref.BlockID),
							})
						}

					}
					if p.Left != nil {
						if p.Left.Value.Type != vo.BlockInputValueTypeRef {
							continue
						}
						ref, err := parseBlockInputRef(p.Left.Value.Content)
						if err != nil {
							return err
						}
						if ref.BlockID == "" {
							continue
						}
						if _, exists := combinedReachable[ref.BlockID]; !exists {
							issues = append(issues, &Issue{
								NodeErr: &NodeErr{
									NodeID:   nodeID,
									NodeName: node.Data.Meta.Title,
								},
								Message: fmt.Sprintf(`the node id "%v" on which node id "%v" depends does not exist`, nodeID, ref.BlockID),
							})
						}

					}
					if p.Right != nil {
						if p.Right.Value.Type != vo.BlockInputValueTypeRef {
							continue
						}
						ref, err := parseBlockInputRef(p.Right.Value.Content)
						if err != nil {
							return err
						}
						if ref.BlockID == "" {
							continue
						}
						if _, exists := combinedReachable[ref.BlockID]; !exists {
							issues = append(issues, &Issue{
								NodeErr: &NodeErr{
									NodeID:   nodeID,
									NodeName: node.Data.Meta.Title,
								},
								Message: fmt.Sprintf(`the node id "%v" on which node id "%v" depends does not exist`, nodeID, ref.BlockID),
							})
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
				Message: "nested nodes do not support batch/loop",
			})
		}
	}
	return issues, nil
}

func (cv *CanvasValidator) CheckGlobalVariables(ctx context.Context) (issues []*Issue, err error) {
	if cv.cfg.APPID == nil {
		return nil, nil // if not project not check global variables, directly return nil
	}

	// TODO(@zhuangjie): if there is a value for project or agent ID, you need to verify the global variables.
	// TODO(@zhuangjie): currently, agent verification is not supported, skipping now.
	issues = make([]*Issue, 0)
	type nodeVars struct {
		node *vo.Node
		vars map[string]*variable.VarTypeInfo
	}
	appID := cv.cfg.APPID

	nVars := make([]*nodeVars, 0)
	for _, node := range cv.cfg.Canvas.Nodes {
		if node.Type == vo.BlockTypeBotComment {
			continue
		}
		v := &nodeVars{node: node, vars: make(map[string]*variable.VarTypeInfo)}
		if node.Type == vo.BlockTypeBotAssignVariable {
			for _, p := range node.Data.Inputs.InputParameters {
				v.vars[p.Name], err = canvasBlockInputToVarTypeInfo(p.Left)
				if err != nil {
					return nil, err
				}
			}
		}
		nVars = append(nVars, v)
	}

	varsMeta, err := cv.cfg.VariablesMetaGetter.GetProjectVariablesMeta(ctx, strconv.FormatInt(*appID, 10), "") // now project version always empty
	if err != nil {
		return nil, err
	}

	varTypeInfoMap := make(map[string]variable.VarTypeInfo)
	for _, meta := range varsMeta {
		varTypeInfoMap[meta.Name] = meta.TypeInfo
	}

	for _, nodeVar := range nVars {
		nodeName := nodeVar.node.Data.Meta.Title
		nodeID := nodeVar.node.ID
		for v, info := range nodeVar.vars {
			vInfo, ok := varTypeInfoMap[v]
			if !ok {
				continue
			}

			if vInfo.Type != info.Type {
				issues = append(issues, &Issue{
					NodeErr: &NodeErr{
						NodeID:   nodeID,
						NodeName: nodeName,
					},
					Message: fmt.Sprintf("node name %v,param [%s] is updated, please update the param", nodeName, v),
				})
			}

			if vInfo.Type == variable.VarTypeArray && info.Type == variable.VarTypeArray {
				if vInfo.ElemTypeInfo.Type != info.ElemTypeInfo.Type {
					issues = append(issues, &Issue{
						NodeErr: &NodeErr{
							NodeID:   nodeID,
							NodeName: nodeName,
						},
						Message: fmt.Sprintf("node name %v, param [%s] is updated, please update the param", nodeName, v),
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
	entities := make([]*entity.WorkflowIdentity, 0)
	var collectSubWorkFlowNodes func(nodes []*vo.Node)
	collectSubWorkFlowNodes = func(nodes []*vo.Node) {
		for _, n := range nodes {
			if n.Type == vo.BlockTypeBotSubWorkflow {
				subWfMap = append(subWfMap, n)
				wid, err := strconv.ParseInt(n.Data.Inputs.WorkflowID, 10, 64)
				if err != nil {
					return
				}
				entities = append(entities, &entity.WorkflowIdentity{
					ID:      wid,
					Version: n.Data.Inputs.WorkflowVersion,
				})
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

	nodeID2Canvas, err := workflow.GetRepository().MGetWorkflowCanvas(ctx, entities)
	if err != nil {
		return nil, err
	}

	for _, node := range subWfMap {
		nodeID, err := strconv.ParseInt(node.Data.Inputs.WorkflowID, 10, 64)
		if err != nil {
			return nil, err
		}
		if c, ok := nodeID2Canvas[nodeID]; !ok {
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
			outDegree[node.ID] = 0
		}

	}

	for _, edge := range c.Edges {
		outDegree[edge.SourceNodeID]++
	}

	portOutDegree := make(map[string]map[string]int) // 节点ID -> 端口 -> 出度
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
				// break, continue 不检查出度
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

func canvasVariableToVarTypeInfo(v *vo.Variable) (*variable.VarTypeInfo, error) {
	vInfo := &variable.VarTypeInfo{}
	switch v.Type {
	case vo.VariableTypeString:
		vInfo.Type = variable.VarTypeString
	case vo.VariableTypeInteger:
		vInfo.Type = variable.VarTypeInteger
	case vo.VariableTypeFloat:
		vInfo.Type = variable.VarTypeFloat
	case vo.VariableTypeBoolean:
		vInfo.Type = variable.VarTypeBoolean
	case vo.VariableTypeObject:
		vInfo.Type = variable.VarTypeObject
		vInfo.Properties = make(map[string]*variable.VarTypeInfo)
		for _, subVAny := range v.Schema.([]any) {
			subV, err := vo.ParseVariable(subVAny)
			if err != nil {
				return nil, err
			}
			subTInfo, err := canvasVariableToVarTypeInfo(subV)
			if err != nil {
				return nil, err
			}
			vInfo.Properties[subV.Name] = subTInfo
		}
	case vo.VariableTypeList:
		vInfo.Type = variable.VarTypeArray
		subVAny := v.Schema
		subV, err := vo.ParseVariable(subVAny)
		if err != nil {
			return nil, err
		}
		subTInfo, err := canvasVariableToVarTypeInfo(subV)
		if err != nil {
			return nil, err
		}
		vInfo.ElemTypeInfo = subTInfo
	default:
		return nil, fmt.Errorf("unsupported variable type: %s", v.Type)
	}
	return vInfo, nil
}

func canvasBlockInputToVarTypeInfo(b *vo.BlockInput) (*variable.VarTypeInfo, error) {
	vInfo := &variable.VarTypeInfo{}

	if b == nil {
		return vInfo, nil
	}

	switch b.Type {
	case vo.VariableTypeString:
		vInfo.Type = variable.VarTypeString
	case vo.VariableTypeInteger:
		vInfo.Type = variable.VarTypeInteger
	case vo.VariableTypeFloat:
		vInfo.Type = variable.VarTypeFloat
	case vo.VariableTypeBoolean:
		vInfo.Type = variable.VarTypeBoolean
	case vo.VariableTypeObject:
		vInfo.Type = variable.VarTypeObject
		vInfo.Properties = make(map[string]*variable.VarTypeInfo)
		for _, subVAny := range b.Schema.([]any) {
			if b.Value.Type == vo.BlockInputValueTypeRef {
				subV, err := vo.ParseVariable(subVAny)
				if err != nil {
					return nil, err
				}
				subTInfo, err := canvasVariableToVarTypeInfo(subV)
				if err != nil {
					return nil, err
				}
				vInfo.Properties[subV.Name] = subTInfo
			} else if b.Value.Type == vo.BlockInputValueTypeObjectRef {
				subV, err := parseParam(subVAny)
				if err != nil {
					return nil, err
				}
				subTInfo, err := canvasBlockInputToVarTypeInfo(subV.Input)
				if err != nil {
					return nil, err
				}
				vInfo.Properties[subV.Name] = subTInfo
			}
		}
	case vo.VariableTypeList:
		vInfo.Type = variable.VarTypeArray
		subV, err := vo.ParseVariable(b.Schema)
		if err != nil {
			return nil, err
		}
		subTInfo, err := canvasVariableToVarTypeInfo(subV)
		if err != nil {
			return nil, err
		}
		vInfo.ElemTypeInfo = subTInfo
	default:
		return nil, fmt.Errorf("unsupported variable type: %s", b.Type)
	}

	return vInfo, nil
}

func parseParam(v any) (*vo.Param, error) {
	m, ok := v.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid content type: %T when parse Param", v)
	}

	marshaled, err := sonic.Marshal(m)
	if err != nil {
		return nil, err
	}

	p := &vo.Param{}
	if err := sonic.Unmarshal(marshaled, p); err != nil {
		return nil, err
	}

	return p, nil
}

func parseBlockInputRef(content any) (*vo.BlockInputReference, error) {
	m, ok := content.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid content type: %T when parse BlockInputRef", content)
	}

	marshaled, err := sonic.Marshal(m)
	if err != nil {
		return nil, err
	}

	p := &vo.BlockInputReference{}
	if err := sonic.Unmarshal(marshaled, p); err != nil {
		return nil, err
	}

	return p, nil
}
