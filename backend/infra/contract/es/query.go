package es

const (
	QueryTypeEqual      = "equal"
	QueryTypeMatch      = "match"
	QueryTypeMultiMatch = "multi_match"
	QueryTypeNotExists  = "not_exists"
	QueryTypeContains   = "contains"
	QueryTypeIn         = "in"
)

type KV struct {
	Key   string
	Value any
}

type QueryType string

type Query struct {
	KV              KV
	Type            QueryType
	MultiMatchQuery MultiMatchQuery
	Bool            *BoolQuery
}

type BoolQuery struct {
	Filter             []Query
	Must               []Query
	MustNot            []Query
	Should             []Query
	MinimumShouldMatch *int
}

type MultiMatchQuery struct {
	Fields   []string
	Type     string // best_fields
	Query    string
	Operator string
}

const (
	Or  = "or"
	And = "and"
)

func NewEqualQuery(k string, v any) Query {
	return Query{
		KV:   KV{Key: k, Value: v},
		Type: QueryTypeEqual,
	}
}

func NewMatchQuery(k string, v any) Query {
	return Query{
		KV:   KV{Key: k, Value: v},
		Type: QueryTypeMatch,
	}
}

func NewMultiMatchQuery(fields []string, query, typeStr, operator string) Query {
	return Query{
		Type: QueryTypeMultiMatch,
		MultiMatchQuery: MultiMatchQuery{
			Fields:   fields,
			Query:    query,
			Operator: operator,
			Type:     typeStr,
		},
	}
}

func NewNotExistsQuery(k string) Query {
	return Query{
		KV:   KV{Key: k},
		Type: QueryTypeNotExists,
	}
}

func NewContainsQuery(k string, v any) Query {
	return Query{
		KV:   KV{Key: k, Value: v},
		Type: QueryTypeContains,
	}
}

func NewInQuery(k string, v any) Query {
	return Query{
		KV:   KV{Key: k, Value: v},
		Type: QueryTypeIn,
	}
}
