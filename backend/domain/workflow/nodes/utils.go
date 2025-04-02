package nodes

import (
	"fmt"
	"reflect"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
)

// GetInputFields extracts all InputField from any schema type T.
// It recursively iterates over all struct fields / map keys, finding all values of the type FieldInfo.
// It then returns all FieldInfo and their corresponding compose.FieldPath.
func GetInputFields[T any](schema T) ([]*InputField, error) {
	v := reflect.ValueOf(schema)
	for v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	var (
		inputFields []*InputField
		err         error
	)

	switch v.Kind() {
	case reflect.Map:
		inputFields, err = getInputFieldsFromMap(v)
	case reflect.Struct:
		inputFields, err = getInputFieldsFromStruct(v)
	default:
		return nil, fmt.Errorf("invalid config type: %v", v.Type())
	}

	if err != nil {
		return nil, err
	}

	return inputFields, nil
}

func getInputFieldsFromMap(v reflect.Value, prefixes ...string) (inputFields []*InputField, err error) {
	for _, key := range v.MapKeys() {
		val := v.MapIndex(key)
		for val.Kind() == reflect.Ptr {
			val = val.Elem()
		}

		switch val.Kind() {
		case reflect.Map:
			subVs, err := getInputFieldsFromMap(val, append(prefixes, key.Interface().(string))...)
			if err != nil {
				return nil, err
			}

			inputFields = append(inputFields, subVs...)
		case reflect.Struct:
			if val.Type() == reflect.TypeOf(FieldInfo{}) {
				field := val.Interface().(FieldInfo)
				newPrefix := make([]string, len(prefixes))
				copy(newPrefix, prefixes)
				inputFields = append(inputFields, &InputField{
					Info: field,
					Path: append(newPrefix, key.Interface().(string)),
				})
			} else {
				subVs, err := getInputFieldsFromStruct(val, append(prefixes, key.Interface().(string))...)
				if err != nil {
					return nil, err
				}

				inputFields = append(inputFields, subVs...)
			}
		default:
			// skip
		}
	}

	return inputFields, nil
}

func getInputFieldsFromStruct(v reflect.Value, prefixes ...string) (inputFields []*InputField, err error) {
	rType := v.Type()
	var fieldName string
	for i := 0; i < rType.NumField(); i++ {
		if !rType.Field(i).IsExported() {
			continue
		}

		fieldName = rType.Field(i).Name

		val := v.Field(i)
		for val.Kind() == reflect.Ptr {
			val = val.Elem()
		}

		switch val.Kind() {
		case reflect.Map:
			subVs, err := getInputFieldsFromMap(val, append(prefixes, fieldName)...)
			if err != nil {
				return nil, err
			}

			inputFields = append(inputFields, subVs...)
		case reflect.Struct:
			if val.Type() == reflect.TypeOf(FieldInfo{}) {
				field := val.Interface().(FieldInfo)
				newPrefix := make([]string, len(prefixes))
				copy(newPrefix, prefixes)
				inputFields = append(inputFields, &InputField{
					Info: field,
					Path: append(newPrefix, fieldName),
				})
			} else {
				subVs, err := getInputFieldsFromStruct(val, append(prefixes, fieldName)...)
				if err != nil {
					return nil, err
				}

				inputFields = append(inputFields, subVs...)
			}
		default:
			// skip
		}
	}

	return inputFields, err
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

// TakeMapValue extracts the value for specified path from input map.
// Returns false if map key not exist for specified path.
func TakeMapValue(m map[string]any, path compose.FieldPath) (any, bool) {
	if m == nil {
		return nil, false
	}

	container := m
	for _, p := range path[:len(path)-1] {
		if _, ok := container[p]; !ok {
			return nil, false
		}
		container = container[p].(map[string]any)
	}

	if v, ok := container[path[len(path)-1]]; ok {
		return v, true
	}

	return nil, false
}
