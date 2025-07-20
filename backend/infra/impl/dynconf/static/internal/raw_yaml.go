/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
