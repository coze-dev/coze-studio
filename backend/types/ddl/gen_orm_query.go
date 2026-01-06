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

package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"reflect"
	"runtime"
	"strings"

	"gorm.io/driver/mysql"
	"gorm.io/gen"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/api/model/playground"
	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	plugin "github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	appEntity "github.com/coze-dev/coze-studio/backend/domain/app/entity"
	variableEntity "github.com/coze-dev/coze-studio/backend/domain/memory/variables/entity"
)

var path2Table2Columns2Model = map[string]map[string]map[string]any{
	"domain/datacopy/internal/dal/query": {
		"data_copy_task": {},
	},
	"domain/agent/singleagent/internal/dal/query": {
		"single_agent_draft": {
			// "variable":        []*bot_common.Variable{},
			"model_info":                 &bot_common.ModelInfo{},
			"onboarding_info":            &bot_common.OnboardingInfo{},
			"prompt":                     &bot_common.PromptInfo{},
			"plugin":                     []*bot_common.PluginInfo{},
			"knowledge":                  &bot_common.Knowledge{},
			"workflow":                   []*bot_common.WorkflowInfo{},
			"suggest_reply":              &bot_common.SuggestReplyInfo{},
			"jump_config":                &bot_common.JumpConfig{},
			"background_image_info_list": []*bot_common.BackgroundImageInfo{},
			"database_config":            []*bot_common.Database{},
			"shortcut_command":           []string{},
			"layout_info":                &bot_common.LayoutInfo{},
		},
		"single_agent_version": {
			// "variable":        []*bot_common.Variable{},
			"model_info":                 &bot_common.ModelInfo{},
			"onboarding_info":            &bot_common.OnboardingInfo{},
			"prompt":                     &bot_common.PromptInfo{},
			"plugin":                     []*bot_common.PluginInfo{},
			"knowledge":                  &bot_common.Knowledge{},
			"workflow":                   []*bot_common.WorkflowInfo{},
			"suggest_reply":              &bot_common.SuggestReplyInfo{},
			"jump_config":                &bot_common.JumpConfig{},
			"background_image_info_list": []*bot_common.BackgroundImageInfo{},
			"database_config":            []*bot_common.Database{},
			"shortcut_command":           []string{},
			"layout_info":                &bot_common.LayoutInfo{},
		},
		"single_agent_publish": {
			"connector_ids": []int64{},
		},
	},
	"domain/plugin/internal/dal/query": {
		"plugin": {
			"manifest":    &plugin.PluginManifest{},
			"openapi_doc": &plugin.Openapi3T{},
			"ext":         map[string]any{},
		},
		"plugin_draft": {
			"manifest":    &plugin.PluginManifest{},
			"openapi_doc": &plugin.Openapi3T{},
		},
		"plugin_version": {
			"manifest":    &plugin.PluginManifest{},
			"openapi_doc": &plugin.Openapi3T{},
			"ext":         map[string]any{},
		},
		"agent_tool_draft": {
			"operation": &plugin.Openapi3Operation{},
		},
		"agent_tool_version": {
			"operation": &plugin.Openapi3Operation{},
		},
		"tool": {
			"operation": &plugin.Openapi3Operation{},
			"ext":       map[string]any{},
		},
		"tool_draft": {
			"operation": &plugin.Openapi3Operation{},
		},
		"tool_version": {
			"operation": &plugin.Openapi3Operation{},
			"ext":       map[string]any{},
		},
		"plugin_oauth_auth": {
			"oauth_config": &plugin.OAuthAuthorizationCodeConfig{},
		},
	},
	"domain/conversation/agentrun/internal/dal/query": {
		"run_record": {
			"usage": &agentrun.Usage{},
		},
	},
	"domain/conversation/conversation/internal/dal/query": {
		"conversation": {},
	},
	"domain/conversation/message/internal/dal/query": {
		"message": {},
	},
	"domain/prompt/internal/dal/query": {
		"prompt_resource": {},
	},
	// "domain/knowledge/internal/query": {
	//	"knowledge":                {},
	//	"knowledge_document":       {},
	//	"knowledge_document_slice": {},
	// },
	"domain/memory/variables/internal/dal/query": {
		"variables_meta": {
			"variable_list": []*variableEntity.VariableMeta{},
		},
		"variable_instance": {},
	},
	// "domain/modelmgr/internal/dal/query": {
	// 	"model_meta": {
	// 		"capability":  &modelmgr.Capability{},
	// 		"conn_config": &chatmodel.Config{},
	// 		"status":      modelmgr.ModelStatus(0),
	// 	},
	// 	"model_entity": {
	// 		"scenario":       modelmgr.Scenario(0),
	// 		"default_params": []*modelmgr.Parameter{},
	// 		"status":         modelmgr.ModelStatus(0),
	// 	},
	// },
	"domain/workflow/internal/repo/dal/query": {
		"workflow_meta":              {},
		"workflow_draft":             {},
		"workflow_version":           {},
		"workflow_reference":         {},
		"workflow_execution":         {},
		"node_execution":             {},
		"workflow_snapshot":          {},
		"connector_workflow_version": {},

		"chat_flow_role_config": {},

		"app_conversation_template_draft":  {},
		"app_conversation_template_online": {},

		"app_static_conversation_draft":  {},
		"app_static_conversation_online": {},

		"app_dynamic_conversation_draft":  {},
		"app_dynamic_conversation_online": {},
	},

	"domain/openauth/openapiauth/internal/dal/query": {
		"api_key": {},
	},
	"domain/shortcutcmd/internal/dal/query": {
		"shortcut_command": {
			"tool_info":     &playground.ToolInfo{},
			"components":    []*playground.Components{},
			"shortcut_icon": &playground.ShortcutFileInfo{},
		},
	},

	"domain/memory/database/internal/dal/query": {
		"online_database_info": {
			"table_field": []*database.FieldItem{},
		},
		"draft_database_info": {
			"table_field": []*database.FieldItem{},
		},
		"agent_to_database": {},
	},
	"domain/user/internal/dal/query": {
		"user":       {},
		"space":      {},
		"space_user": {},
	},
	"domain/app/internal/dal/query": {
		"app_draft": {},
		"app_release_record": {
			"connector_ids": []int64{},
			"extra_info":    &appEntity.PublishRecordExtraInfo{},
		},
		"app_connector_release_ref": {
			"publish_config": appEntity.PublishConfig{},
		},
	},
	"domain/upload/internal/dal/query": {
		"files": {},
	},
	"bizpkg/config/modelmgr/internal/query": {
		"model_instance": {
			"provider":     &config.ModelProvider{},
			"display_info": &config.DisplayInfo{},
			"connection":   &config.Connection{},
			"capability":   &developer_api.ModelAbility{},
			"parameters":   []*developer_api.ModelParameter{},
		},
	},
}

