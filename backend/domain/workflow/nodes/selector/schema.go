package selector

import (
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type Schema struct {
	Clauses map[string]*OneClauseSchema `json:"clauses"`
}

type OneClauseSchema struct {
	Single *SingleClauseSchema `json:"single,omitempty"`
	Multi  *MultiClauseSchema  `json:"multi,omitempty"`
}

type SingleClauseSchema struct {
	Left  nodes.FieldInfo  `json:"left"`
	Op    Operator         `json:"op"`
	Right *nodes.FieldInfo `json:"right,omitempty"`
}

type ClauseRelation string

const (
	ClauseRelationAND ClauseRelation = "and"
	ClauseRelationOR  ClauseRelation = "or"
)

type MultiClauseSchema struct {
	Clauses  map[string]*SingleClauseSchema `json:"clauses"`
	Relation ClauseRelation                 `json:"relation"`
}
