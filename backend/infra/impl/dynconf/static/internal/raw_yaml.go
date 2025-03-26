package internal

import (
	"fmt"
	"io/ioutil"
)

// RawYaml raw yaml object
type RawYaml struct {
	yamlBytes []byte
}

// NewRawYaml creates a object.
func NewRawYaml(path string) (*RawYaml, error) {
	if path == "" {
		return nil, fmt.Errorf("[NewRawYaml] path is nil")
	}

	yamlBytes, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	y := &RawYaml{yamlBytes: yamlBytes}

	return y, err
}

func (y *RawYaml) GetBytes() []byte {
	return y.yamlBytes
}
