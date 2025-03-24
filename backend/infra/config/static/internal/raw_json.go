package internal

import (
	"fmt"
	"io/ioutil"
)

// RawJsonData raw json object
type RawJson struct {
	jsonBytes []byte
}

func NewRawJson(path string) (*RawJson, error) {
	if path == "" {
		return nil, fmt.Errorf("[NewRawJson] path is nil")
	}

	jsonBytes, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	y := &RawJson{jsonBytes: jsonBytes}

	return y, err
}

func (r *RawJson) GetBytes() []byte {
	return r.jsonBytes
}
