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

package appinfra

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"gopkg.in/yaml.v3"

	"github.com/coze-dev/coze-studio/backend/infra/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/modelmgr/impl/static"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// TODO(fanlv) : 模型管理移到 Infra

func initModelMgr() (modelmgr.Manager, error) {
	wd, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	staticModel, err := initModelByTemplate(wd, "resources/conf/model")
	if err != nil {
		return nil, err
	}

	envModel, err := initModelByEnv(wd, "resources/conf/model/template")
	if err != nil {
		return nil, err
	}

	all := append(staticModel, envModel...)
	if err := fillModelContent(all); err != nil {
		return nil, err
	}

	mgr, err := static.NewModelMgr(all)
	if err != nil {
		return nil, err
	}

	return mgr, nil
}

func initModelByTemplate(wd, configPath string) ([]*modelmgr.Model, error) {
	configRoot := filepath.Join(wd, configPath)
	staticModel, err := readDirYaml[modelmgr.Model](configRoot)
	if err != nil {
		return nil, err
	}

	return staticModel, nil
}

func initModelByEnv(wd, templatePath string) (modelEntities []*modelmgr.Model, err error) {
	entityRoot := filepath.Join(wd, templatePath)

	for i := -1; i < 1000; i++ {
		rawProtocol := os.Getenv(concatEnvKey(modelProtocolPrefix, i))
		if rawProtocol == "" {
			if i < 0 {
				continue
			} else {
				break
			}
		}

		protocol := chatmodel.Protocol(rawProtocol)
		info, valid := getModelEnv(i)
		if !valid {
			break
		}

		mapping, found := modelMapping[protocol]
		if !found {
			return nil, fmt.Errorf("[initModelByEnv] unsupport protocol: %s", rawProtocol)
		}

		switch protocol {
		case chatmodel.ProtocolArk:
			fileSuffix, foundTemplate := mapping[info.modelName]
			if !foundTemplate {
				logs.Warnf("[initModelByEnv] unsupport model=%s, using default config", info.modelName)
			}
			modelEntity, err := readYaml[modelmgr.Model](filepath.Join(entityRoot, concatTemplateFileName("model_template_ark", fileSuffix)))
			if err != nil {
				return nil, err
			}
			id, err := strconv.ParseInt(info.id, 10, 64)
			if err != nil {
				return nil, err
			}

			modelEntity.ID = id
			if !foundTemplate {
				modelEntity.Name = info.modelName
			}
			modelEntity.Meta.ConnConfig.Model = info.modelID
			modelEntity.Meta.ConnConfig.APIKey = info.apiKey
			modelEntity.Meta.ConnConfig.BaseURL = info.baseURL

			modelEntities = append(modelEntities, modelEntity)

		default:
			return nil, fmt.Errorf("[initModelByEnv] unsupport protocol: %s", rawProtocol)
		}
	}

	return modelEntities, nil
}

type envModelInfo struct {
	id, modelName, modelID, apiKey, baseURL string
}

func getModelEnv(idx int) (info envModelInfo, valid bool) {
	info.id = os.Getenv(concatEnvKey(modelOpenCozeIDPrefix, idx))
	info.modelName = os.Getenv(concatEnvKey(modelNamePrefix, idx))
	info.modelID = os.Getenv(concatEnvKey(modelIDPrefix, idx))
	info.apiKey = os.Getenv(concatEnvKey(modelApiKeyPrefix, idx))
	info.baseURL = os.Getenv(concatEnvKey(modelBaseURLPrefix, idx))
	valid = info.modelName != "" && info.modelID != "" && info.apiKey != ""
	return
}

func readDirYaml[T any](dir string) ([]*T, error) {
	des, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	resp := make([]*T, 0, len(des))
	for _, file := range des {
		if file.IsDir() {
			continue
		}
		if strings.HasSuffix(file.Name(), ".yaml") || strings.HasSuffix(file.Name(), ".yml") {
			filePath := filepath.Join(dir, file.Name())
			data, err := os.ReadFile(filePath)
			if err != nil {
				return nil, err
			}
			var content T
			if err := yaml.Unmarshal(data, &content); err != nil {
				return nil, err
			}
			resp = append(resp, &content)
		}
	}
	return resp, nil
}

func readYaml[T any](fPath string) (*T, error) {
	data, err := os.ReadFile(fPath)
	if err != nil {
		return nil, err
	}
	var content T
	if err := yaml.Unmarshal(data, &content); err != nil {
		return nil, err
	}
	return &content, nil
}

func concatEnvKey(prefix string, idx int) string {
	if idx < 0 {
		return prefix
	}
	return fmt.Sprintf("%s_%d", prefix, idx)
}

func concatTemplateFileName(prefix, suffix string) string {
	if suffix == "" {
		return prefix + ".yaml"
	}
	return prefix + "_" + suffix + ".yaml"
}

const (
	modelProtocolPrefix   = "MODEL_PROTOCOL"    // model protocol
	modelOpenCozeIDPrefix = "MODEL_OPENCOZE_ID" // opencoze model id
	modelNamePrefix       = "MODEL_NAME"        // model name,
	modelIDPrefix         = "MODEL_ID"          // model in conn config
	modelApiKeyPrefix     = "MODEL_API_KEY"     // model api key
	modelBaseURLPrefix    = "MODEL_BASE_URL"    // model base url
)

var modelMapping = map[chatmodel.Protocol]map[string]string{
	chatmodel.ProtocolArk: {
		"doubao-seed-1.6":                "doubao-seed-1.6",
		"doubao-seed-1.6-flash":          "doubao-seed-1.6-flash",
		"doubao-seed-1.6-thinking":       "doubao-seed-1.6-thinking",
		"doubao-1.5-thinking-vision-pro": "doubao-1.5-thinking-vision-pro",
		"doubao-1.5-thinking-pro":        "doubao-1.5-thinking-pro",
		"doubao-1.5-vision-pro":          "doubao-1.5-vision-pro",
		"doubao-1.5-vision-lite":         "doubao-1.5-vision-lite",
		"doubao-1.5-pro-32k":             "doubao-1.5-pro-32k",
		"doubao-1.5-pro-256k":            "doubao-1.5-pro-256k",
		"doubao-1.5-lite":                "doubao-1.5-lite",
		"deepseek-r1":                    "volc_deepseek-r1",
		"deepseek-v3":                    "volc_deepseek-v3",
	},
}

func fillModelContent(items []*modelmgr.Model) error {
	for i := range items {
		item := items[i]
		if item.Meta.Status == modelmgr.StatusDefault {
			item.Meta.Status = modelmgr.StatusInUse
		}

		if item.IconURI == "" && item.IconURL == "" {
			return fmt.Errorf("missing icon URI or icon URL, id=%d", item.ID)
		}
	}

	return nil
}
