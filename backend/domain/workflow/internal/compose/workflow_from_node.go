package compose

import (
	"context"

	"github.com/cloudwego/eino/compose"
	"golang.org/x/exp/maps"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose/checkpoint"
)

func NewWorkflowFromNode(ctx context.Context, sc *WorkflowSchema, nodeKey vo.NodeKey, opts ...compose.GraphCompileOption) (
	*Workflow, *WorkflowSchema, error) {
	sc.Init()

	var (
		ns          = sc.GetNode(nodeKey)
		innerNodes  map[vo.NodeKey]*NodeSchema // inner nodes of the composite node if nodeKey is composite
		hierarchy   map[vo.NodeKey]vo.NodeKey
		connections []*Connection
	)

	switch ns.Type {
	case entity.NodeTypeBatch, entity.NodeTypeLoop:
		for child, parent := range sc.Hierarchy {
			if parent == nodeKey {
				if innerNodes == nil {
					innerNodes = make(map[vo.NodeKey]*NodeSchema)
				}
				innerNodes[child] = sc.GetNode(child)
				if hierarchy == nil {
					hierarchy = make(map[vo.NodeKey]vo.NodeKey)
				}
				hierarchy[child] = parent
			}
		}
	default:
	}

	connections = append(connections, &Connection{
		FromNode: compose.START,
		ToNode:   ns.Key,
	}, &Connection{
		FromNode: ns.Key,
		ToNode:   compose.END,
	})
	if len(innerNodes) > 0 { // only need to keep the connections for inner nodes of composite node
		for i := range sc.Connections {
			conn := sc.Connections[i]
			if _, ok := innerNodes[conn.FromNode]; ok {
				connections = append(connections, conn)
			} else if _, ok := innerNodes[conn.ToNode]; ok {
				connections = append(connections, conn)
			}
		}
	}

	// For chosen node, change input sources to be from compose.START,
	// unless it's static value or from variables.
	// Also change the FromPath to be the same as Path.
	newInputSources := make([]*vo.FieldInfo, 0, len(ns.InputSources))
	for i := range ns.InputSources {
		input := ns.InputSources[i]
		if input.Source.Ref != nil && input.Source.Ref.VariableType != nil {
			// from variables
			newInputSources = append(newInputSources, input)
		} else if input.Source.Ref == nil {
			// static values
			newInputSources = append(newInputSources, input)
		} else {
			newInputSources = append(newInputSources, &vo.FieldInfo{
				Path: input.Path,
				Source: vo.FieldSource{Ref: &vo.Reference{
					FromNodeKey: compose.START,
					FromPath:    input.Path,
				}},
			})
		}
	}
	ns.InputSources = newInputSources

	// for inner node, change input sources to be from compose.START,
	// unless it's static value, from variables, from parent, or from other inner nodes
	// Also change the FromPath to be the same as Path.
	for key := range innerNodes {
		inner := innerNodes[key]
		newInputSources := make([]*vo.FieldInfo, 0, len(inner.InputSources))
		for i := range inner.InputSources {
			input := inner.InputSources[i]
			if input.Source.Ref != nil && input.Source.Ref.VariableType != nil {
				// from variables
				newInputSources = append(newInputSources, input)
			} else if input.Source.Ref == nil {
				// static values
				newInputSources = append(newInputSources, input)
			} else if input.Source.Ref.FromNodeKey == nodeKey {
				// from parent
				newInputSources = append(newInputSources, input)
			} else if _, ok := innerNodes[input.Source.Ref.FromNodeKey]; ok {
				// from other inner nodes
				newInputSources = append(newInputSources, input)
			} else {
				newInputSources = append(newInputSources, &vo.FieldInfo{
					Path: input.Path,
					Source: vo.FieldSource{Ref: &vo.Reference{
						FromNodeKey: compose.START,
						FromPath:    input.Path,
					}},
				})
			}
		}
		inner.InputSources = newInputSources
	}

	trimmedSC := &WorkflowSchema{
		Nodes:       append([]*NodeSchema{ns}, maps.Values(innerNodes)...),
		Connections: connections,
		Hierarchy:   hierarchy,
	}

	for _, key := range sc.GeneratedNodes {
		if _, ok := innerNodes[key]; ok {
			trimmedSC.GeneratedNodes = append(trimmedSC.GeneratedNodes, key)
		}
	}

	trimmedSC.Init()

	wf := &Workflow{
		workflow:          compose.NewWorkflow[map[string]any, map[string]any](compose.WithGenLocalState(GenState())),
		hierarchy:         trimmedSC.Hierarchy,
		connections:       trimmedSC.Connections,
		schema:            trimmedSC,
		fromNode:          true,
		streamRun:         false, // single node run can only invoke
		requireCheckpoint: trimmedSC.requireCheckPoint,
		input:             ns.InputTypes,
		output:            ns.OutputTypes,
		terminatePlan:     vo.ReturnVariables,
	}

	if len(innerNodes) > 0 {
		compositeNode := &CompositeNode{
			Parent:   ns,
			Children: maps.Values(innerNodes),
		}
		if err := wf.AddCompositeNode(ctx, compositeNode); err != nil {
			return nil, nil, err
		}
	} else if err := wf.AddNode(ctx, ns); err != nil {
		return nil, nil, err
	}

	wf.End().AddInput(string(nodeKey))

	var compileOpts []compose.GraphCompileOption
	compileOpts = append(compileOpts, opts...)
	if wf.requireCheckpoint {
		compileOpts = append(compileOpts, compose.WithCheckPointStore(checkpoint.GetStore()))
	}

	r, err := wf.Compile(ctx, compileOpts...)
	if err != nil {
		return nil, nil, err
	}
	wf.Runner = r

	return wf, trimmedSC, nil
}
