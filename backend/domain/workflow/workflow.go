package workflow

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
)

type workflow = compose.Workflow[map[string]any, map[string]any]

type Workflow struct {
	*workflow
	hierarchy       nodeHierarchy
	connections     []*connection
	interruptBefore []string
	entry           *compose.WorkflowNode
	exitNodeKey     string
	inner           bool
}

type innerWorkflowInfo struct {
	inner      compose.Runnable[map[string]any, map[string]any]
	carryOvers map[nodes.NodeKey][]*compose.FieldMapping
}

func (w *Workflow) AddNode(ctx context.Context, ns *schema.NodeSchema, inner *innerWorkflowInfo) (map[nodes.NodeKey][]*compose.FieldMapping, error) {
	key := ns.Key
	implicitInputs, err := ns.GetImplicitInputFields()
	if err != nil {
		return nil, err
	}

	var deps *dependencyInfo
	if len(implicitInputs) == 0 {
		deps, err = w.resolveDependencies(key, ns.InputSources)
	} else {
		combinedInputs := append(implicitInputs, ns.InputSources...)
		combinedInputs, err = schema.DeduplicateInputFields(combinedInputs)
		if err != nil {
			return nil, err
		}

		deps, err = w.resolveDependencies(key, combinedInputs)
	}

	if err != nil {
		return nil, err
	}

	if inner != nil {
		if err = deps.merge(inner.carryOvers); err != nil {
			return nil, err
		}
	}

	var innerWorkflow compose.Runnable[map[string]any, map[string]any]
	if inner != nil {
		innerWorkflow = inner.inner
	}

	ins, err := ns.New(ctx, innerWorkflow)
	if err != nil {
		return nil, err
	}

	if ins.InterruptBefore {
		w.interruptBefore = append(w.interruptBefore, string(key))
	}

	preHandler := ns.StatePreHandler()
	var opts []compose.GraphAddNodeOpt
	if preHandler != nil {
		opts = append(opts, compose.WithStatePreHandler(preHandler))
	}

	var wNode *compose.WorkflowNode
	if ins.Lambda != nil {
		wNode = w.AddLambdaNode(string(key), ins.Lambda, opts...)
	} else if ins.Graph != nil {
		wNode = w.AddGraphNode(string(key), ins.Graph, opts...)
	} else {
		return nil, fmt.Errorf("node instance has neither Lambda or AnyGraph: %s", key)
	}

	for fromNodeKey, fieldMappings := range deps.inputs {
		wNode.AddInput(string(fromNodeKey), fieldMappings...)
	}

	for fromNodeKey, fieldMappings := range deps.inputsNoDirectDependency {
		wNode.AddInputWithOptions(string(fromNodeKey), fieldMappings, compose.WithNoDirectDependency())
	}

	for i := range deps.dependencies {
		wNode.AddDependency(string(deps.dependencies[i]))
	}

	for i := range deps.staticValues {
		wNode.SetStaticValue(deps.staticValues[i].path, deps.staticValues[i].val)
	}

	if ns.Type == schema.NodeTypeEntry {
		if w.entry != nil {
			return nil, errors.New("entry node already set")
		}
		w.entry = wNode
	} else if ns.Type == schema.NodeTypeExit {
		if w.exitNodeKey != "" {
			return nil, errors.New("exit node already set")
		}
		w.exitNodeKey = string(key)
	}

	outputPortCount := ns.OutputPortCount()
	if outputPortCount > 1 {
		bMapping, err := w.resolveBranch(key, outputPortCount)
		if err != nil {
			return nil, err
		}

		branch, err := ns.GetBranch(bMapping)
		if err != nil {
			return nil, err
		}

		_ = w.AddBranch(string(key), branch)
	}

	return deps.inputsForParent, nil
}

