package selector

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/cloudwego/eino/compose"
)

type Clause struct {
	LeftOperant  Operant
	Op           Operator
	RightOperant *Operant
	RightValue   any
	Choices      []string
}

type Operant struct {
	FromNodeKey string
	Path        compose.FieldPath
}

func (c *Clause) Resolve(in map[string]any) (bool, error) {
	leftV, err := getValueForPath(in, c.LeftOperant)
	if err != nil {
		return false, fmt.Errorf("left path not exist: %s, %w", c.LeftOperant.Path, err)
	}

	var rightV any
	if c.RightOperant != nil {
		rightV, err = getValueForPath(in, *c.RightOperant)
		if err != nil {
			return false, fmt.Errorf("right path not exist: %s, %w", c.RightOperant.Path, err)
		}
	} else {
		rightV = c.RightValue
	}

	leftT := reflect.TypeOf(leftV)
	rightT := reflect.TypeOf(rightV)

	if err = c.Op.WillAccept(leftT, rightT); err != nil {
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

		return false, nil
	case OperatorNotEmpty:
		if leftV == nil {
			return false, nil
		}

		if leftT.Kind() == reflect.Map || leftT.Kind() == reflect.Slice {
			return reflect.ValueOf(leftV).Len() > 0, nil
		}

		return true, nil
	case OperatorGreater:
		if leftInt, ok := leftV.(int64); ok {
			return leftInt > rightV.(int64), nil
		}
		return leftV.(float64) > rightV.(float64), nil
	case OperatorGreaterOrEqual:
		if leftInt, ok := leftV.(int64); ok {
			return leftInt >= rightV.(int64), nil
		}
		return leftV.(float64) >= rightV.(float64), nil
	case OperatorLesser:
		if leftInt, ok := leftV.(int64); ok {
			return leftInt < rightV.(int64), nil
		}
		return leftV.(float64) < rightV.(float64), nil
	case OperatorLesserOrEqual:
		if leftInt, ok := leftV.(int64); ok {
			return leftInt <= rightV.(int64), nil
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

func joinFieldPath(path compose.FieldPath) string {
	return strings.Join(path, "\x01")
}

func getValueForPath(in map[string]any, operant Operant) (any, error) {
	path := append([]string{operant.FromNodeKey}, operant.Path...)
	joinedPath := joinFieldPath(path)

	return in[joinedPath], nil
}

func (op *Operant) GetFieldMapping() (fromNodeKey string, fieldMapping *compose.FieldMapping) {
	return op.FromNodeKey, compose.MapFieldPaths(op.Path, compose.FieldPath{joinFieldPath(append([]string{op.FromNodeKey}, op.Path...))})
}
