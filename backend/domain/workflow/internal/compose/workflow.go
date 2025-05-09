package compose

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose/checkpoint"
)

type workflow = compose.Workflow[map[string]any, map[string]any]

type Workflow struct {
	*workflow
	hierarchy         map[vo.NodeKey]vo.NodeKey
	connections       []*Connection
	requireCheckpoint bool
	entry             *compose.WorkflowNode
	exitNodeKey       string
	inner             bool
	streamRun         bool
	Runner            compose.Runnable[map[string]any, map[string]any] // TODO: this will be unexported eventually
	input             map[string]*vo.TypeInfo
	output            map[string]*vo.TypeInfo
}

func NewWorkflow(ctx context.Context, sc *WorkflowSchema, opts ...compose.GraphCompileOption) (*Workflow, error) {
	sc.Init()

	wf := &Workflow{
		workflow:    compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(GenState())),
		hierarchy:   sc.Hierarchy,
		connections: sc.Connections,
	}

	for _, ns := range sc.Nodes {
		if ns.RequiresStreaming() {
			wf.streamRun = true
			break
		}
	}

	for _, ns := range sc.Nodes {
		if err := ns.SetStreamSources(sc.GetAllNodes()); err != nil {
			return nil, err
		}
	}

	// add all composite nodes with their inner workflow
	compositeNodes := sc.GetCompositeNodes()
	processedNodeKey := make(map[vo.NodeKey]struct{})
	for i := range compositeNodes {
		cNode := compositeNodes[i]
		if err := wf.AddCompositeNode(ctx, cNode); err != nil {
			return nil, err
		}

		processedNodeKey[cNode.Parent.Key] = struct{}{}
		for _, child := range cNode.Children {
			processedNodeKey[child.Key] = struct{}{}
		}
	}

	// add all nodes other than composite nodes and their children
	for _, ns := range sc.Nodes {
		if _, ok := processedNodeKey[ns.Key]; !ok {
			if err := wf.AddNode(ctx, ns); err != nil {
				return nil, err
			}
		}
	}

	wf.requireCheckpoint = sc.RequireCheckpoint()

	var compileOpts []compose.GraphCompileOption
	compileOpts = append(compileOpts, opts...)
	if wf.requireCheckpoint {
		compileOpts = append(compileOpts, compose.WithCheckPointStore(checkpoint.GetStore()))
	}

	r, err := wf.Compile(ctx, compileOpts...)
	if err != nil {
		return nil, err
	}
	wf.Runner = r

	wf.input = sc.GetNode(EntryNodeKey).OutputTypes
	wf.output = sc.GetNode(ExitNodeKey).InputTypes // TODO: when exit node is in streaming answer mode, this should be a single 'output' field

	return wf, nil
}

func (w *Workflow) Run(ctx context.Context, in map[string]any, opts ...compose.Option) {
	if w.streamRun {
		go func() {
			_, _ = w.Runner.Stream(ctx, in, opts...)
		}()

		return
	}

	go func() {
		_, _ = w.Runner.Invoke(ctx, in, opts...)
	}()
}

func (w *Workflow) Inputs() map[string]*vo.TypeInfo {
	return w.input
}

func (w *Workflow) Outputs() map[string]*vo.TypeInfo {
	return w.output
}

type innerWorkflowInfo struct {
	inner      compose.Runnable[map[string]any, map[string]any]
	carryOvers map[vo.NodeKey][]*compose.FieldMapping
}

func (w *Workflow) AddNode(ctx context.Context, ns *NodeSchema) error {
	_, err := w.addNodeInternal(ctx, ns, nil)
	return err
}

func (w *Workflow) AddCompositeNode(ctx context.Context, cNode *CompositeNode) error {
	inner, err := w.getInnerWorkflow(ctx, cNode)
	if err != nil {
		return err
	}
	_, err = w.addNodeInternal(ctx, cNode.Parent, inner)
	return err
}

func (w *Workflow) addInnerNode(ctx context.Context, cNode *NodeSchema) (map[vo.NodeKey][]*compose.FieldMapping, error) {
	return w.addNodeInternal(ctx, cNode, nil)
}

