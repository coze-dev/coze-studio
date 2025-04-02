package workflow

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/selector"
)

type workflow = compose.Workflow[map[string]any, map[string]any]

type Workflow struct {
	*workflow
	hierarchy   nodeHierarchy
	connections []*connection
}

func (w *Workflow) addLambda(key nodeKey, info *nodes.NodeInfo, inputFields []*nodes.InputField) error {
	deps, err := key.resolveDependencies(inputFields, w.connections, w.hierarchy)
	if err != nil {
		return err
	}

	lambda, err := toLambda(info.Lambda)
	if err != nil {
		return err
	}

	n := w.AddLambdaNode(string(key), lambda)

	for fromNodeKey, fieldMappings := range deps.inputs {
		n.AddInput(string(fromNodeKey), fieldMappings...)
	}

	for fromNodeKey, fieldMappings := range deps.inputsNoDirectDependency {
		n.AddInputWithOptions(string(fromNodeKey), fieldMappings, compose.WithNoDirectDependency())
	}

	for i := range deps.dependencies {
		n.AddDependency(string(deps.dependencies[i]))
	}

	for i := range deps.staticValues {
		n.SetStaticValue(deps.staticValues[i].path, deps.staticValues[i].val)
	}

	return nil
}

func (w *Workflow) addSelector(key nodeKey, portCount int) error {
	bMapping, err := key.resolveSelector(w.connections, portCount)
	if err != nil {
		return err
	}

	endNodes := make(map[string]bool)
	for i := range *bMapping {
		for k := range (*bMapping)[i] {
			endNodes[string(k)] = true
		}
	}

	condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
		choice, ok := in[selector.ChoiceKey]
		if !ok {
			return nil, fmt.Errorf("selector node %s does not have choice", key)
		}

		choiceInt, ok := choice.(int)
		if !ok {
			return nil, fmt.Errorf("selector node %s choice is not int", key)
		}

		if choiceInt < 0 || choiceInt > len(*bMapping) {
			return nil, fmt.Errorf("selector node %s choice out of range: %d", key, choiceInt)
		}

		choices := make(map[string]bool, len((*bMapping)[choiceInt]))
		for k := range (*bMapping)[choiceInt] {
			choices[string(k)] = true
		}

		return choices, nil
	}

	_ = w.AddBranch(string(key), compose.NewGraphMultiBranch(condition, endNodes))

	return nil
}

func (w *Workflow) connectEndNode(inputFields []*nodes.InputField) error {
	endKey := nodeKey(compose.END)
	deps, err := endKey.resolveDependencies(inputFields, w.connections, w.hierarchy)
	if err != nil {
		return err
	}

	n := w.End()

	for fromNodeKey, fieldMappings := range deps.inputs {
		n.AddInput(string(fromNodeKey), fieldMappings...)
	}

	for fromNodeKey, fieldMappings := range deps.inputsNoDirectDependency {
		n.AddInputWithOptions(string(fromNodeKey), fieldMappings, compose.WithNoDirectDependency())
	}

	for i := range deps.dependencies {
		n.AddDependency(string(deps.dependencies[i]))
	}

	for i := range deps.staticValues {
		n.SetStaticValue(deps.staticValues[i].path, deps.staticValues[i].val)
	}

	return nil
}

func toLambda(l *nodes.Lambda) (*compose.Lambda, error) {
	var (
		i compose.Invoke[map[string]any, map[string]any, any]
		s compose.Stream[map[string]any, map[string]any, any]
		c compose.Collect[map[string]any, map[string]any, any]
		t compose.Transform[map[string]any, map[string]any, any]
	)

	if l.Invoke != nil {
		i = func(ctx context.Context, in map[string]any, opts ...any) (map[string]any, error) {
			return l.Invoke(ctx, in)
		}
	}

	if l.Stream != nil {
		s = func(ctx context.Context, in map[string]any, opts ...any) (*schema.StreamReader[map[string]any], error) {
			return l.Stream(ctx, in)
		}
	}

	if l.Collect != nil {
		c = func(ctx context.Context, in *schema.StreamReader[map[string]any], opts ...any) (map[string]any, error) {
			return l.Collect(ctx, in)
		}
	}

	if l.Transform != nil {
		t = func(ctx context.Context, in *schema.StreamReader[map[string]any], opts ...any) (*schema.StreamReader[map[string]any], error) {
			return l.Transform(ctx, in)
		}
	}

	return compose.AnyLambda(i, s, c, t)
}

type dependencyInfo struct {
	inputs                   map[nodeKey][]*compose.FieldMapping
	dependencies             []nodeKey
	inputsNoDirectDependency map[nodeKey][]*compose.FieldMapping
	staticValues             []*staticValue
	inputsForParent          map[nodeKey][]*compose.FieldMapping
}

type staticValue struct {
	val  any
	path compose.FieldPath
}

type connection struct {
	FromNode   nodeKey `json:"from_node"`
	ToNode     nodeKey `json:"to_node"`
	FromPort   *string `json:"from_port,omitempty"`
	FromBranch bool    `json:"from_branch,omitempty"`
}

type nodeKey string
type nodeHierarchy map[nodeKey][]nodeKey // any node key -> it's parents ordered from bottom up. Top level nodes have no parents.

func (n nodeKey) isInSameWorkflow(otherNodeKey nodeKey, hierarchy nodeHierarchy) bool {
	myParents := hierarchy[n]
	theirParents := hierarchy[otherNodeKey]

	if len(myParents) != len(theirParents) {
		return false
	}

	for i := range myParents {
		if myParents[i] != theirParents[i] {
			return false
		}
	}

	return true
}