func (w *Workflow) Compile(ctx context.Context, opts ...compose.GraphCompileOption) (compose.Runnable[map[string]any, map[string]any], error) {
	if !w.inner {
		if w.entry == nil {
			return nil, fmt.Errorf("entry node is not set")
		}

		if len(w.exitNodeKey) == 0 {
			return nil, fmt.Errorf("exit node is not set")
		}

		w.entry.AddInput(compose.START)
		w.End().AddInput(w.exitNodeKey)
	}

	if len(w.interruptBefore) > 0 {
		opts = append(opts, compose.WithInterruptBeforeNodes(w.interruptBefore))
	}

	return w.workflow.Compile(ctx, opts...)
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

type parentNodeInfo struct {
	key        nodes.NodeKey
	carryOvers map[nodes.NodeKey][]*compose.FieldMapping
}

func (w *Workflow) composeInnerWorkflow(
	ctx context.Context, innerNodeList []*schema.NodeSchema, parentOutputs []*nodes.FieldInfo) (
	compose.Runnable[map[string]any, map[string]any], *parentNodeInfo, error) {
	// all inner nodes should have the same parent in the hierarchy
	var parent nodes.NodeKey
	for _, n := range innerNodeList {
		parents := w.hierarchy[n.Key]
		if len(parents) == 0 {
			return nil, nil, fmt.Errorf("inner workflow node %s has no parents", n.Key)
		}

		if len(parent) == 0 {
			parent = parents[0]
		} else if parent != parents[0] {
			return nil, nil, fmt.Errorf("inner workflow nodes have different parents: %s, %s", parent, parents[0])
		}
	}

	innerNodes := make(map[nodes.NodeKey]*schema.NodeSchema)
	for _, n := range innerNodeList {
		innerNodes[n.Key] = n
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
		workflow:    compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(schema.GenState())),
		hierarchy:   w.hierarchy, // we keep the entire hierarchy because inner workflow nodes can refer to parent nodes' outputs
		connections: innerConnections,
		inner:       true,
	}

	parentInfo := &parentNodeInfo{
		key:        parent,
		carryOvers: make(map[nodes.NodeKey][]*compose.FieldMapping),
	}

	for key := range innerNodes {
		inputsForParent, err := inner.AddNode(ctx, innerNodes[key], nil)
		if err != nil {
			return nil, nil, err
		}

		for fromNodeKey, fieldMappings := range inputsForParent {
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

type dependencyInfo struct {
	inputs                   map[nodes.NodeKey][]*compose.FieldMapping
	dependencies             []nodes.NodeKey
	inputsNoDirectDependency map[nodes.NodeKey][]*compose.FieldMapping
	staticValues             []*staticValue
	inputsForParent          map[nodes.NodeKey][]*compose.FieldMapping
}

func (d *dependencyInfo) merge(mappings map[nodes.NodeKey][]*compose.FieldMapping) error {
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
	FromNode   nodes.NodeKey `json:"from_node"`
	ToNode     nodes.NodeKey `json:"to_node"`
	FromPort   *string       `json:"from_port,omitempty"`
	FromBranch bool          `json:"from_branch,omitempty"`
}

type nodeHierarchy map[nodes.NodeKey][]nodes.NodeKey // any node key -> it's parents ordered from bottom up. Top level nodes have no parents.

func (n nodeHierarchy) isInSameWorkflow(nodeKey, otherNodeKey nodes.NodeKey) bool {
	myParents := n[nodeKey]
	theirParents := n[otherNodeKey]

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

func (n nodeHierarchy) isBelowOneLevel(nodeKey, otherNodeKey nodes.NodeKey) bool {
	myParents := n[nodeKey]
	theirParents := n[otherNodeKey]

	return len(myParents) == len(theirParents)+1
}

func (n nodeHierarchy) isParentOf(nodeKey, otherNodeKey nodes.NodeKey) bool {
	myParents := n[nodeKey]
	theirParents := n[otherNodeKey]

	return len(myParents) == len(theirParents)-1 && theirParents[0] == nodeKey
}

func (w *Workflow) resolveBranch(n nodes.NodeKey, portCount int) (*schema.BranchMapping, error) {
	m := make([]map[string]bool, portCount)

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

		if *conn.FromPort == "default" { // default condition
			if m[portCount-1] == nil {
				m[portCount-1] = make(map[string]bool)
			}
			m[portCount-1][string(conn.ToNode)] = true
		} else {
			if !strings.HasPrefix(*conn.FromPort, "branch_") {
				return nil, fmt.Errorf("outgoing connections from selector has invalid port= %s", *conn.FromPort)
			}

			index := (*conn.FromPort)[7:]
			i, err := strconv.Atoi(index)
			if err != nil {
				return nil, fmt.Errorf("outgoing connections from selector has invalid port index= %s", *conn.FromPort)
			}
			if i < 0 || i >= portCount {
				return nil, fmt.Errorf("outgoing connections from selector has invalid port index range= %d, condition count= %d", i, portCount)
			}
			if m[i] == nil {
				m[i] = make(map[string]bool)
			}
			m[i][string(conn.ToNode)] = true
		}
	}
	return (*schema.BranchMapping)(&m), nil
}

func (w *Workflow) resolveDependencies(n nodes.NodeKey, sourceWithPaths []*nodes.FieldInfo) (*dependencyInfo, error) {
	var (
		inputs                   = make(map[nodes.NodeKey][]*compose.FieldMapping)
		dependencies             []nodes.NodeKey
		inputsNoDirectDependency = make(map[nodes.NodeKey][]*compose.FieldMapping)
		staticValues             []*staticValue
		inputsForParent          = make(map[nodes.NodeKey][]*compose.FieldMapping)
	)

	connMap := make(map[nodes.NodeKey]connection) // whether nodeKey is branch
	for _, conn := range w.connections {
		if conn.ToNode != n {
			continue
		}

		connMap[conn.FromNode] = *conn
	}

	for _, swp := range sourceWithPaths {
		if swp.Source.Val != nil {
			staticValues = append(staticValues, &staticValue{
				val:  swp.Source.Val,
				path: swp.Path,
			})
		} else if swp.Source.Ref != nil {
			fromNode := swp.Source.Ref.FromNodeKey

			if len(fromNode) == 0 { // skip all variables, they are handled in state pre handler
				continue
			}

			if ok := w.hierarchy.isInSameWorkflow(n, fromNode); ok {
				if _, ok := connMap[fromNode]; ok { // direct dependency
					inputs[fromNode] = append(inputs[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, swp.Path))
				} else { // indirect dependency
					inputsNoDirectDependency[fromNode] = append(inputsNoDirectDependency[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, swp.Path))
				}
			} else if ok := w.hierarchy.isBelowOneLevel(n, fromNode); ok {
				firstNodesInSubWorkflow := true
				for _, conn := range connMap {
					if w.hierarchy.isInSameWorkflow(n, conn.FromNode) {
						firstNodesInSubWorkflow = false
						break
					}
				}

				if firstNodesInSubWorkflow { // one of the first nodes in sub workflow
					inputs[compose.START] = append(inputs[compose.START], compose.MapFieldPaths(append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...), swp.Path))
				} else { // not one of the first nodes in sub workflow, either succeeds other nodes or succeeds branches
					inputsNoDirectDependency[compose.START] = append(inputsNoDirectDependency[compose.START], compose.MapFieldPaths(append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...), swp.Path))
				}
				inputsForParent[fromNode] = append(inputsForParent[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...)))
			}
		} else {
			return nil, fmt.Errorf("inputField's Val and Ref are both nil. path= %v", swp.Path)
		}
	}

	for fromNodeKey, conn := range connMap {
		if conn.FromBranch {
			continue
		}

		if !w.hierarchy.isInSameWorkflow(n, fromNodeKey) {
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

func (w *Workflow) resolveDependenciesAsParent(n nodes.NodeKey, sourceWithPaths []*nodes.FieldInfo) (*dependencyInfo, error) {
	var (
		inputs                   = make(map[nodes.NodeKey][]*compose.FieldMapping)
		dependencies             []nodes.NodeKey
		inputsNoDirectDependency = make(map[nodes.NodeKey][]*compose.FieldMapping)
	)

	connMap := make(map[nodes.NodeKey]connection) // whether nodeKey is branch
	for _, conn := range w.connections {
		if conn.ToNode != n {
			continue
		}

		if w.hierarchy.isInSameWorkflow(conn.FromNode, n) {
			continue
		}

		connMap[conn.FromNode] = *conn
	}

	for _, swp := range sourceWithPaths {
		if swp.Source.Ref != nil {
			fromNode := swp.Source.Ref.FromNodeKey

			if len(fromNode) == 0 { // skip all variables, they are handled in state pre handler
				continue
			}

			if ok := w.hierarchy.isParentOf(n, fromNode); ok {
				if _, ok := connMap[fromNode]; ok { // direct dependency
					inputs[fromNode] = append(inputs[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...)))
				} else { // indirect dependency
					inputsNoDirectDependency[fromNode] = append(inputsNoDirectDependency[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...)))
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
