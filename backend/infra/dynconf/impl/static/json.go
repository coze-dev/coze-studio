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
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/coze-dev/coze-studio/backend/infra/dynconf/impl/static/internal"
)

type ConfJson struct {
	*internal.RawJson
}

func NewConfJson(rootDir string, groups []string) (*ConfJson, error) {
	jsonFilePath := getJsonPath(rootDir, groups)
	if jsonFilePath == "" {
		return nil, ErrConfigNotExist
	}

	json, err := internal.NewRawJson(jsonFilePath)
	if err != nil {
		return nil, err
	}

	r := &ConfJson{json}
	return r, err
}

func (c *ConfJson) MarshalFunc() MarshalFunc {
	return json.Marshal
}

func (c *ConfJson) UnmarshalFunc() UnmarshalFunc {
	return json.Unmarshal
}

func getJsonPath(rootDir string, groups []string) string {
	var findPaths []string

	for r := len(groups); r > 0; r-- {
		findPaths = append(findPaths,
			filepath.Join(rootDir, fmt.Sprintf("config.%s", strings.Join(groups[:r], "."))))
	}

	findPaths = append(findPaths, filepath.Join(rootDir, "config"))

	for _, path := range findPaths {
		if p, exist := existJsonFile(path); exist {
			return p
		}
	}

	return ""
}

func existJsonFile(fileName string) (string, bool) {
	p := fileName + ".json"
	existed, isDir := internal.FileExist(p)
	if existed && !isDir {
		return p, true
	}

	return "", false
}