func (n nodeKey) isImmediateChildOf(otherNodeKey nodeKey, hierarchy nodeHierarchy) bool {
	myParents := hierarchy[n]
	theirParents := hierarchy[otherNodeKey]

	if len(myParents) != len(theirParents)+1 {
		return false
	}

	if myParents[0] == otherNodeKey {
		return true
	}

	return false
}

type branchMapping []map[nodeKey]bool // choice index -> end nodes

func (n nodeKey) resolveSelector(connections []*connection, portCount int) (*branchMapping, error) {
	m := make([]map[nodeKey]bool, portCount)

	for _, conn := range connections {
		if conn.FromNode != n {
			continue
		}

		if !conn.FromBranch {
			continue
		}

		if conn.FromPort == nil {
			return nil, fmt.Errorf("outgoing connections from selector should have 'from port'. Conn= %+v", conn)
		}

		if *conn.FromPort == "true" { // first condition
			if m[0] == nil {
				m[0] = make(map[nodeKey]bool)
			}

			m[0][conn.ToNode] = true
		} else if *conn.FromPort == "false" { // default condition
			if m[portCount-1] == nil {
				m[portCount-1] = make(map[nodeKey]bool)
			}
			m[portCount-1][conn.ToNode] = true
		} else {
			if !strings.HasPrefix(*conn.FromPort, "true_") {
				return nil, fmt.Errorf("outgoing connections from selector has invalid port= %s", *conn.FromPort)
			}

			index := (*conn.FromPort)[5:]
			i, err := strconv.Atoi(index)
			if err != nil {
				return nil, fmt.Errorf("outgoing connections from selector has invalid port index= %s", *conn.FromPort)
			}
			if i <= 0 || i >= portCount {
				return nil, fmt.Errorf("outgoing connections from selector has invalid port index range= %d, condition count= %d", i, portCount)
			}
			if m[i] == nil {
				m[i] = make(map[nodeKey]bool)
			}
			m[i][conn.ToNode] = true
		}
	}
	return (*branchMapping)(&m), nil
}

func (n nodeKey) resolveDependencies(inputFields []*nodes.InputField, connections []*connection, allNodes nodeHierarchy) (*dependencyInfo, error) {
	var (
		inputs                   = make(map[nodeKey][]*compose.FieldMapping)
		dependencies             []nodeKey
		inputsNoDirectDependency = make(map[nodeKey][]*compose.FieldMapping)
		staticValues             []*staticValue
		inputsForParent          = make(map[nodeKey][]*compose.FieldMapping)
	)

	connMap := make(map[nodeKey]bool) // whether nodeKey is branch
	for _, conn := range connections {
		if conn.ToNode != n {
			continue
		}

		connMap[conn.FromNode] = conn.FromBranch
	}

	for _, inputF := range inputFields {
		if inputF.Info.Source.Val != nil {
			staticValues = append(staticValues, &staticValue{
				val:  inputF.Info.Source.Val,
				path: inputF.Path,
			})
		} else if inputF.Info.Source.Ref != nil {
			fromNode := nodeKey(inputF.Info.Source.Ref.FromNodeKey)
			if ok := n.isInSameWorkflow(fromNode, allNodes); ok {
				if isBranch, ok := connMap[fromNode]; ok && !isBranch { // direct dependency
					inputs[fromNode] = append(inputs[fromNode], compose.MapFieldPaths(inputF.Info.Source.Ref.FromPath, inputF.Path))
				} else if !isBranch { // indirect dependency
					inputsNoDirectDependency[fromNode] = append(inputsNoDirectDependency[fromNode], compose.MapFieldPaths(inputF.Info.Source.Ref.FromPath, inputF.Path))
				} else {
					return nil, fmt.Errorf("input field's from node key= %s, is a branch", fromNode)
				}
			} else if ok := n.isImmediateChildOf(fromNode, allNodes); ok {
				if len(connMap) == 0 { // one of the first nodes in sub workflow
					inputs[compose.START] = append(inputs[compose.START], compose.MapFieldPaths(append(compose.FieldPath{string(fromNode)}, inputF.Info.Source.Ref.FromPath...), inputF.Path))
				} else { // not one of the first nodes in sub workflow, either succeeds other nodes or succeeds branches
					inputsNoDirectDependency[compose.START] = append(inputsNoDirectDependency[compose.START], compose.MapFieldPaths(append(compose.FieldPath{string(fromNode)}, inputF.Info.Source.Ref.FromPath...), inputF.Path))
				}
				inputsForParent[fromNode] = append(inputsForParent[fromNode], compose.MapFieldPaths(inputF.Info.Source.Ref.FromPath, append(compose.FieldPath{string(fromNode)}, inputF.Info.Source.Ref.FromPath...)))
			} else {
				return nil, fmt.Errorf("invalid input field, current node key= %s, from node key= %s, path= %v", n, fromNode, inputF.Path)
			}
		} else {
			return nil, fmt.Errorf("inputField's Val and Ref are both nil. path= %v", inputF.Path)
		}
	}

	for fromNodeKey, isBranch := range connMap {
		if isBranch {
			continue
		}

		if _, ok := inputs[fromNodeKey]; !ok {
			if _, ok := inputsNoDirectDependency[fromNodeKey]; !ok {
				dependencies = append(dependencies, fromNodeKey)
			}
		}
	}

	return &dependencyInfo{
		inputs:                   inputs,
		dependencies:             dependencies,
		inputsNoDirectDependency: inputsNoDirectDependency,
		staticValues:             staticValues,
		inputsForParent:          inputsForParent,
	}, nil
}
