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
	"strconv"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type Selector struct {
	clauses []*OneClauseSchema
	ns      *schema.NodeSchema
	ws      *schema.WorkflowSchema
}

type Config struct {
	Clauses []*OneClauseSchema `json:"clauses"`
}

func (c *Config) Build(_ context.Context, ns *schema.NodeSchema, opts ...schema.BuildOption) (any, error) {
	ws := schema.GetBuildOptions(opts...).WS
	if ws == nil {
		return nil, fmt.Errorf("workflow schema is required")
	}

	if len(c.Clauses) == 0 {
		return nil, fmt.Errorf("config clauses are empty")
	}

	for _, clause := range c.Clauses {
		if clause.Single == nil && clause.Multi == nil {
			return nil, fmt.Errorf("single clause and multi clause are both nil")
		}

		if clause.Single != nil && clause.Multi != nil {
			return nil, fmt.Errorf("multi clause and single clause are both non-nil")
		}

		if clause.Multi != nil {
			if len(clause.Multi.Clauses) == 0 {
				return nil, fmt.Errorf("multi clause's single clauses are empty")
			}

			if clause.Multi.Relation != ClauseRelationAND && clause.Multi.Relation != ClauseRelationOR {
				return nil, fmt.Errorf("multi clause and clauses are both non-AND-OR: %v", clause.Multi.Relation)
			}
		}
	}

	return &Selector{
		clauses: c.Clauses,
		ns:      ns,
		ws:      ws,
	}, nil
}

func (c *Config) BuildBranch(_ context.Context) (
	func(ctx context.Context, nodeOutput map[string]any) (int64, bool, error), bool) {
	return func(ctx context.Context, nodeOutput map[string]any) (int64, bool, error) {
		choice := nodeOutput[SelectKey].(int64)
		if choice < 0 || choice > int64(len(c.Clauses)+1) {
			return -1, false, fmt.Errorf("selector choice out of range: %d", choice)
		}

		if choice == int64(len(c.Clauses)) { // default
			return -1, true, nil
		}

		return choice, false, nil
	}, true
}

func (c *Config) ExpectPorts(_ context.Context, n *vo.Node) []string {
	expects := make([]string, len(n.Data.Inputs.Branches)+1)
	expects[0] = "false" // default branch
	if len(n.Data.Inputs.Branches) > 0 {
		expects[1] = "true" // first condition
	}

	for i := 1; i < len(n.Data.Inputs.Branches); i++ { // other conditions
		expects[i+1] = "true_" + strconv.Itoa(i)
	}

	return expects
}

type Operants struct {
	Left  any
	Right any
	Multi []*Operants
}

const (
	LeftKey   = "left"
	RightKey  = "right"
	SelectKey = "selected"
)

func (s *Selector) Invoke(_ context.Context, input map[string]any) (out map[string]any, err error) {
	in, err := s.selectorInputConverter(input)
	if err != nil {
		return nil, err
	}

	predicates := make([]Predicate, 0, len(s.clauses))
	for i, oneConf := range s.clauses {
		if oneConf.Single != nil {
			left := in[i].Left
			right := in[i].Right
			if right != nil {
				predicates = append(predicates, &Clause{
					LeftOperant:  left,
					Op:           *oneConf.Single,
					RightOperant: right,
				})
			} else {
				predicates = append(predicates, &Clause{
					LeftOperant: left,
					Op:          *oneConf.Single,
				})
			}
		} else if oneConf.Multi != nil {
			multiClause := &MultiClause{
				Relation: oneConf.Multi.Relation,
			}
			for j, singleConf := range oneConf.Multi.Clauses {
				left := in[i].Multi[j].Left
				right := in[i].Multi[j].Right
				if right != nil {
					multiClause.Clauses = append(multiClause.Clauses, &Clause{
						LeftOperant:  left,
						Op:           *singleConf,
						RightOperant: right,
					})
				} else {
					multiClause.Clauses = append(multiClause.Clauses, &Clause{
						LeftOperant: left,
						Op:          *singleConf,
					})
				}
			}
			predicates = append(predicates, multiClause)
		} else {
			return nil, fmt.Errorf("invalid clause config, both single and multi are nil: %v", oneConf)
		}
	}

	for i, p := range predicates {
		isTrue, err := p.Resolve()
		if err != nil {
			return nil, err
		}

		if isTrue {
			return map[string]any{SelectKey: int64(i)}, nil
		}
	}

	return map[string]any{SelectKey: int64(len(in))}, nil // default choice
}

func (s *Selector) selectorInputConverter(in map[string]any) (out []Operants, err error) {
	conf := s.clauses

	for i, oneConf := range conf {
		if oneConf.Single != nil {
			left, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), LeftKey})
			if !ok {
				return nil, fmt.Errorf("failed to take left operant from input map: %v, clause index= %d", in, i)
			}

			right, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), RightKey})
			if ok {
				out = append(out, Operants{Left: left, Right: right})
			} else {
				out = append(out, Operants{Left: left})
			}
		} else if oneConf.Multi != nil {
			multiClause := make([]*Operants, 0)
			for j := range oneConf.Multi.Clauses {
				left, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), strconv.Itoa(j), LeftKey})
				if !ok {
					return nil, fmt.Errorf("failed to take left operant from input map: %v, clause index= %d, single clause index= %d", in, i, j)
				}
				right, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), strconv.Itoa(j), RightKey})
				if ok {
					multiClause = append(multiClause, &Operants{Left: left, Right: right})
				} else {
					multiClause = append(multiClause, &Operants{Left: left})
				}
			}
			out = append(out, Operants{Multi: multiClause})
		} else {
			return nil, fmt.Errorf("invalid clause config, both single and multi are nil: %v", oneConf)
		}
	}

	return out, nil
}

func (s *Selector) ToCallbackOutput(_ context.Context, output map[string]any) (*nodes.StructuredCallbackOutput, error) {
	count := int64(len(s.clauses))
	out := output[SelectKey].(int64)
	if out == count {
		cOutput := map[string]any{"result": "pass to else branch"}
		return &nodes.StructuredCallbackOutput{
			Output:    cOutput,
			RawOutput: cOutput,
		}, nil
	}

	if out >= 0 && out < count {
		cOutput := map[string]any{"result": fmt.Sprintf("pass to condition %d branch", out+1)}
		return &nodes.StructuredCallbackOutput{
			Output:    cOutput,
			RawOutput: cOutput,
		}, nil
	}

	return nil, fmt.Errorf("out of range: %d", out)
}
