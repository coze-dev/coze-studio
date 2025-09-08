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

package compose

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/compose"

	workflow2 "github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/exit"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type workflow = compose.Workflow[map[string]any, map[string]any]

type Workflow struct { // TODO: too many fields in this struct, cut them down to the absolutely essentials
	*workflow
	hierarchy         map[vo.NodeKey]vo.NodeKey
	connections       []*schema.Connection
	requireCheckpoint bool
	entry             *compose.WorkflowNode
	inner             bool
	fromNode          bool // this workflow is constructed from a single node, without Entry or Exit nodes
	streamRun         bool
	Runner            compose.Runnable[map[string]any, map[string]any] // TODO: this will be unexported eventually
	input             map[string]*vo.TypeInfo
	output            map[string]*vo.TypeInfo
	terminatePlan     vo.TerminatePlan
	schema            *schema.WorkflowSchema
}

type workflowOptions struct {
	wfID                    int64
	idAsName                bool
	parentRequireCheckpoint bool
	maxNodeCount            int
}

type WorkflowOption func(*workflowOptions)

func WithIDAsName(id int64) WorkflowOption {
	return func(opts *workflowOptions) {
		opts.wfID = id
		opts.idAsName = true
	}
}

func WithParentRequireCheckpoint() WorkflowOption {
	return func(opts *workflowOptions) {
		opts.parentRequireCheckpoint = true
	}
}

func WithMaxNodeCount(c int) WorkflowOption {
	return func(opts *workflowOptions) {
		opts.maxNodeCount = c
	}
}

func NewWorkflow(ctx context.Context, sc *schema.WorkflowSchema, opts ...WorkflowOption) (*Workflow, error) {
	sc.Init()

	wf := &Workflow{
		workflow:    compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(GenState())),
		hierarchy:   sc.Hierarchy,
		connections: sc.Connections,
		schema:      sc,
	}

	wf.streamRun = sc.RequireStreaming()
	wf.requireCheckpoint = sc.RequireCheckpoint()

	wfOpts := &workflowOptions{}
	for _, opt := range opts {
		opt(wfOpts)
	}

	if wfOpts.maxNodeCount > 0 {
		if sc.NodeCount() > int32(wfOpts.maxNodeCount) {
			return nil, fmt.Errorf("node count %d exceeds the limit: %d", sc.NodeCount(), wfOpts.maxNodeCount)
		}
	}

	if wfOpts.parentRequireCheckpoint {
		wf.requireCheckpoint = true
	}

	wf.input = sc.GetNode(entity.EntryNodeKey).OutputTypes

	// even if the terminate plan is use answer content, this still will be 'input types' of exit node
	wf.output = sc.GetNode(entity.ExitNodeKey).InputTypes

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

		if ns.Type == entity.NodeTypeExit {
			wf.terminatePlan = ns.Configs.(*exit.Config).TerminatePlan
		}
	}

	var compileOpts []compose.GraphCompileOption
	if wf.requireCheckpoint {
		compileOpts = append(compileOpts, compose.WithCheckPointStore(workflow2.GetRepository()))
	}
	if wfOpts.idAsName {
		compileOpts = append(compileOpts, compose.WithGraphName(strconv.FormatInt(wfOpts.wfID, 10)))
	}

	r, err := wf.Compile(ctx, compileOpts...)
	if err != nil {
		return nil, err
	}
	wf.Runner = r

	return wf, nil
}

func (w *Workflow) AsyncRun(ctx context.Context, in map[string]any, opts ...compose.Option) {
	if w.streamRun {
		safego.Go(ctx, func() {
			_, _ = w.Runner.Stream(ctx, in, opts...)
		})
		return
	}

	safego.Go(ctx, func() {
		_, _ = w.Runner.Invoke(ctx, in, opts...)
	})
}

func (w *Workflow) SyncRun(ctx context.Context, in map[string]any, opts ...compose.Option) (map[string]any, error) {
	return w.Runner.Invoke(ctx, in, opts...)
}

func (w *Workflow) Inputs() map[string]*vo.TypeInfo {
	return w.input
}

func (w *Workflow) Outputs() map[string]*vo.TypeInfo {
	return w.output
}

func (w *Workflow) StreamRun() bool {
	return w.streamRun
}

