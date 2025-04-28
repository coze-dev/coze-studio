package jsonbuilder

import (
	"bytes"
	"encoding"
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/stream"
)

// Dict is a builder for building JSON dictionary.
type Dict struct {
	elems [][2][]byte
	size  int
}

func NewDict() *Dict {
	return &Dict{}
}

// See also: [encoding/json.(*reflectWithString).resolve]
func (d *Dict) marshalKey(key any) (string, error) {
	if tm, ok := key.(encoding.TextMarshaler); ok {
		bs, err := tm.MarshalText()
		if err != nil {
			return "", err
		}
		return string(bs), nil
	}

	rk := reflect.ValueOf(key)
	switch rk.Kind() {
	case reflect.String:
		return rk.String(), nil
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return strconv.FormatInt(rk.Int(), 10), nil
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		return strconv.FormatUint(rk.Uint(), 10), nil
	default:
		return "", fmt.Errorf("unexpected map key type: %T", key)
	}
}

func (d *Dict) Store(key, value any) error {
	kstr, err := d.marshalKey(key)
	if err != nil {
		return err
	}
	ks, err := json.Marshal(kstr) // json key is always quoted
	if err != nil {
		return err
	}
	vs, err := json.Marshal(value)
	if err != nil {
		return err
	}

	d.elems = append(d.elems, [2][]byte{ks, vs})
	d.size += len(ks) + len(vs)

	return nil
}

func (a *Dict) Sort() {
	a.elems = stream.
		StealSlice(a.elems).
		SortBy(func(a, b [2][]byte) bool { return bytes.Compare(a[0], b[0]) == -1 }).
		ToSlice()
}

func (d *Dict) Build() ([]byte, error) {
	if d == nil {
		return []byte("null"), nil
	}

	var buf bytes.Buffer

	size := d.size
	size += len(d.elems)     // count of colon ":"
	size += len(d.elems) - 1 // count of comma ","
	size += 2                //  "{" and "}"
	buf.Grow(size)

	buf.WriteByte('{')

	for _, kv := range d.elems {
		buf.Write(kv[0])
		buf.WriteByte(':')
		buf.Write(kv[1])
		buf.WriteByte(',')
	}

	var out []byte
	if len(d.elems) == 0 {
		buf.WriteByte('}')
		out = buf.Bytes()
	} else {
		extraComma := buf.Len() - 1
		out = buf.Bytes()
		// Replace extra `,` to  `}`.
		out[extraComma] = '}'
	}

	return out, nil
}
