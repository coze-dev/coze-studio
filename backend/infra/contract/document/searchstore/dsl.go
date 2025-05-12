package searchstore

import "fmt"

type DSL struct {
	Op    Op
	Field string
	Value interface{} // builtin types / []*DSL
}

type Op string

const (
	OpEq   Op = "eq"
	OpNe   Op = "ne"
	OpLike Op = "like"
	OpIn   Op = "in"

	OpAnd Op = "and"
	OpOr  Op = "or"
)

func (d *DSL) DSL() map[string]any {
	return map[string]any{"dsl": d}
}

func LoadDSL(src map[string]any) (*DSL, error) {
	if src == nil {
		return nil, nil
	}

	dsl, ok := src["dsl"].(*DSL)
	if !ok {
		return nil, fmt.Errorf("load dsl failed")
	}

	return dsl, nil
}