func (w *Workflow) TerminatePlan() vo.TerminatePlan {
	return w.terminatePlan
}

type innerWorkflowInfo struct {
	inner      compose.Runnable[map[string]any, map[string]any]
	carryOvers map[vo.NodeKey][]*compose.FieldMapping
}

func (w *Workflow) AddNode(ctx context.Context, ns *schema.NodeSchema) error {
	_, err := w.addNodeInternal(ctx, ns, nil)
	return err
}

func (w *Workflow) AddCompositeNode(ctx context.Context, cNode *schema.CompositeNode) error {
	inner, err := w.getInnerWorkflow(ctx, cNode)
	if err != nil {
		return err
	}
	_, err = w.addNodeInternal(ctx, cNode.Parent, inner)
	return err
}

func (w *Workflow) addInnerNode(ctx context.Context, cNode *schema.NodeSchema) (map[vo.NodeKey][]*compose.FieldMapping, error) {
	return w.addNodeInternal(ctx, cNode, nil)
}

func (w *Workflow) addNodeInternal(ctx context.Context, ns *schema.NodeSchema, inner *innerWorkflowInfo) (map[vo.NodeKey][]*compose.FieldMapping, error) {
	key := ns.Key
	var deps *dependencyInfo

	deps, err := w.resolveDependencies(key, ns.InputSources)
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

	ins, err := New(ctx, ns, innerWorkflow, w.schema, deps, w.requireCheckpoint)
	if err != nil {
		return nil, err
	}

	var opts []compose.GraphAddNodeOpt
	opts = append(opts, compose.WithNodeName(string(ns.Key)))

	preHandler := statePreHandler(ns, w.streamRun)
	if preHandler != nil {
		opts = append(opts, preHandler)
	}

	postHandler := statePostHandler(ns, w.streamRun)
	if postHandler != nil {
		opts = append(opts, postHandler)
	}

	var wNode *compose.WorkflowNode
	if ins.Lambda != nil {
		wNode = w.AddLambdaNode(string(key), ins.Lambda, opts...)
	} else {
		return nil, fmt.Errorf("node instance has no Lambda: %s", key)
	}

	if err = deps.arrayDrillDown(w.schema.GetAllNodes()); err != nil {
		return nil, err
	}

	for fromNodeKey := range deps.inputsFull {
		wNode.AddInput(string(fromNodeKey))
	}

	for fromNodeKey, fieldMappings := range deps.inputs {
		wNode.AddInput(string(fromNodeKey), fieldMappings...)
	}

	for fromNodeKey := range deps.inputsNoDirectDependencyFull {
		wNode.AddInputWithOptions(string(fromNodeKey), nil, compose.WithNoDirectDependency())
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
	}

	b := w.schema.GetBranch(ns.Key)
	if b != nil {
		if b.OnlyException() {
			_ = w.AddBranch(string(key), b.GetExceptionBranch())
		} else {
			bb, ok := ns.Configs.(schema.BranchBuilder)
			if !ok {
				return nil, fmt.Errorf("node schema's Configs should implement BranchBuilder, node type= %v", ns.Type)
			}

			br, err := b.GetFullBranch(ctx, bb)
			if err != nil {
				return nil, err
			}

			_ = w.AddBranch(string(key), br)
		}
	}

	return deps.inputsForParent, nil
}

func (w *Workflow) Compile(ctx context.Context, opts ...compose.GraphCompileOption) (compose.Runnable[map[string]any, map[string]any], error) {
	if !w.inner && !w.fromNode {
		if w.entry == nil {
			return nil, fmt.Errorf("entry node is not set")
		}

		w.entry.AddInput(compose.START)
		w.End().AddInput(entity.ExitNodeKey)
	}

	return w.workflow.Compile(ctx, opts...)
}

