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

func (w *Workflow) addLambda(key nodeKey, l *nodes.Lambda, deps *dependencyInfo) error {
	lambda, err := toLambda(l)
	if err != nil {
		return err
	}

	n := w.AddLambdaNode(string(key), lambda)

	if deps == nil {
		return nil
	}

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

func (w *Workflow) addSelector(key nodeKey, s *selector.Selector, deps *dependencyInfo) error {
	info, err := s.Info()
	if err != nil {
		return err
	}

	if err := w.addLambda(key, info.Lambda, deps); err != nil {
		return err
	}

	bMapping, err := w.resolveSelector(key, s.ConditionCount()+1)
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

func (w *Workflow) connectEndNode(deps *dependencyInfo) error {
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

type nodeWithDeps struct {
	node        nodes.Node
	inputFields []*nodes.InputField
}

type parentNodeInfo struct {
	key        nodeKey
	carryOvers map[nodeKey][]*compose.FieldMapping
}

func (w *Workflow) composeInnerWorkflow(ctx context.Context, innerNodes map[nodeKey]*nodeWithDeps, parentOutputs []*nodes.InputField) (compose.Runnable[map[string]any, map[string]any], *parentNodeInfo, error) {
	// all inner nodes should have the same parent in the hierarchy
	var parent nodeKey
	for key := range innerNodes {
		parents := w.hierarchy[key]
		if len(parents) == 0 {
			return nil, nil, fmt.Errorf("inner workflow node %s has no parents", key)
		}

		if len(parent) == 0 {
			parent = parents[0]
		} else if parent != parents[0] {
			return nil, nil, fmt.Errorf("inner workflow nodes have different parents: %s, %s", parent, parents[0])
		}
	}

	// trim the connections, only keep the connections that are related to the inner workflow
	// ignore the cases when we have nested inner workflows
	innerConnections := make([]*connection, 0)
	for i := range w.connections {
		conn := w.connections[i]
		if _, ok := innerNodes[conn.FromNode]; ok {
			innerConnections = append(innerConnections, conn)
		} else if _, ok := innerNodes[conn.ToNode]; ok {
			innerConnections = append(innerConnections, conn)
		}
	}

	inner := &Workflow{
		workflow:    compose.NewWorkflow[map[string]any, map[string]any](),
		hierarchy:   w.hierarchy, // we keep the entire hierarchy because inner workflow nodes can refer to parent nodes' outputs
		connections: innerConnections,
	}

	parentInfo := &parentNodeInfo{
		key:        parent,
		carryOvers: make(map[nodeKey][]*compose.FieldMapping),
	}

	for key := range innerNodes {
		n := innerNodes[key]
		deps, err := inner.resolveDependencies(key, n.inputFields)
		if err != nil {
			return nil, nil, fmt.Errorf("resolve dependencies of inner node: %s failed: %w", key, err)
		}

		if s, ok := n.node.(*selector.Selector); ok {
			if err := inner.addSelector(key, s, deps); err != nil {
				return nil, nil, fmt.Errorf("add selector node: %s failed: %w", key, err)
			}
		} else {
			info, err := n.node.Info()
			if err != nil {
				return nil, nil, fmt.Errorf("get node info of inner node: %s failed: %w", key, err)
			}

			if err := inner.addLambda(key, info.Lambda, deps); err != nil {
				return nil, nil, fmt.Errorf("add lambda node: %s failed: %w", key, err)
			}
		}

		for fromNodeKey, fieldMappings := range deps.inputsForParent {
			if fromNodeKey == parent { // refer to parent itself, no need to carry over
				continue
			}

			if _, ok := parentInfo.carryOvers[fromNodeKey]; !ok {
				parentInfo.carryOvers[fromNodeKey] = make([]*compose.FieldMapping, 0)
			}

			for _, fm := range fieldMappings {
				duplicate := false
				for _, existing := range parentInfo.carryOvers[fromNodeKey] {
					if *fm == *existing {
						duplicate = true
						break
					}
				}

				if !duplicate {
					parentInfo.carryOvers[fromNodeKey] = append(parentInfo.carryOvers[fromNodeKey], fieldMappings...)
				}
			}

		}
	}

	// parentOutputs should only contain input fields mapped to inner node's outputs.
	// this is the case for batch.
	// TODO: needs to check other node types that can have inner nodes.
	endDeps, err := inner.resolveDependenciesAsParent(parent, parentOutputs)
	if err != nil {
		return nil, nil, fmt.Errorf("resolve dependencies of parent node: %s failed: %w", parent, err)
	}

	if err := inner.connectEndNode(endDeps); err != nil {
		return nil, nil, fmt.Errorf("connect end node failed: %w", err)
	}

	innerRun, err := inner.Compile(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("compile inner node failed: %w", err)
	}

	return innerRun, parentInfo, nil
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

func (d *dependencyInfo) merge(mappings map[nodeKey][]*compose.FieldMapping) error {
	for nKey, fms := range mappings {
		if currentFMS, ok := d.inputs[nKey]; ok {
			for i := range fms {
				fm := fms[i]
				duplicate := false
				for _, currentFM := range currentFMS {
					if *fm == *currentFM {
						duplicate = true
					}
				}

				if !duplicate {
					d.inputs[nKey] = append(d.inputs[nKey], fm)
				}
			}
		} else if currentFMS, ok = d.inputsNoDirectDependency[nKey]; ok {
			for i := range fms {
				fm := fms[i]
				duplicate := false
				for _, currentFM := range currentFMS {
					if *fm == *currentFM {
						duplicate = true
					}
				}

				if !duplicate {
					d.inputsNoDirectDependency[nKey] = append(d.inputsNoDirectDependency[nKey], fm)
				}
			}
		} else {
			currentDependency := -1
			for i, depKey := range d.dependencies {
				if depKey == nKey {
					currentDependency = i
					break
				}
			}

			if currentDependency >= 0 {
				d.dependencies = append(d.dependencies[:currentDependency], d.dependencies[currentDependency+1:]...)
				d.inputs[nKey] = append(d.inputs[nKey], fms...)
			} else {
				d.inputsNoDirectDependency[nKey] = append(d.inputsNoDirectDependency[nKey], fms...)
			}
		}
	}

	return nil
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

func (n nodeKey) isBelowOneLevel(otherNodeKey nodeKey, hierarchy nodeHierarchy) bool {
	myParents := hierarchy[n]
	theirParents := hierarchy[otherNodeKey]

	return len(myParents) == len(theirParents)+1
}

func (n nodeKey) isParentOf(otherNodeKey nodeKey, hierarchy nodeHierarchy) bool {
	myParents := hierarchy[n]
	theirParents := hierarchy[otherNodeKey]

	return len(myParents) == len(theirParents)-1 && theirParents[0] == n
}

type branchMapping []map[nodeKey]bool // choice index -> end nodes

func (w *Workflow) resolveSelector(n nodeKey, portCount int) (*branchMapping, error) {
	m := make([]map[nodeKey]bool, portCount)

	for _, conn := range w.connections {
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

func (w *Workflow) resolveDependencies(n nodeKey, inputFields []*nodes.InputField) (*dependencyInfo, error) {
	var (
		inputs                   = make(map[nodeKey][]*compose.FieldMapping)
		dependencies             []nodeKey
		inputsNoDirectDependency = make(map[nodeKey][]*compose.FieldMapping)
		staticValues             []*staticValue
		inputsForParent          = make(map[nodeKey][]*compose.FieldMapping)
	)

	connMap := make(map[nodeKey]connection) // whether nodeKey is branch
	for _, conn := range w.connections {
		if conn.ToNode != n {
			continue
		}

		connMap[conn.FromNode] = *conn
	}

	for _, inputF := range inputFields {
		if inputF.Info.Source.Val != nil {
			staticValues = append(staticValues, &staticValue{
				val:  inputF.Info.Source.Val,
				path: inputF.Path,
			})
		} else if inputF.Info.Source.Ref != nil {
			fromNode := nodeKey(inputF.Info.Source.Ref.FromNodeKey)
			if ok := n.isInSameWorkflow(fromNode, w.hierarchy); ok {
				if _, ok := connMap[fromNode]; ok { // direct dependency
					inputs[fromNode] = append(inputs[fromNode], compose.MapFieldPaths(inputF.Info.Source.Ref.FromPath, inputF.Path))
				} else { // indirect dependency
					inputsNoDirectDependency[fromNode] = append(inputsNoDirectDependency[fromNode], compose.MapFieldPaths(inputF.Info.Source.Ref.FromPath, inputF.Path))
				}
			} else if ok := n.isBelowOneLevel(fromNode, w.hierarchy); ok {
				firstNodesInSubWorkflow := true
				for _, conn := range connMap {
					if n.isInSameWorkflow(conn.FromNode, w.hierarchy) {
						firstNodesInSubWorkflow = false
						break
					}
				}

				if firstNodesInSubWorkflow { // one of the first nodes in sub workflow
					inputs[compose.START] = append(inputs[compose.START], compose.MapFieldPaths(append(compose.FieldPath{string(fromNode)}, inputF.Info.Source.Ref.FromPath...), inputF.Path))
				} else { // not one of the first nodes in sub workflow, either succeeds other nodes or succeeds branches
					inputsNoDirectDependency[compose.START] = append(inputsNoDirectDependency[compose.START], compose.MapFieldPaths(append(compose.FieldPath{string(fromNode)}, inputF.Info.Source.Ref.FromPath...), inputF.Path))
				}
				inputsForParent[fromNode] = append(inputsForParent[fromNode], compose.MapFieldPaths(inputF.Info.Source.Ref.FromPath, append(compose.FieldPath{string(fromNode)}, inputF.Info.Source.Ref.FromPath...)))
			}
		} else {
			return nil, fmt.Errorf("inputField's Val and Ref are both nil. path= %v", inputF.Path)
		}
	}

	for fromNodeKey, conn := range connMap {
		if conn.FromBranch {
			continue
		}

		if !n.isInSameWorkflow(fromNodeKey, w.hierarchy) {
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

func (w *Workflow) resolveDependenciesAsParent(n nodeKey, inputFields []*nodes.InputField) (*dependencyInfo, error) {
	var (
		inputs                   = make(map[nodeKey][]*compose.FieldMapping)
		dependencies             []nodeKey
		inputsNoDirectDependency = make(map[nodeKey][]*compose.FieldMapping)
	)

	connMap := make(map[nodeKey]connection) // whether nodeKey is branch
	for _, conn := range w.connections {
		if conn.ToNode != n {
			continue
		}

		if conn.FromNode.isInSameWorkflow(n, w.hierarchy) {
			continue
		}

		connMap[conn.FromNode] = *conn
	}

	for _, inputF := range inputFields {
		if inputF.Info.Source.Ref != nil {
			fromNode := nodeKey(inputF.Info.Source.Ref.FromNodeKey)
			if ok := n.isParentOf(fromNode, w.hierarchy); ok {
				if _, ok := connMap[fromNode]; ok { // direct dependency
					inputs[fromNode] = append(inputs[fromNode], compose.MapFieldPaths(inputF.Info.Source.Ref.FromPath, append(compose.FieldPath{string(fromNode)}, inputF.Info.Source.Ref.FromPath...)))
				} else { // indirect dependency
					inputsNoDirectDependency[fromNode] = append(inputsNoDirectDependency[fromNode], compose.MapFieldPaths(inputF.Info.Source.Ref.FromPath, append(compose.FieldPath{string(fromNode)}, inputF.Info.Source.Ref.FromPath...)))
				}
			}
		}
	}

	for fromNodeKey, conn := range connMap {
		if conn.FromBranch {
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
	}, nil
}
