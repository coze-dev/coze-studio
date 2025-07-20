package modelmgr

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"gopkg.in/yaml.v3"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func initModelByEnv(wd, templatePath string) (metaSlice []*modelmgr.ModelMeta, entitySlice []*modelmgr.Model, err error) {
	metaRoot := filepath.Join(wd, templatePath, "meta")
	entityRoot := filepath.Join(wd, templatePath, "entity")

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
			return nil, nil, fmt.Errorf("[initModelByEnv] unsupport protocol: %s", rawProtocol)
		}

		switch protocol {
		case chatmodel.ProtocolArk:
			fileSuffix, foundTemplate := mapping[info.modelName]
			if !foundTemplate {
				logs.Warnf("[initModelByEnv] unsupport model=%s, using default config", info.modelName)
			}
			modelMeta, err := readYaml[modelmgr.ModelMeta](filepath.Join(metaRoot, concatTemplateFileName("model_meta_template_ark", fileSuffix)))
			if err != nil {
				return nil, nil, err
			}
			modelEntity, err := readYaml[modelmgr.Model](filepath.Join(entityRoot, concatTemplateFileName("model_entity_template_ark", fileSuffix)))
			if err != nil {
				return nil, nil, err
			}
			id, err := strconv.ParseInt(info.id, 10, 64)
			if err != nil {
				return nil, nil, err
			}

			// meta 和 entity 用一个 id，有概率冲突
			modelMeta.ID = id
			modelMeta.ConnConfig.Model = info.modelID
			modelMeta.ConnConfig.APIKey = info.apiKey
			if info.baseURL != "" {
				modelMeta.ConnConfig.BaseURL = info.baseURL
			}
			modelEntity.ID = id
			modelEntity.Meta.ID = id
			if !foundTemplate {
				modelEntity.Name = info.modelName
			}

			metaSlice = append(metaSlice, modelMeta)
			entitySlice = append(entitySlice, modelEntity)

		default:
			return nil, nil, fmt.Errorf("[initModelByEnv] unsupport protocol: %s", rawProtocol)
		}
	}

	return metaSlice, entitySlice, nil
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