var fieldNullablePath = map[string]bool{
	"domain/agent/singleagent/internal/dal/query": true,
}

func main() {
	dsn := os.Getenv("MYSQL_DSN")
	os.Setenv("LANG", "en_US.UTF-8")
	if dsn == "" {
		dsn = "root:root@tcp(localhost:3306)/opencoze?charset=utf8mb4&parseTime=True"
	}
	gormDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})
	if err != nil {
		log.Fatalf("gorm.Open failed, err=%v", err)
	}

	rootPath, err := findProjectRoot()
	if err != nil {
		log.Fatalf("failed to find project root: %v", err)
	}

	for path, mapping := range path2Table2Columns2Model {

		g := gen.NewGenerator(gen.Config{
			OutPath:       filepath.Join(rootPath, path),
			Mode:          gen.WithoutContext | gen.WithDefaultQuery | gen.WithQueryInterface,
			FieldNullable: fieldNullablePath[path],
		})

		parts := strings.Split(path, "/")
		modelPath := strings.Join(append(parts[:len(parts)-1], g.Config.ModelPkgPath), "/")

		g.UseDB(gormDB)
		g.WithOpts(gen.FieldType("deleted_at", "gorm.DeletedAt"))

		var resolveType func(typ reflect.Type, required bool) string
		resolveType = func(typ reflect.Type, required bool) string {
			switch typ.Kind() {
			case reflect.Ptr:
				return resolveType(typ.Elem(), false)
			case reflect.Slice:
				return "[]" + resolveType(typ.Elem(), required)
			default:
				prefix := "*"
				if required {
					prefix = ""
				}

				if strings.HasSuffix(typ.PkgPath(), modelPath) {
					return prefix + typ.Name()
				}

				return prefix + typ.String()
			}
		}

		genModify := func(col string, model any) func(f gen.Field) gen.Field {
			return func(f gen.Field) gen.Field {
				if f.ColumnName != col {
					return f
				}

				st := reflect.TypeOf(model)
				// f.Name = st.Name()
				f.Type = resolveType(st, true)
				f.GORMTag.Set("serializer", "json")
				return f
			}
		}

		timeModify := func(f gen.Field) gen.Field {
			if f.ColumnName == "updated_at" {
				// https://gorm.io/zh_CN/docs/models.html#%E5%88%9B%E5%BB%BA-x2F-%E6%9B%B4%E6%96%B0%E6%97%B6%E9%97%B4%E8%BF%BD%E8%B8%AA%EF%BC%88%E7%BA%B3%E7%A7%92%E3%80%81%E6%AF%AB%E7%A7%92%E3%80%81%E7%A7%92%E3%80%81Time%EF%BC%89
				f.GORMTag.Set("autoUpdateTime", "milli")
			}
			if f.ColumnName == "created_at" {
				f.GORMTag.Set("autoCreateTime", "milli")
			}
			return f
		}

		var models []any
		for table, col2Model := range mapping {
			opts := make([]gen.ModelOpt, 0, len(col2Model))
			for column, m := range col2Model {
				cp := m
				opts = append(opts, gen.FieldModify(genModify(column, cp)))
			}
			opts = append(opts, gen.FieldModify(timeModify))
			models = append(models, g.GenerateModel(table, opts...))
		}

		g.ApplyBasic(models...)

		g.Execute()
	}
}

func findProjectRoot() (string, error) {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		return "", fmt.Errorf("failed to get current file path")
	}

	backendDir := filepath.Dir(filepath.Dir(filepath.Dir(filename))) // notice: the relative path of the script file is assumed here

	if _, err := os.Stat(filepath.Join(backendDir, "domain")); os.IsNotExist(err) {
		return "", fmt.Errorf("could not find 'domain' directory in backend path: %s", backendDir)
	}

	return backendDir, nil
}
