package selector

import (
	"context"
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type Selector struct {
	config *Schema
}

func NewSelector(_ context.Context, config *Schema) (*Selector, error) {
	if config == nil {
		return nil, fmt.Errorf("config is nil")
	}

	if len(config.Clauses) == 0 {
		return nil, fmt.Errorf("config clauses are empty")
	}

	for _, clause := range config.Clauses {
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
		config: config,
	}, nil
}

const ChoiceKey = "choice"

func (s *Selector) Select(_ context.Context, in map[string]any) (out map[string]any, err error) {
	// reorder clauses by index
	orderedClauses := make([]*OneClauseSchema, len(s.config.Clauses))
	for index := range s.config.Clauses {
		i, err := strconv.Atoi(index)
		if err != nil {
			return nil, fmt.Errorf("failed to parse index: %w", err)
		}

		orderedClauses[i] = s.config.Clauses[index]
	}

	// for each single clause, extract actual value from input
	for i := range orderedClauses {
		if orderedClauses[i].Single != nil {
			if isTrue, err := orderedClauses[i].Single.Resolve(in, "Clauses", strconv.Itoa(i), "Single"); err != nil {
				return nil, err
			} else if isTrue {
				return map[string]any{ChoiceKey: i}, nil
			}
		} else if orderedClauses[i].Multi != nil {
			relation := orderedClauses[i].Multi.Relation
			orderedSingleClauses := make([]*SingleClauseSchema, len(orderedClauses[i].Multi.Clauses))
			for index := range orderedClauses[i].Multi.Clauses {
				j, err := strconv.Atoi(index)
				if err != nil {
					return nil, fmt.Errorf("failed to parse index: %w", err)
				}

				orderedSingleClauses[j] = orderedClauses[i].Multi.Clauses[index]
			}

			if relation == ClauseRelationAND {
				allTrue := true
				for j, singleClause := range orderedSingleClauses {
					isTrue, err := singleClause.Resolve(in, "Clauses", strconv.Itoa(i), "Multi", "Clauses", strconv.Itoa(j))
					if err != nil {
						return nil, err
					}

					if !isTrue {
						allTrue = false
						break
					}
				}

				if allTrue {
					return map[string]any{ChoiceKey: i}, nil
				}
			} else if relation == ClauseRelationOR {
				anyTrue := false
				for j, singleClause := range orderedSingleClauses {
					isTrue, err := singleClause.Resolve(in, strconv.Itoa(i), strconv.Itoa(j))
					if err != nil {
						return nil, err
					}

					if isTrue {
						anyTrue = true
						break
					}
				}

				if anyTrue {
					return map[string]any{ChoiceKey: i}, nil
				}
			}
		}
	}

	return map[string]any{ChoiceKey: len(orderedClauses)}, nil // no clauses resolve to true, return default choice
}

func (si *SingleClauseSchema) Resolve(in map[string]any, prefixes ...string) (bool, error) {
	left, ok := nodes.TakeMapValue(in, append(prefixes, "Left"))
	if !ok {
		return false, fmt.Errorf("failed to take left operant for path: %v", prefixes)
	}

	if si.Right != nil {
		right, ok := nodes.TakeMapValue(in, append(prefixes, "Right"))
		if !ok {
			return false, fmt.Errorf("failed to take right operant for path: %v", prefixes)
		}

		c := Clause{
			LeftOperant:  left,
			Op:           si.Op,
			RightOperant: right,
		}

		return c.Resolve()
	}

	c := &Clause{
		LeftOperant: left,
		Op:          si.Op,
	}

	return c.Resolve()
}

func (s *Selector) Info() (*nodes.NodeInfo, error) {
	return &nodes.NodeInfo{
		Lambda: &nodes.Lambda{
			Invoke: s.Select,
		},
	}, nil
}

func (s *Selector) GetType() string {
	return "Selector"
}

func (s *Selector) ConditionCount() int {
	return len(s.config.Clauses)
}