func (w *Workflow) getInnerWorkflow(ctx context.Context, cNode *schema.CompositeNode) (*innerWorkflowInfo, error) {
	innerNodes := make(map[vo.NodeKey]*schema.NodeSchema)
	for _, n := range cNode.Children {
		innerNodes[n.Key] = n
	}

	// trim the connections, only keep the connections that are related to the inner workflow
	// ignore the cases when we have nested inner workflows, because we do not support nested composite nodes
	innerConnections := make([]*schema.Connection, 0)
	for i := range w.schema.Connections {
		conn := w.schema.Connections[i]
		if _, ok := innerNodes[conn.FromNode]; ok {
			innerConnections = append(innerConnections, conn)
		} else if _, ok := innerNodes[conn.ToNode]; ok {
			innerConnections = append(innerConnections, conn)
		}
	}

	inner := &Workflow{
		workflow:          compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(GenState())),
		hierarchy:         w.hierarchy, // we keep the entire hierarchy because inner workflow nodes can refer to parent nodes' outputs
		connections:       innerConnections,
		inner:             true,
		requireCheckpoint: w.requireCheckpoint,
		schema:            w.schema,
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

			addFieldMappingsWithDeduplication(carryOvers, fromNodeKey, fieldMappings)
		}
	}

	endDeps, err := inner.resolveDependenciesAsParent(cNode.Parent.Key, cNode.Parent.OutputSources)
	if err != nil {
		return nil, fmt.Errorf("resolve dependencies of parent node: %s failed: %w", cNode.Parent.Key, err)
	}

	n := inner.End()

	for fromNodeKey := range endDeps.inputsFull {
		n.AddInput(string(fromNodeKey))
	}

	for fromNodeKey, fieldMappings := range endDeps.inputs {
		n.AddInput(string(fromNodeKey), fieldMappings...)
	}

	for fromNodeKey := range endDeps.inputsNoDirectDependencyFull {
		n.AddInputWithOptions(string(fromNodeKey), nil, compose.WithNoDirectDependency())
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

	var opts []compose.GraphCompileOption
	if inner.requireCheckpoint {
		opts = append(opts, compose.WithCheckPointStore(workflow2.GetRepository()))
	}

	r, err := inner.Compile(ctx, opts...)
	if err != nil {
		return nil, err
	}

	return &innerWorkflowInfo{
		inner:      r,
		carryOvers: carryOvers,
	}, nil
}

type dependencyInfo struct {
	inputs                       map[vo.NodeKey][]*compose.FieldMapping
	inputsFull                   map[vo.NodeKey]struct{}
	dependencies                 []vo.NodeKey
	inputsNoDirectDependency     map[vo.NodeKey][]*compose.FieldMapping
	inputsNoDirectDependencyFull map[vo.NodeKey]struct{}
	staticValues                 []*staticValue
	variableInfos                []*variableInfo
	inputsForParent              map[vo.NodeKey][]*compose.FieldMapping
}

