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

package workflow

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	bizConf "github.com/coze-dev/coze-studio/backend/bizpkg/config"
	bizmodelmgr "github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type workflowSchemaModelResolver struct {
	modelIDsByKey map[string][]int64
}

func newWorkflowSchemaModelResolver(models []*bizmodelmgr.Model) *workflowSchemaModelResolver {
	resolver := &workflowSchemaModelResolver{
		modelIDsByKey: make(map[string][]int64),
	}

	for _, model := range models {
		if model == nil || model.Model == nil {
			continue
		}

		if model.DisplayInfo != nil {
			resolver.addKey(model.ID, model.DisplayInfo.Name)
		}
		if model.Connection != nil && model.Connection.BaseConnInfo != nil {
			resolver.addKey(model.ID, model.Connection.BaseConnInfo.Model)
		}
	}

	return resolver
}

func (r *workflowSchemaModelResolver) addKey(modelID int64, name string) {
	key := normalizeWorkflowModelLookupKey(name)
	if key == "" {
		return
	}

	existing := r.modelIDsByKey[key]
	for _, id := range existing {
		if id == modelID {
			return
		}
	}
	r.modelIDsByKey[key] = append(existing, modelID)
}

func (r *workflowSchemaModelResolver) resolveModelType(modelName string) (int64, error) {
	key := normalizeWorkflowModelLookupKey(modelName)
	if key == "" {
		return 0, nil
	}

	modelIDs := r.modelIDsByKey[key]
	switch len(modelIDs) {
	case 0:
		return 0, fmt.Errorf("model %q not found; call GET /v1/models to inspect available model names", modelName)
	case 1:
		return modelIDs[0], nil
	default:
		return 0, fmt.Errorf("model %q is ambiguous and matches %d configured models", modelName, len(modelIDs))
	}
}

func normalizeWorkflowModelLookupKey(name string) string {
	return strings.ToLower(strings.TrimSpace(name))
}

func (w *ApplicationService) openAPINormalizeWorkflowSchemaModels(ctx context.Context, canvasSchema string) (string, error) {
	if strings.TrimSpace(canvasSchema) == "" {
		return canvasSchema, nil
	}

	modelConf := bizConf.ModelConf()
	if modelConf == nil {
		return "", fmt.Errorf("model config is not initialized")
	}

	models, err := modelConf.GetAllModelList(ctx)
	if err != nil {
		return "", fmt.Errorf("get model list failed: %w", err)
	}

	return normalizeWorkflowSchemaModelTypes(canvasSchema, newWorkflowSchemaModelResolver(models))
}

func normalizeWorkflowSchemaModelTypes(canvasSchema string, resolver *workflowSchemaModelResolver) (string, error) {
	if resolver == nil || strings.TrimSpace(canvasSchema) == "" {
		return canvasSchema, nil
	}

	canvas := make(map[string]any)
	if err := sonic.UnmarshalString(canvasSchema, &canvas); err != nil {
		return "", fmt.Errorf("unmarshal workflow schema failed: %w", err)
	}

	nodes, ok := canvas["nodes"].([]any)
	if !ok {
		return canvasSchema, nil
	}

	changed := false
	for _, node := range nodes {
		nodeMap, ok := node.(map[string]any)
		if !ok {
			continue
		}

		nodeChanged, err := normalizeWorkflowNodeModelTypes(nodeMap, resolver)
		if err != nil {
			nodeID, _ := nodeMap["id"].(string)
			if nodeID == "" {
				return "", err
			}
			return "", fmt.Errorf("node %s: %w", nodeID, err)
		}

		changed = changed || nodeChanged
	}

	if !changed {
		return canvasSchema, nil
	}

	normalizedSchema, err := sonic.MarshalString(canvas)
	if err != nil {
		return "", fmt.Errorf("marshal workflow schema failed: %w", err)
	}

	return normalizedSchema, nil
}

func normalizeWorkflowNodeModelTypes(node map[string]any, resolver *workflowSchemaModelResolver) (bool, error) {
	data, ok := node["data"].(map[string]any)
	if !ok {
		return false, nil
	}

	inputs, ok := data["inputs"].(map[string]any)
	if !ok {
		return false, nil
	}

	changed := false

	if llmParam, ok := inputs["llmParam"]; ok {
		switch typed := llmParam.(type) {
		case []any:
			normalizedParam, paramChanged, err := normalizeWorkflowLLMParamList(typed, resolver)
			if err != nil {
				return false, err
			}
			if paramChanged {
				inputs["llmParam"] = normalizedParam
				changed = true
			}
		case map[string]any:
			paramChanged, err := normalizeWorkflowLLMParamObject(typed, resolver)
			if err != nil {
				return false, err
			}
			changed = changed || paramChanged
		}
	}

	if settingOnError, ok := inputs["settingOnError"].(map[string]any); ok {
		backupChanged, err := normalizeWorkflowBackupLLMParam(settingOnError, resolver)
		if err != nil {
			return false, err
		}
		changed = changed || backupChanged
	}

	return changed, nil
}

