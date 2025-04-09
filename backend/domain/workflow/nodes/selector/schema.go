package selector

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
