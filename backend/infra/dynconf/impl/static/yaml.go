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

package static

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v2"

	"github.com/coze-dev/coze-studio/backend/infra/dynconf/impl/static/internal"
)

var (
	ErrConfigNotExist = errors.New("config not exist")
)

type ConfYaml struct {
	*internal.RawYaml
	filepath string
}

func NewConfYaml(rootDir string, groups []string) (*ConfYaml, error) {
	yamlFilePath := getYamlPath(rootDir, groups)
	if yamlFilePath == "" {
		return nil, ErrConfigNotExist
	}

	yaml, err := internal.NewRawYaml(yamlFilePath)
	if err != nil {
		return nil, err
	}

	r := &ConfYaml{RawYaml: yaml, filepath: yamlFilePath}

	return r, err
}

func (c *ConfYaml) MarshalFunc() MarshalFunc {
	return yaml.Marshal
}

func (c *ConfYaml) UnmarshalFunc() UnmarshalFunc {
	return yaml.Unmarshal
}

func getYamlPath(rootDir string, groups []string) string {
	var findPaths []string

	for r := len(groups); r > 0; r-- {
		findPaths = append(findPaths,
			filepath.Join(rootDir, fmt.Sprintf("config.%s", strings.Join(groups[:r], "."))))
	}

	findPaths = append(findPaths, filepath.Join(rootDir, "config"))

	for _, path := range findPaths {
		if p, exist := existYamlFile(path); exist {
			return p
		}
	}

	return ""
}

func existYamlFile(yamlFileName string) (string, bool) {
	for _, ext := range []string{".yml", ".yaml"} {
		p := yamlFileName + ext
		existed, isDir := internal.FileExist(p)
		if existed && !isDir {
			return p, true
		}
	}

	return "", false
}