func normalizeWorkflowLLMParamList(params []any, resolver *workflowSchemaModelResolver) ([]any, bool, error) {
	modelName := ""
	modelTypeParamIndex := -1

	for i, param := range params {
		paramMap, ok := param.(map[string]any)
		if !ok {
			continue
		}

		switch name, _ := paramMap["name"].(string); name {
		case "modleName", "modelName":
			modelName = getWorkflowLLMParamContent(paramMap)
		case "modelType":
			modelTypeParamIndex = i
		}
	}

	if normalizeWorkflowModelLookupKey(modelName) == "" {
		return params, false, nil
	}

	modelType, err := resolver.resolveModelType(modelName)
	if err != nil {
		return nil, false, err
	}

	if modelTypeParamIndex >= 0 {
		paramMap, _ := params[modelTypeParamIndex].(map[string]any)
		return params, ensureWorkflowLLMParamModelType(paramMap, modelType), nil
	}

	params = append(params, newWorkflowLLMParamModelType(modelType))
	return params, true, nil
}

func normalizeWorkflowLLMParamObject(param map[string]any, resolver *workflowSchemaModelResolver) (bool, error) {
	modelName, _ := param["modelName"].(string)
	if modelName == "" {
		modelName, _ = param["modleName"].(string)
	}

	if normalizeWorkflowModelLookupKey(modelName) == "" {
		return false, nil
	}

	modelType, err := resolver.resolveModelType(modelName)
	if err != nil {
		return false, err
	}

	if currentModelType, ok := getWorkflowInt64(param["modelType"]); ok && currentModelType == modelType {
		return false, nil
	}

	param["modelType"] = modelType
	return true, nil
}

func normalizeWorkflowBackupLLMParam(settingOnError map[string]any, resolver *workflowSchemaModelResolver) (bool, error) {
	ext, ok := settingOnError["ext"].(map[string]any)
	if !ok {
		return false, nil
	}

	backupLLMParamStr, _ := ext["backupLLMParam"].(string)
	if strings.TrimSpace(backupLLMParamStr) == "" {
		return false, nil
	}

	var backupLLMParam vo.SimpleLLMParam
	if err := sonic.UnmarshalString(backupLLMParamStr, &backupLLMParam); err != nil {
		return false, fmt.Errorf("unmarshal backupLLMParam failed: %w", err)
	}

	if normalizeWorkflowModelLookupKey(backupLLMParam.ModelName) == "" {
		return false, nil
	}

	modelType, err := resolver.resolveModelType(backupLLMParam.ModelName)
	if err != nil {
		return false, err
	}

	if backupLLMParam.ModelType == modelType {
		return false, nil
	}

	backupLLMParam.ModelType = modelType
	normalizedBackupLLMParam, err := sonic.MarshalString(backupLLMParam)
	if err != nil {
		return false, fmt.Errorf("marshal backupLLMParam failed: %w", err)
	}

	ext["backupLLMParam"] = normalizedBackupLLMParam
	return true, nil
}

func getWorkflowLLMParamContent(param map[string]any) string {
	input, ok := param["input"].(map[string]any)
	if !ok {
		return ""
	}

	value, ok := input["value"].(map[string]any)
	if !ok {
		return ""
	}

	content, _ := value["content"].(string)
	return content
}

func ensureWorkflowLLMParamModelType(param map[string]any, modelType int64) bool {
	changed := false

	input, ok := param["input"].(map[string]any)
	if !ok {
		input = make(map[string]any)
		param["input"] = input
		changed = true
	}

	if input["type"] != "integer" {
		input["type"] = "integer"
		changed = true
	}

	value, ok := input["value"].(map[string]any)
	if !ok {
		value = make(map[string]any)
		input["value"] = value
		changed = true
	}

	if value["type"] != "literal" {
		value["type"] = "literal"
		changed = true
	}

	modelTypeStr := strconv.FormatInt(modelType, 10)
	if currentModelType, _ := value["content"].(string); currentModelType != modelTypeStr {
		value["content"] = modelTypeStr
		changed = true
	}

	rawMeta, ok := value["rawMeta"].(map[string]any)
	if !ok {
		rawMeta = make(map[string]any)
		value["rawMeta"] = rawMeta
		changed = true
	}

	if rawMetaType, ok := getWorkflowInt64(rawMeta["type"]); !ok || rawMetaType != 2 {
		rawMeta["type"] = 2
		changed = true
	}

	return changed
}

func newWorkflowLLMParamModelType(modelType int64) map[string]any {
	param := map[string]any{
		"name": "modelType",
	}
	ensureWorkflowLLMParamModelType(param, modelType)
	return param
}

func getWorkflowInt64(value any) (int64, bool) {
	switch typed := value.(type) {
	case int:
		return int64(typed), true
	case int32:
		return int64(typed), true
	case int64:
		return typed, true
	case float64:
		return int64(typed), true
	case string:
		if typed == "" {
			return 0, false
		}
		parsed, err := strconv.ParseInt(typed, 10, 64)
		if err != nil {
			return 0, false
		}
		return parsed, true
	default:
		return 0, false
	}
}
