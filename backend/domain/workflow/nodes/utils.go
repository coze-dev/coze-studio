package nodes

import (
	"fmt"
	"reflect"

	"github.com/bytedance/sonic"
)

func GetVariables[T any](schema T) ([]*InputField, error) {
	v := reflect.ValueOf(schema)
	for v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	var (
		variables []*InputField
		err       error
	)

	switch v.Kind() {
	case reflect.Map:
		variables, err = getVariablesFromMap(v)
	case reflect.Struct:
		variables, err = getVariablesFromStruct(v)
	default:
		return nil, fmt.Errorf("invalid config type: %v", v.Type())
	}

	if err != nil {
		return nil, err
	}

	return variables, nil
}

func getVariablesFromMap(v reflect.Value, prefixes ...string) (variables []*InputField, err error) {
	for _, key := range v.MapKeys() {
		val := v.MapIndex(key)
		for val.Kind() == reflect.Ptr {
			val = val.Elem()
		}

		switch val.Kind() {
		case reflect.Map:
			subVs, err := getVariablesFromMap(val, append(prefixes, key.Interface().(string))...)
			if err != nil {
				return nil, err
			}

			variables = append(variables, subVs...)
		case reflect.Struct:
			if val.Type() == reflect.TypeOf(FieldInfo{}) {
				field := val.Interface().(FieldInfo)
				variables = append(variables, &InputField{
					Info: field,
					Path: append(prefixes, key.Interface().(string)),
				})
			} else {
				subVs, err := getVariablesFromStruct(val, append(prefixes, key.Interface().(string))...)
				if err != nil {
					return nil, err
				}

				variables = append(variables, subVs...)
			}
		default:
			// skip
		}
	}

	return variables, nil
}

func getVariablesFromStruct(v reflect.Value, prefixes ...string) (variables []*InputField, err error) {
	rType := v.Type()
	for i := 0; i < rType.NumField(); i++ {
		structField := rType.Field(i)
		if !structField.IsExported() {
			continue
		}

		val := v.Field(i)
		for val.Kind() == reflect.Ptr {
			val = val.Elem()
		}

		switch val.Kind() {
		case reflect.Map:
			subVs, err := getVariablesFromMap(val, append(prefixes, structField.Name)...)
			if err != nil {
				return nil, err
			}

			variables = append(variables, subVs...)
		case reflect.Struct:
			if val.Type() == reflect.TypeOf(FieldInfo{}) {
				field := val.Interface().(FieldInfo)
				variables = append(variables, &InputField{
					Info: field,
					Path: append(prefixes, structField.Name),
				})
			} else {
				subVs, err := getVariablesFromStruct(val, append(prefixes, structField.Name)...)
				if err != nil {
					return nil, err
				}

				variables = append(variables, subVs...)
			}
		default:
			// skip
		}
	}

	return variables, err
}

func UnmarshalJSON[T any](bytes []byte) (T, error) {
	zero := newInstanceByType(reflect.TypeOf((*T)(nil)).Elem()).Interface().(T)
	err := sonic.Unmarshal(bytes, &zero)
	return zero, err
}

func newInstanceByType(typ reflect.Type) reflect.Value {
	switch typ.Kind() {
	case reflect.Map:
		return reflect.MakeMap(typ)
	case reflect.Slice, reflect.Array:
		slice := reflect.New(typ).Elem()
		slice.Set(reflect.MakeSlice(typ, 0, 0))
		return slice
	case reflect.Ptr:
		typ = typ.Elem()
		origin := reflect.New(typ)
		nested := newInstanceByType(typ)
		origin.Elem().Set(nested)

		return origin
	default:
		return reflect.New(typ).Elem()
	}
}
