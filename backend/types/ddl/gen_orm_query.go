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

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
	modelEntity "code.byted.org/flow/opencoze/backend/api/model/crossdomain/modelmgr"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	appEntity "code.byted.org/flow/opencoze/backend/domain/app/entity"
	variableEntity "code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
)

var path2Table2Columns2Model = map[string]map[string]map[string]any{
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
			"database":                   []*bot_common.Database{},
			"shortcut_command":           []string{},
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
			"database":                   []*bot_common.Database{},
			"shortcut_command":           []string{},
		},
		"single_agent_publish": {
			"connector_ids": []int64{},
		},
	},
	"domain/plugin/internal/dal/query": {
		"plugin": {
			"manifest":    &plugin.PluginManifest{},
			"openapi_doc": &plugin.Openapi3T{},
		},
		"plugin_draft": {
			"manifest":    &plugin.PluginManifest{},
			"openapi_doc": &plugin.Openapi3T{},
		},
		"plugin_version": {
			"manifest":    &plugin.PluginManifest{},
			"openapi_doc": &plugin.Openapi3T{},
		},
		"agent_tool_draft": {
			"operation": &plugin.Openapi3Operation{},
		},
		"agent_tool_version": {
			"operation": &plugin.Openapi3Operation{},
		},
		"tool": {
			"operation": &plugin.Openapi3Operation{},
		},
		"tool_draft": {
			"operation": &plugin.Openapi3Operation{},
		},
		"tool_version": {
			"operation": &plugin.Openapi3Operation{},
		},
	},
	"domain/conversation/agentrun/internal/dal/query": {
		"run_record": {},
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
	"domain/modelmgr/internal/dal/query": {
		"model_meta": {
			"capability":  &modelEntity.Capability{},
			"conn_config": &chatmodel.Config{},
			"status":      modelEntity.ModelMetaStatus(0),
		},
		"model_entity": {
			//"scenario":       modelEntity.Scenario(0),
			"default_params": []*modelEntity.Parameter{},
			"status":         modelEntity.ModelEntityStatus(0),
		},
	},
	"domain/workflow/internal/repo/dal/query": {
		"workflow_meta":      {},
		"workflow_draft":     {},
		"workflow_version":   {},
		"workflow_reference": {},
		"workflow_execution": {},
		"node_execution":     {},
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
		"release_record": {
			"connector_ids": []int64{},
			"extra_info":    &appEntity.PublishRecordExtraInfo{},
		},
		"connector_release_ref": {
			"publish_config": appEntity.PublishConfig{},
		},
	},
}

var fieldNullablePath = map[string]bool{
	"domain/agent/singleagent/internal/dal/query": true,
}

func main() {
	dsn := os.Getenv("MYSQL_DSN")
	os.Setenv("LANG", "en_US.UTF-8")
	dsn = "root:root@tcp(localhost:3306)/opencoze?charset=utf8mb4&parseTime=True"
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
