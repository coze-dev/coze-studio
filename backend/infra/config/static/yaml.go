package static

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v2"

	"code.byted.org/flow/opencoze/backend/infra/config/static/internal"
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
