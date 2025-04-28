package jsonbuilder

import (
	"bytes"
	"encoding/json"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/stream"
)

// Array is a builder for building JSON array.
type Array struct {
	elems [][]byte
	size  int
}

func NewArray() *Array {
	return &Array{}
}

func (a *Array) Append(v any) error {
	bs, err := json.Marshal(v)
	if err != nil {
		return err
	}
	a.elems = append(a.elems, bs)
	a.size += len(bs)
	return nil
}

func (a *Array) Sort() {
	a.elems = stream.
		StealSlice(a.elems).
		SortBy(func(a, b []byte) bool { return bytes.Compare(a, b) == -1 }).
		ToSlice()
}

func (a *Array) Build() ([]byte, error) {
	if a == nil {
		return []byte("null"), nil
	}

	var buf bytes.Buffer

	size := a.size
	size += len(a.elems) - 1 // count of comma ","
	size += 2                //  "[" and "]"
	buf.Grow(size)

	buf.WriteByte('[')
	for _, bs := range a.elems {
		buf.Write(bs)
		buf.WriteByte(',')
	}

	var out []byte
	if len(a.elems) == 0 {
		buf.WriteByte(']')
		out = buf.Bytes()
	} else {
		extraComma := buf.Len() - 1
		out = buf.Bytes()
		// Replace extra `,` to  `]`.
		out[extraComma] = ']'
	}

	return out, nil
}
