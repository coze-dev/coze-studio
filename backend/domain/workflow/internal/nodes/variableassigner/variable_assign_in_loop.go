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

package variableassigner

import (
	"context"
	"fmt"

	einoCompose "github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type InLoopConfig struct {
	Pairs []*Pair
}

func (i *InLoopConfig) Adapt(ctx context.Context, n *vo.Node, opts ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	if n.Parent() == nil {
		return nil, fmt.Errorf("loop set variable node must have parent: %s", n.ID)
	}

	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeVariableAssignerWithinLoop,
		Name:    n.Data.Meta.Title,
		Configs: i,
	}

	var pairs []*Pair
	for i, param := range n.Data.Inputs.InputParameters {
		if param.Left == nil || param.Right == nil {
			return nil, fmt.Errorf("loop set variable node's param left or right is nil")
		}

		leftSources, err := convert.CanvasBlockInputToFieldInfo(param.Left, einoCompose.FieldPath{fmt.Sprintf("left_%d", i)}, n.Parent())
		if err != nil {
			return nil, err
		}

		if len(leftSources) != 1 {
			return nil, fmt.Errorf("loop set variable node's param left is not a single source")
		}

		if leftSources[0].Source.Ref == nil {
			return nil, fmt.Errorf("loop set variable node's param left's ref is nil")
		}

		if leftSources[0].Source.Ref.VariableType == nil || *leftSources[0].Source.Ref.VariableType != vo.ParentIntermediate {
			return nil, fmt.Errorf("loop set variable node's param left's ref's variable type is not variable.ParentIntermediate")
		}

		rightSources, err := convert.CanvasBlockInputToFieldInfo(param.Right, leftSources[0].Source.Ref.FromPath, n.Parent())
		if err != nil {
			return nil, err
		}

		ns.AddInputSource(rightSources...)

		if len(rightSources) != 1 {
			return nil, fmt.Errorf("loop set variable node's param right is not a single source")
		}

		pair := &Pair{
			Left:  *leftSources[0].Source.Ref,
			Right: rightSources[0].Path,
		}

		pairs = append(pairs, pair)
	}

	i.Pairs = pairs

	return ns, nil
}

func (i *InLoopConfig) Build(_ context.Context, _ *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	return &InLoop{
		pairs:                i.Pairs,
		intermediateVarStore: &nodes.ParentIntermediateStore{},
	}, nil
}

type InLoop struct {
	pairs                []*Pair
	intermediateVarStore variable.Store
}

func (v *InLoop) Invoke(ctx context.Context, in map[string]any) (out map[string]any, err error) {
	for _, pair := range v.pairs {
		if pair.Left.VariableType == nil || *pair.Left.VariableType != vo.ParentIntermediate {
			panic(fmt.Errorf("dest is %+v in VariableAssignerInloop, invalid", pair.Left))
		}

		right, ok := nodes.TakeMapValue(in, pair.Right)
		if !ok {
			return nil, fmt.Errorf("failed to extract right value for path %s", pair.Right)
		}

		err := v.intermediateVarStore.Set(ctx, pair.Left.FromPath, right)
		if err != nil {
			return nil, err
		}
	}

	return map[string]any{}, nil
}
