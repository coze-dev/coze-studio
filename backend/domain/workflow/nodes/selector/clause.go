package selector

import (
	"fmt"
	"reflect"
	"strings"
)

type Predicate interface {
	Resolve() (bool, error)
}

type Clause struct {
	LeftOperant  any
	Op           Operator
	RightOperant any
}

type MultiClause struct {
	Clauses  []*Clause
	Relation ClauseRelation
}

func (c *Clause) Resolve() (bool, error) {
	leftV := c.LeftOperant
	rightV := c.RightOperant

	leftT := reflect.TypeOf(leftV)
	rightT := reflect.TypeOf(rightV)

	if err := c.Op.WillAccept(leftT, rightT); err != nil {
		return false, err
	}

	switch c.Op {
	case OperatorEqual:
		return leftV == rightV, nil
	case OperatorNotEqual:
		return leftV != rightV, nil
	case OperatorEmpty:
		if leftV == nil {
			return true, nil
		}

		if leftT.Kind() == reflect.Map || leftT.Kind() == reflect.Slice {
			return reflect.ValueOf(leftV).Len() == 0, nil
		}

		return reflect.ValueOf(leftV).IsZero(), nil
	case OperatorNotEmpty:
		if leftV == nil {
			return false, nil
		}

		if leftT.Kind() == reflect.Map || leftT.Kind() == reflect.Slice {
			return reflect.ValueOf(leftV).Len() > 0, nil
		}

		return !reflect.ValueOf(leftV).IsZero(), nil
	case OperatorGreater:
		if leftInt, ok := leftV.(int); ok {
			return leftInt > rightV.(int), nil
		}
		return leftV.(float64) > rightV.(float64), nil
	case OperatorGreaterOrEqual:
		if leftInt, ok := leftV.(int); ok {
			return leftInt >= rightV.(int), nil
		}
		return leftV.(float64) >= rightV.(float64), nil
	case OperatorLesser:
		if leftInt, ok := leftV.(int); ok {
			return leftInt < rightV.(int), nil
		}
		return leftV.(float64) < rightV.(float64), nil
	case OperatorLesserOrEqual:
		if leftInt, ok := leftV.(int); ok {
			return leftInt <= rightV.(int), nil
		}
		return leftV.(float64) <= rightV.(float64), nil
	case OperatorIsTrue:
		return leftV.(bool), nil
	case OperatorIsFalse:
		return !leftV.(bool), nil
	case OperatorLengthGreater:
		return reflect.ValueOf(leftV).Len() > rightV.(int), nil
	case OperatorLengthGreaterOrEqual:
		return reflect.ValueOf(leftV).Len() >= rightV.(int), nil
	case OperatorLengthLesser:
		return reflect.ValueOf(leftV).Len() < rightV.(int), nil
	case OperatorLengthLesserOrEqual:
		return reflect.ValueOf(leftV).Len() <= rightV.(int), nil
	case OperatorContain:
		if leftT.Kind() == reflect.String {
			return strings.Contains(fmt.Sprintf("%v", leftV), rightV.(string)), nil
		}

		leftValue := reflect.ValueOf(leftV)
		for i := 0; i < leftValue.Len(); i++ {
			elem := leftValue.Index(i).Interface()
			if elem == rightV {
				return true, nil
			}
		}

		return false, nil
	case OperatorNotContain:
		if leftT.Kind() == reflect.String {
			return !strings.Contains(fmt.Sprintf("%v", leftV), rightV.(string)), nil
		}

		leftValue := reflect.ValueOf(leftV)
		for i := 0; i < leftValue.Len(); i++ {
			elem := leftValue.Index(i).Interface()
			if elem == rightV {
				return false, nil
			}
		}

		return true, nil
	case OperatorContainKey:
		if leftT.Kind() == reflect.Map {
			leftValue := reflect.ValueOf(leftV)
			for _, key := range leftValue.MapKeys() {
				if key.Interface() == rightV {
					return true, nil
				}
			}
		} else {
			for i := 0; i < leftT.NumField(); i++ {
				field := leftT.Field(i)
				if field.IsExported() {
					tag := field.Tag.Get("json")
					if tag == rightV {
						return true, nil
					}
				}
			}
		}

		return false, nil
	case OperatorNotContainKey:
		if leftT.Kind() == reflect.Map {
			leftValue := reflect.ValueOf(leftV)
			for _, key := range leftValue.MapKeys() {
				if key.Interface() == rightV {
					return false, nil
				}
			}
		} else {
			for i := 0; i < leftT.NumField(); i++ {
				field := leftT.Field(i)
				if field.IsExported() {
					tag := field.Tag.Get("json")
					if tag == rightV {
						return false, nil
					}
				}
			}
		}

		return true, nil
	default:
		return false, fmt.Errorf("unknown operator: %v", c.Op)
	}
}

func (mc *MultiClause) Resolve() (bool, error) {
	if mc.Relation == ClauseRelationAND {
		for _, clause := range mc.Clauses {
			isTrue, err := clause.Resolve()
			if err != nil {
				return false, err
			}
			if !isTrue {
				return false, nil
			}
		}
		return true, nil
	} else if mc.Relation == ClauseRelationOR {
		for _, clause := range mc.Clauses {
			isTrue, err := clause.Resolve()
			if err != nil {
				return false, err
			}
			if isTrue {
				return true, nil
			}
		}
		return false, nil
	} else {
		return false, fmt.Errorf("unknown relation: %v", mc.Relation)
	}
}
