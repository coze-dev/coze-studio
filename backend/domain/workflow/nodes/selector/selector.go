package selector

import (
	"context"
	"fmt"
	"strconv"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type Selector struct {
	config *Config
}

func NewSelector(_ context.Context, config *Config) (*Selector, error) {
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

func (s *Selector) Select(_ context.Context, in map[string]any) (out int, err error) {
	predicates := make([]Predicate, 0, len(s.config.Clauses))
	for i, oneConf := range s.config.Clauses {
		if oneConf.Single != nil {
			left, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), "Left"})
			if !ok {
				return -1, fmt.Errorf("failed to take left operant from input map: %v, clause index= %d", in, i)
			}

			right, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), "Right"})
			if ok {
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
				left, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), strconv.Itoa(j), "Left"})
				if !ok {
					return -1, fmt.Errorf("failed to take left operant from input map: %v, clause index= %d, single clause index= %d", in, i, j)
				}
				right, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), strconv.Itoa(j), "Right"})
				if ok {
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
			return -1, fmt.Errorf("invalid clause config, both single and multi are nil: %v", oneConf)
		}
	}

	for i, p := range predicates {
		isTrue, err := p.Resolve()
		if err != nil {
			return -1, err
		}

		if isTrue {
			return i, nil
		}
	}

	return len(in), nil // default choice
}

func (s *Selector) GetType() string {
	return "Selector"
}

func (s *Selector) ConditionCount() int {
	return len(s.config.Clauses)
}