func (w *Workflow) addNodeInternal(ctx context.Context, ns *NodeSchema, inner *innerWorkflowInfo) (map[vo.NodeKey][]*compose.FieldMapping, error) {
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
		combinedInputs, err = DeduplicateInputFields(combinedInputs)
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

	preHandler := ns.StatePreHandler()
	var opts []compose.GraphAddNodeOpt
	opts = append(opts, compose.WithNodeName(string(ns.Key)))
	if preHandler != nil {
		opts = append(opts, compose.WithStatePreHandler(preHandler))
	}

	var wNode *compose.WorkflowNode
	if ins.Lambda != nil {
		wNode = w.AddLambdaNode(string(key), ins.Lambda, opts...)
	} else {
		return nil, fmt.Errorf("node instance has no Lambda: %s", key)
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

	if ns.Type == entity.NodeTypeEntry {
		if w.entry != nil {
			return nil, errors.New("entry node already set")
		}
		w.entry = wNode
	} else if ns.Type == entity.NodeTypeExit {
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

	return w.workflow.Compile(ctx, opts...)
}

func (w *Workflow) getInnerWorkflow(ctx context.Context, cNode *CompositeNode) (*innerWorkflowInfo, error) {
	innerNodes := make(map[vo.NodeKey]*NodeSchema)
	for _, n := range cNode.Children {
		innerNodes[n.Key] = n
	}

	// trim the connections, only keep the connections that are related to the inner workflow
	// ignore the cases when we have nested inner workflows
	innerConnections := make([]*Connection, 0)
	for i := range w.connections {
		conn := w.connections[i]
		if _, ok := innerNodes[conn.FromNode]; ok {
			innerConnections = append(innerConnections, conn)
		} else if _, ok := innerNodes[conn.ToNode]; ok {
			innerConnections = append(innerConnections, conn)
		}
	}

	inner := &Workflow{
		workflow:    compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(GenState())),
		hierarchy:   w.hierarchy, // we keep the entire hierarchy because inner workflow nodes can refer to parent nodes' outputs
		connections: innerConnections,
		inner:       true,
	}

	carryOvers := make(map[vo.NodeKey][]*compose.FieldMapping)

	for key := range innerNodes {
		inputsForParent, err := inner.addInnerNode(ctx, innerNodes[key])
		if err != nil {
			return nil, err
		}

		for fromNodeKey, fieldMappings := range inputsForParent {
			if fromNodeKey == cNode.Parent.Key { // refer to parent itself, no need to carry over
				continue
			}

			if _, ok := carryOvers[fromNodeKey]; !ok {
				carryOvers[fromNodeKey] = make([]*compose.FieldMapping, 0)
			}

			for _, fm := range fieldMappings {
				duplicate := false
				for _, existing := range carryOvers[fromNodeKey] {
					if *fm == *existing {
						duplicate = true
						break
					}
				}

				if !duplicate {
					carryOvers[fromNodeKey] = append(carryOvers[fromNodeKey], fieldMappings...)
				}
			}
		}
	}

	endDeps, err := inner.resolveDependenciesAsParent(cNode.Parent.Key, cNode.Parent.OutputSources)
	if err != nil {
		return nil, fmt.Errorf("resolve dependencies of parent node: %s failed: %w", cNode.Parent.Key, err)
	}

	n := inner.End()

	for fromNodeKey, fieldMappings := range endDeps.inputs {
		n.AddInput(string(fromNodeKey), fieldMappings...)
	}

	for fromNodeKey, fieldMappings := range endDeps.inputsNoDirectDependency {
		n.AddInputWithOptions(string(fromNodeKey), fieldMappings, compose.WithNoDirectDependency())
	}

	for i := range endDeps.dependencies {
		n.AddDependency(string(endDeps.dependencies[i]))
	}

	for i := range endDeps.staticValues {
		n.SetStaticValue(endDeps.staticValues[i].path, endDeps.staticValues[i].val)
	}

	r, err := inner.Compile(ctx)
	if err != nil {
		return nil, err
	}

	return &innerWorkflowInfo{
		inner:      r,
		carryOvers: carryOvers,
	}, nil
}

type dependencyInfo struct {
	inputs                   map[vo.NodeKey][]*compose.FieldMapping
	dependencies             []vo.NodeKey
	inputsNoDirectDependency map[vo.NodeKey][]*compose.FieldMapping
	staticValues             []*staticValue
	inputsForParent          map[vo.NodeKey][]*compose.FieldMapping
}

func (d *dependencyInfo) merge(mappings map[vo.NodeKey][]*compose.FieldMapping) error {
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

func (w *Workflow) resolveBranch(n vo.NodeKey, portCount int) (*BranchMapping, error) {
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
	return (*BranchMapping)(&m), nil
}

func (w *Workflow) resolveDependencies(n vo.NodeKey, sourceWithPaths []*vo.FieldInfo) (*dependencyInfo, error) {
	var (
		inputs                   = make(map[vo.NodeKey][]*compose.FieldMapping)
		dependencies             []vo.NodeKey
		inputsNoDirectDependency = make(map[vo.NodeKey][]*compose.FieldMapping)
		staticValues             []*staticValue
		inputsForParent          = make(map[vo.NodeKey][]*compose.FieldMapping)
	)

	connMap := make(map[vo.NodeKey]Connection) // whether nodeKey is branch
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

			if len(fromNode) == 0 || fromNode == n { // skip all variables, they are handled in state pre handler. Also skip reference to self
				continue
			}

			if ok := IsInSameWorkflow(w.hierarchy, n, fromNode); ok {
				if _, ok := connMap[fromNode]; ok { // direct dependency
					inputs[fromNode] = append(inputs[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, swp.Path))
				} else { // indirect dependency
					inputsNoDirectDependency[fromNode] = append(inputsNoDirectDependency[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, swp.Path))
				}
			} else if ok := IsBelowOneLevel(w.hierarchy, n, fromNode); ok {
				firstNodesInSubWorkflow := true
				for _, conn := range connMap {
					if IsInSameWorkflow(w.hierarchy, n, conn.FromNode) {
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

		if IsBelowOneLevel(w.hierarchy, n, fromNodeKey) {
			fromNodeKey = compose.START
		} else if !IsInSameWorkflow(w.hierarchy, n, fromNodeKey) {
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

func (w *Workflow) resolveDependenciesAsParent(n vo.NodeKey, sourceWithPaths []*vo.FieldInfo) (*dependencyInfo, error) {
	var (
		inputs                   = make(map[vo.NodeKey][]*compose.FieldMapping)
		dependencies             []vo.NodeKey
		inputsNoDirectDependency = make(map[vo.NodeKey][]*compose.FieldMapping)
	)

	connMap := make(map[vo.NodeKey]Connection) // whether nodeKey is branch
	for _, conn := range w.connections {
		if conn.ToNode != n {
			continue
		}

		if IsInSameWorkflow(w.hierarchy, conn.FromNode, n) {
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

			if ok := IsParentOf(w.hierarchy, n, fromNode); ok {
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
