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

package adaptor

import (
	"context"
	"fmt"

	einoCompose "github.com/cloudwego/eino/compose"
	"golang.org/x/exp/maps"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/compose"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

func WorkflowSchemaFromNode(ctx context.Context, c *vo.Canvas, nodeID string) (
	*schema.WorkflowSchema, error) {
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
	if n == nil {
		return nil, fmt.Errorf("node %s not found", nodeID)
	}

	batchN, enabled, err := parseBatchMode(n)
	if err != nil {
		return nil, err
	}

	if enabled {
		n = batchN
	}

	nsList, hierarchy, err := NodeToNodeSchema(ctx, n, c)
	if err != nil {
		return nil, err
	}

	var (
		ns          *schema.NodeSchema
		innerNodes  map[vo.NodeKey]*schema.NodeSchema // inner nodes of the composite node if nodeKey is composite
		connections []*schema.Connection
	)

	if len(nsList) == 1 {
		ns = nsList[0]
	} else {
		innerNodes = make(map[vo.NodeKey]*schema.NodeSchema)
		for i := range nsList {
			one := nsList[i]
			if _, ok := hierarchy[one.Key]; ok {
				innerNodes[one.Key] = one
				if one.Type == entity.NodeTypeContinue || one.Type == entity.NodeTypeBreak {
					connections = append(connections, &schema.Connection{
						FromNode: one.Key,
						ToNode:   vo.NodeKey(nodeID),
					})
				}
			} else {
				ns = one
			}
		}
	}

	if ns == nil {
		panic("impossible")
	}

	const inputFillerKey = "input_filler"
	connections = append(connections, &schema.Connection{
		FromNode: einoCompose.START,
		ToNode:   inputFillerKey,
	}, &schema.Connection{
		FromNode: inputFillerKey,
		ToNode:   ns.Key,
	}, &schema.Connection{
		FromNode: ns.Key,
		ToNode:   einoCompose.END,
	})
	if len(n.Edges) > 0 { // only need to keep the connections for inner nodes of composite node
		for i := range n.Edges {
			conn := EdgeToConnection(n.Edges[i])
			connections = append(connections, conn)
		}

		allN := make(map[string]*vo.Node)
		allN[string(ns.Key)] = n
		for i := range n.Blocks {
			inner := n.Blocks[i]
			allN[inner.ID] = inner
		}
		connections, err = normalizePorts(connections, allN)
		if err != nil {
			return nil, err
		}
	}

	startOutputTypes := maps.Clone(ns.InputTypes)

	// For chosen node, change input sources to be from einoCompose.START,
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
					FromNodeKey: inputFillerKey,
					FromPath:    input.Path,
				}},
			})
		}
	}
	ns.InputSources = newInputSources

	// for inner node, change input sources to be from einoCompose.START,
	// unless it's static value, from variables, from parent, or from other inner nodes
	// Also change the FromPath to be the same as Path.
	for key := range innerNodes {
		inner := innerNodes[key]
		innerInputSources := make([]*vo.FieldInfo, 0, len(inner.InputSources))
		for i := range inner.InputSources {
			input := inner.InputSources[i]
			if input.Source.Ref != nil && input.Source.Ref.VariableType != nil {
				// from variables
				innerInputSources = append(innerInputSources, input)
			} else if input.Source.Ref == nil {
				// static values
				innerInputSources = append(innerInputSources, input)
			} else if input.Source.Ref.FromNodeKey == ns.Key {
				// from parent
				innerInputSources = append(innerInputSources, input)
			} else if _, ok := innerNodes[input.Source.Ref.FromNodeKey]; ok {
				// from other inner nodes
				innerInputSources = append(innerInputSources, input)
			} else {
				innerInputSources = append(innerInputSources, &vo.FieldInfo{
					Path: input.Path,
					Source: vo.FieldSource{Ref: &vo.Reference{
						FromNodeKey: inputFillerKey,
						FromPath:    input.Path,
					}},
				})
				startOutputTypes[input.Path[0]] = inner.InputTypes[input.Path[0]]
			}
		}
		inner.InputSources = innerInputSources
	}

	i := func(ctx context.Context, output map[string]any) (map[string]any, error) {
		newOutput := make(map[string]any)
		for k := range output {
			newOutput[k] = output[k]
		}

		for k, tInfo := range startOutputTypes {
			if err := compose.FillIfNotRequired(tInfo, newOutput, k, compose.FillNil, false); err != nil {
				return nil, err
			}
		}

		return newOutput, nil
	}

	inputFiller := &schema.NodeSchema{
		Key:    inputFillerKey,
		Type:   entity.NodeTypeLambda,
		Lambda: einoCompose.InvokableLambda(i),
		InputSources: []*vo.FieldInfo{
			{
				Path: einoCompose.FieldPath{},
				Source: vo.FieldSource{
					Ref: &vo.Reference{
						FromNodeKey: einoCompose.START,
						FromPath:    einoCompose.FieldPath{},
					},
				},
			},
		},
		OutputTypes: startOutputTypes,
	}

	branches, err := schema.BuildBranches(connections)
	if err != nil {
		return nil, err
	}

	trimmedSC := &schema.WorkflowSchema{
		Nodes:       append([]*schema.NodeSchema{ns, inputFiller}, maps.Values(innerNodes)...),
		Connections: connections,
		Hierarchy:   hierarchy,
		Branches:    branches,
	}

	if enabled {
		trimmedSC.GeneratedNodes = append(trimmedSC.GeneratedNodes, ns.Key)
	}
	trimmedSC.Init()

	return trimmedSC, nil
}
