package static

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"

	"code.byted.org/flow/opencoze/backend/infra/config/static/internal"
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
