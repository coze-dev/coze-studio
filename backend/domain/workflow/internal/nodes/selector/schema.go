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

package selector

import (
	"context"
	"fmt"

	einoCompose "github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type ClauseRelation string

const (
	ClauseRelationAND ClauseRelation = "and"
	ClauseRelationOR  ClauseRelation = "or"
)

type OneClauseSchema struct {
	Single *Operator          `json:"single,omitempty"`
	Multi  *MultiClauseSchema `json:"multi,omitempty"`
}

type MultiClauseSchema struct {
	Clauses  []*Operator    `json:"clauses"`
	Relation ClauseRelation `json:"relation"`
}

func (c ClauseRelation) ToVOLogicType() vo.LogicType {
	if c == ClauseRelationAND {
		return vo.AND
	} else if c == ClauseRelationOR {
		return vo.OR
	}

	panic(fmt.Sprintf("unknown clause relation: %s", c))
}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	clauses := make([]*OneClauseSchema, 0)
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Name:    n.Data.Meta.Title,
		Type:    entity.NodeTypeSelector,
		Configs: c,
	}

	for i, branchCond := range n.Data.Inputs.Branches {
		inputType := &vo.TypeInfo{
			Type:       vo.DataTypeObject,
			Properties: map[string]*vo.TypeInfo{},
		}

		if len(branchCond.Condition.Conditions) == 1 { // single condition
			cond := branchCond.Condition.Conditions[0]

			left := cond.Left
			if left == nil {
				return nil, fmt.Errorf("operator left is nil")
			}

			leftType, err := convert.CanvasBlockInputToTypeInfo(left.Input)
			if err != nil {
				return nil, err
			}

			leftSources, err := convert.CanvasBlockInputToFieldInfo(left.Input, einoCompose.FieldPath{fmt.Sprintf("%d", i), LeftKey}, n.Parent())
			if err != nil {
				return nil, err
			}

			inputType.Properties[LeftKey] = leftType

			ns.AddInputSource(leftSources...)

			op, err := ToSelectorOperator(cond.Operator, leftType)
			if err != nil {
				return nil, err
			}

			if cond.Right != nil {
				rightType, err := convert.CanvasBlockInputToTypeInfo(cond.Right.Input)
				if err != nil {
					return nil, err
				}

				rightSources, err := convert.CanvasBlockInputToFieldInfo(cond.Right.Input, einoCompose.FieldPath{fmt.Sprintf("%d", i), RightKey}, n.Parent())
				if err != nil {
					return nil, err
				}

				inputType.Properties[RightKey] = rightType
				ns.AddInputSource(rightSources...)
			}

			ns.SetInputType(fmt.Sprintf("%d", i), inputType)

			clauses = append(clauses, &OneClauseSchema{
				Single: &op,
			})

			continue
		}

		var relation ClauseRelation
		logic := branchCond.Condition.Logic
		if logic == vo.OR {
			relation = ClauseRelationOR
		} else if logic == vo.AND {
			relation = ClauseRelationAND
		}

		var ops []*Operator
		for j, cond := range branchCond.Condition.Conditions {
			left := cond.Left
			if left == nil {
				return nil, fmt.Errorf("operator left is nil")
			}

			leftType, err := convert.CanvasBlockInputToTypeInfo(left.Input)
			if err != nil {
				return nil, err
			}

			leftSources, err := convert.CanvasBlockInputToFieldInfo(left.Input, einoCompose.FieldPath{fmt.Sprintf("%d", i), fmt.Sprintf("%d", j), LeftKey}, n.Parent())
			if err != nil {
				return nil, err
			}

			inputType.Properties[fmt.Sprintf("%d", j)] = &vo.TypeInfo{
				Type: vo.DataTypeObject,
				Properties: map[string]*vo.TypeInfo{
					LeftKey: leftType,
				},
			}

			ns.AddInputSource(leftSources...)

			op, err := ToSelectorOperator(cond.Operator, leftType)
			if err != nil {
				return nil, err
			}
			ops = append(ops, &op)

			if cond.Right != nil {
				rightType, err := convert.CanvasBlockInputToTypeInfo(cond.Right.Input)
				if err != nil {
					return nil, err
				}

				rightSources, err := convert.CanvasBlockInputToFieldInfo(cond.Right.Input, einoCompose.FieldPath{fmt.Sprintf("%d", i), fmt.Sprintf("%d", j), RightKey}, n.Parent())
				if err != nil {
					return nil, err
				}

				inputType.Properties[fmt.Sprintf("%d", j)].Properties[RightKey] = rightType
				ns.AddInputSource(rightSources...)
			}
		}

		ns.SetInputType(fmt.Sprintf("%d", i), inputType)

		clauses = append(clauses, &OneClauseSchema{
			Multi: &MultiClauseSchema{
				Clauses:  ops,
				Relation: relation,
			},
		})
	}

	c.Clauses = clauses

	return ns, nil
}
