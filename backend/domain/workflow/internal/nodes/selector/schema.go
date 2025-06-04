package selector

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type ClauseRelation string

const (
	ClauseRelationAND ClauseRelation = "and"
	ClauseRelationOR  ClauseRelation = "or"
)

type Config struct {
	Clauses []*OneClauseSchema `json:"clauses"`
}

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