func (d *dependencyInfo) merge(mappings map[vo.NodeKey][]*compose.FieldMapping) error {
	for nKey, fms := range mappings {
		if _, ok := d.inputsFull[nKey]; ok {
			return fmt.Errorf("duplicate input for node: %s", nKey)
		}

		if _, ok := d.inputsNoDirectDependencyFull[nKey]; ok {
			return fmt.Errorf("duplicate input for node: %s", nKey)
		}

		if currentFMS, ok := d.inputs[nKey]; ok {
			for i := range fms {
				fm := fms[i]
				duplicate := false
				for _, currentFM := range currentFMS {
					if fm.Equals(currentFM) {
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
					if fm.Equals(currentFM) {
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

// arrayDrillDown happens when the 'mapping from path' is taking fields from elements within arrays.
// when this happens, we automatically takes the first element from any arrays along the 'from path'.
// For example, if the 'from path' is ['a', 'b', 'c'], and 'b' is an array, we will take value using a.b[0].c.
// As a counter example, if the 'from path' is ['a', 'b', 'c'], and 'b' is not an array, but 'c' is an array,
// we will not try to drill, instead, just take value using a.b.c.
func (d *dependencyInfo) arrayDrillDown(allNS map[vo.NodeKey]*schema.NodeSchema) error {
	for nKey, fms := range d.inputs {
		if nKey == compose.START { // reference to START node would NEVER need to do array drill down
			continue
		}

		var ot map[string]*vo.TypeInfo
		ots, ok := allNS[nKey]
		if !ok {
			return fmt.Errorf("node not found: %s", nKey)
		}
		ot = ots.OutputTypes
		for i := range fms {
			fm := fms[i]
			newFM, err := arrayDrillDown(nKey, fm, ot)
			if err != nil {
				return err
			}
			fms[i] = newFM
		}
	}

	for nKey, fms := range d.inputsNoDirectDependency {
		if nKey == compose.START {
			continue
		}

		var ot map[string]*vo.TypeInfo
		ots, ok := allNS[nKey]
		if !ok {
			return fmt.Errorf("node not found: %s", nKey)
		}
		ot = ots.OutputTypes
		for i := range fms {
			fm := fms[i]
			newFM, err := arrayDrillDown(nKey, fm, ot)
			if err != nil {
				return err
			}
			fms[i] = newFM
		}
	}

	return nil
}

func arrayDrillDown(nKey vo.NodeKey, fm *compose.FieldMapping, types map[string]*vo.TypeInfo) (*compose.FieldMapping, error) {
	fromPath := fm.FromPath()
	if len(fromPath) <= 1 { // no need to drill down
		return fm, nil
	}

	ct := types
	var arraySegIndexes []int
	for j := 0; j < len(fromPath)-1; j++ {
		p := fromPath[j]
		t, ok := ct[p]
		if !ok {
			return nil, fmt.Errorf("type info not found for path: %s", fm.FromPath()[:j+1])
		}

		if t.Type == vo.DataTypeArray {
			arraySegIndexes = append(arraySegIndexes, j)
			if t.ElemTypeInfo.Type == vo.DataTypeObject {
				ct = t.ElemTypeInfo.Properties
			} else if j != len(fromPath)-1 {
				return nil, fmt.Errorf("[arrayDrillDown] already found array of none obj, but still not last segment of path: %v",
					fromPath[:j+1])
			}
		} else if t.Type == vo.DataTypeObject {
			ct = t.Properties
		} else if j != len(fromPath)-1 {
			return nil, fmt.Errorf("[arrayDrillDown] found non-array, non-obj type: %v, but still not last segment of path: %v",
				t.Type, fromPath[:j+1])
		}
	}

	if len(arraySegIndexes) == 0 { // no arrays along from path
		return fm, nil
	}

	extractor := func(a any) (any, error) {
		for j := range fromPath {
			p := fromPath[j]
			m, ok := a.(map[string]any)
			if !ok {
				return nil, fmt.Errorf("[arrayDrillDown] trying to drill down from a non-map type:%T of path %s, "+
					"from node key: %v", a, fromPath[:j+1], nKey)
			}
			a, ok = m[p]
			if !ok {
				return nil, fmt.Errorf("[arrayDrillDown] field %s not found along from path: %s, "+
					"from node key: %v", p, fromPath[:j+1], nKey)
			}
			if slices.Contains(arraySegIndexes, j) { // this is an array needs drilling down
				arr, ok := a.([]any)
				if !ok {
					return nil, fmt.Errorf("[arrayDrillDown] trying to drill down from a non-array type:%T of path %s, "+
						"from node key: %v", a, fromPath[:j+1], nKey)
				}

				if len(arr) == 0 {
					return nil, fmt.Errorf("[arrayDrillDown] trying to drill down from an array of length 0: %s, "+
						"from node key: %v", fromPath[:j+1], nKey)
				}

				a = arr[0]
			}
		}

		return a, nil
	}

	newFM := compose.ToFieldPath(fm.ToPath(), compose.WithCustomExtractor(extractor))
	return newFM, nil
}

type staticValue struct {
	val  any
	path compose.FieldPath
}

type variableInfo struct {
	varType  vo.GlobalVarType
	fromPath compose.FieldPath
	toPath   compose.FieldPath
}

func (w *Workflow) resolveDependencies(n vo.NodeKey, sourceWithPaths []*vo.FieldInfo) (*dependencyInfo, error) {
	var (
		inputs                       = make(map[vo.NodeKey][]*compose.FieldMapping)
		inputFull                    map[vo.NodeKey]struct{}
		dependencies                 []vo.NodeKey
		inputsNoDirectDependency     = make(map[vo.NodeKey][]*compose.FieldMapping)
		inputsNoDirectDependencyFull map[vo.NodeKey]struct{}
		staticValues                 []*staticValue
		variableInfos                []*variableInfo

		// inputsForParent contains all the field mappings from any nodes of the parent workflow
		inputsForParent = make(map[vo.NodeKey][]*compose.FieldMapping)
	)

	connMap := make(map[vo.NodeKey]schema.Connection)
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

			if fromNode == n {
				return nil, fmt.Errorf("node %s cannot refer to itself, fromPath: %v, toPath: %v", n,
					swp.Source.Ref.FromPath, swp.Path)
			}

			if swp.Source.Ref.VariableType != nil {
				// skip all variables, they are handled in state pre handler
				variableInfos = append(variableInfos, &variableInfo{
					varType:  *swp.Source.Ref.VariableType,
					fromPath: swp.Source.Ref.FromPath,
					toPath:   swp.Path,
				})
				continue
			}

			if ok := schema.IsInSameWorkflow(w.hierarchy, n, fromNode); ok {
				if _, ok := connMap[fromNode]; ok { // direct dependency
					if len(swp.Source.Ref.FromPath) == 0 && len(swp.Path) == 0 {
						if inputFull == nil {
							inputFull = make(map[vo.NodeKey]struct{})
						}
						inputFull[fromNode] = struct{}{}
					} else {
						inputs[fromNode] = append(inputs[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, swp.Path))
					}
				} else { // indirect dependency
					if len(swp.Source.Ref.FromPath) == 0 && len(swp.Path) == 0 {
						if inputsNoDirectDependencyFull == nil {
							inputsNoDirectDependencyFull = make(map[vo.NodeKey]struct{})
						}
						inputsNoDirectDependencyFull[fromNode] = struct{}{}
					} else {
						inputsNoDirectDependency[fromNode] = append(inputsNoDirectDependency[fromNode],
							compose.MapFieldPaths(swp.Source.Ref.FromPath, swp.Path))
					}
				}
			} else if ok := schema.IsBelowOneLevel(w.hierarchy, n, fromNode); ok {
				firstNodesInInnerWorkflow := true
				for _, conn := range connMap {
					if schema.IsInSameWorkflow(w.hierarchy, n, conn.FromNode) {
						// there is another node 'conn.FromNode' that connects to this node, while also at the same level
						firstNodesInInnerWorkflow = false
						break
					}
				}

				if firstNodesInInnerWorkflow { // one of the first nodes in sub workflow
					inputs[compose.START] = append(inputs[compose.START],
						compose.MapFieldPaths(
							// the START node of inner workflow will proxy for the fields required from parent workflow
							// the field path within START node is prepended by the parent node key
							joinFieldPath(append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...)),
							swp.Path))
				} else { // not one of the first nodes in sub workflow, either succeeds other nodes or succeeds branches
					inputsNoDirectDependency[compose.START] = append(inputsNoDirectDependency[compose.START],
						compose.MapFieldPaths(
							// same as above, the START node of inner workflow proxies for the fields from parent workflow
							joinFieldPath(append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...)),
							swp.Path))
				}

				fieldMapping := compose.MapFieldPaths(swp.Source.Ref.FromPath,
					// our parent node will proxy for these field mappings, prepending the 'fromNode' to paths
					joinFieldPath(append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...)))
				added := false
				for _, existedFieldMapping := range inputsForParent[fromNode] {
					if existedFieldMapping.Equals(fieldMapping) {
						added = true
						break
					}
				}
				if !added {
					inputsForParent[fromNode] = append(inputsForParent[fromNode], fieldMapping)
				}

			}
		} else {
			return nil, fmt.Errorf("inputField's Val and Ref are both nil. path= %v", swp.Path)
		}
	}

	for fromNodeKey, conn := range connMap {
		if conn.FromPort != nil {
			continue
		}

		if schema.IsBelowOneLevel(w.hierarchy, n, fromNodeKey) {
			fromNodeKey = compose.START
		} else if !schema.IsInSameWorkflow(w.hierarchy, n, fromNodeKey) {
			continue
		}

		if _, ok := inputs[fromNodeKey]; !ok {
			if _, ok := inputsNoDirectDependency[fromNodeKey]; !ok {
				var hasFullInput, hasFullDataInput bool
				if inputFull != nil {
					if _, ok = inputFull[fromNodeKey]; ok {
						hasFullInput = true
					}
				}
				if inputsNoDirectDependencyFull != nil {
					if _, ok = inputsNoDirectDependencyFull[fromNodeKey]; ok {
						hasFullDataInput = true
					}
				}
				if !hasFullInput && !hasFullDataInput {
					dependencies = append(dependencies, fromNodeKey)
				}
			}
		}
	}

	return &dependencyInfo{
		inputs:                       inputs,
		inputsFull:                   inputFull,
		dependencies:                 dependencies,
		inputsNoDirectDependency:     inputsNoDirectDependency,
		inputsNoDirectDependencyFull: inputsNoDirectDependencyFull,
		staticValues:                 staticValues,
		variableInfos:                variableInfos,
		inputsForParent:              inputsForParent,
	}, nil
}

const fieldPathSplitter = "#"

func joinFieldPath(f compose.FieldPath) compose.FieldPath {
	return []string{strings.Join(f, fieldPathSplitter)}
}

func (w *Workflow) resolveDependenciesAsParent(n vo.NodeKey, sourceWithPaths []*vo.FieldInfo) (*dependencyInfo, error) {
	var (
		// inputsFull and inputsNoDirectDependencyFull are NEVER used in this case,
		// because a composite node MUST use explicit field mappings from inner nodes as its output.
		inputs                   = make(map[vo.NodeKey][]*compose.FieldMapping)
		dependencies             []vo.NodeKey
		inputsNoDirectDependency = make(map[vo.NodeKey][]*compose.FieldMapping)
		// although staticValues are not used for current composite nodes,
		// they may be used in the future, so we calculate them none the less.
		staticValues []*staticValue
		// variableInfos are normally handled in state pre handler, but in the case of composite node's output,
		// we need to handle them within composite node's state post handler,
		variableInfos []*variableInfo
	)

	connMap := make(map[vo.NodeKey]schema.Connection)
	for _, conn := range w.connections {
		if conn.ToNode != n {
			continue
		}

		if schema.IsInSameWorkflow(w.hierarchy, conn.FromNode, n) {
			continue
		}

		connMap[conn.FromNode] = *conn
	}

	for _, swp := range sourceWithPaths {
		if swp.Source.Ref == nil {
			staticValues = append(staticValues, &staticValue{
				val:  swp.Source.Val,
				path: swp.Path,
			})
		} else if swp.Source.Ref != nil {
			if swp.Source.Ref.VariableType != nil {
				variableInfos = append(variableInfos, &variableInfo{
					varType:  *swp.Source.Ref.VariableType,
					fromPath: swp.Source.Ref.FromPath,
					toPath:   swp.Path,
				})
				continue
			}

			fromNode := swp.Source.Ref.FromNodeKey
			if fromNode == n {
				return nil, fmt.Errorf("node %s cannot refer to itself, fromPath= %v, toPath= %v", n,
					swp.Source.Ref.FromPath, swp.Path)
			}

			if ok := schema.IsParentOf(w.hierarchy, n, fromNode); ok {
				if _, ok := connMap[fromNode]; ok { // direct dependency
					inputs[fromNode] = append(inputs[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...)))
				} else { // indirect dependency
					inputsNoDirectDependency[fromNode] = append(inputsNoDirectDependency[fromNode], compose.MapFieldPaths(swp.Source.Ref.FromPath, append(compose.FieldPath{string(fromNode)}, swp.Source.Ref.FromPath...)))
				}
			}
		} else {
			return nil, fmt.Errorf("composite node's output field's Val and Ref are both nil. path= %v", swp.Path)
		}
	}

	for fromNodeKey, conn := range connMap {
		if conn.FromPort != nil {
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
		variableInfos:            variableInfos,
	}, nil
}

// addFieldMappingsWithDeduplication adds field mappings to carryOvers while avoiding duplicates
func addFieldMappingsWithDeduplication(
	carryOvers map[vo.NodeKey][]*compose.FieldMapping,
	fromNodeKey vo.NodeKey,
	fieldMappings []*compose.FieldMapping,
) {
	if _, ok := carryOvers[fromNodeKey]; !ok {
		carryOvers[fromNodeKey] = make([]*compose.FieldMapping, 0)
	}

	for i := range fieldMappings {
		fm := fieldMappings[i]
		duplicate := false
		for _, existing := range carryOvers[fromNodeKey] {
			if fm.Equals(existing) {
				duplicate = true
				break
			}
		}

		if !duplicate {
			carryOvers[fromNodeKey] = append(carryOvers[fromNodeKey], fm)
		}
	}
}
