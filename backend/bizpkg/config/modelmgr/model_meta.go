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

package modelmgr

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	config "github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ModelMetaConf struct {
	Provider2Models map[string]map[string]ModelMeta `thrift:"provider2models,2" form:"provider2models" json:"provider2models" query:"provider2models"`
}

type ModelMeta struct {
	DisplayInfo     *config.DisplayInfo             `json:"display_info,omitempty"`
	Capability      *developer_api.ModelAbility     `json:"capability,omitempty"`
	Connection      *config.Connection              `json:"connection,omitempty"`
	Parameters      []*developer_api.ModelParameter `json:"parameters,omitempty"`
	EnableBase64URL bool                            `json:"enable_base64_url,omitempty"`
}

var modelMetaConf *ModelMetaConf

func initModelMetaConf() (*ModelMetaConf, error) {
	wd, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	const modelMetaConfPath = "resources/conf/model/model_meta.json"
	configRoot := filepath.Join(wd, modelMetaConfPath)
	jsonData, err := os.ReadFile(configRoot)
	if err != nil {
		return nil, fmt.Errorf("error reading model_meta.json: %w", err)
	}

	err = json.Unmarshal(jsonData, &modelMetaConf)
	if err != nil {
		return nil, fmt.Errorf("error Unmarshal model_meta.json: %w", err)
	}

	return modelMetaConf, nil
}

func (c *ModelMetaConf) GetModelMeta(modelClass developer_api.ModelClass, modelName string) (*ModelMeta, error) {
	modelName2Meta, ok := c.Provider2Models[modelClass.String()]
	if !ok {
		return nil, fmt.Errorf("model meta not found for model class %v", modelClass)
	}

	modelMeta, ok := modelName2Meta[modelName]
	if ok {
		logs.Infof("get model meta for model class %v and model name %v", modelClass, modelName)
		return &modelMeta, nil
	}

	const defaultKey = "default"
	modelMeta, ok = modelName2Meta[defaultKey]
	if ok {
		logs.Infof("use default model meta for model class %v and model name %v", modelClass, modelName)
		return &modelMeta, nil
	}

	return nil, fmt.Errorf("model meta not found for model class %v and model name %v", modelClass, modelName)
}
