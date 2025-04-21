package main

import (
	"log"
	"os"
	"reflect"
	"strings"

	"gorm.io/driver/mysql"
	"gorm.io/gen"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"

	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/api/model/memory_common"
	"code.byted.org/flow/opencoze/backend/api/model/plugin_common"
)

var path2Table2Columns2Model = map[string]map[string]map[string]any{
	"domain/agent/singleagent/internal/dal/query": {
		"single_agent_draft": {
			"variable":        []*agent_common.Variable{},
			"model_info":      &agent_common.ModelInfo{},
			"onboarding_info": &agent_common.OnboardingInfo{},
			"prompt":          &agent_common.PromptInfo{},
			"plugin":          []*agent_common.PluginInfo{},
			"knowledge":       &agent_common.Knowledge{},
			"workflow":        []*agent_common.WorkflowInfo{},
			"suggest_reply":   &agent_common.SuggestReplyInfo{},
			"jump_config":     &agent_common.JumpConfig{},
		},
		"single_agent_version": {
			"variable":        []*agent_common.Variable{},
			"model_info":      &agent_common.ModelInfo{},
			"onboarding_info": &agent_common.OnboardingInfo{},
			"prompt":          &agent_common.PromptInfo{},
			"plugin":          []*agent_common.PluginInfo{},
			"knowledge":       &agent_common.Knowledge{},
			"workflow":        []*agent_common.WorkflowInfo{},
			"suggest_reply":   &agent_common.SuggestReplyInfo{},
			"jump_config":     &agent_common.JumpConfig{},
		},
	},
	"domain/plugin/internal/dal/query": {
		"plugin":         {},
		"plugin_draft":   {},
		"plugin_version": {},
		"agent_tool_draft": {
			"request_params":  []*plugin_common.APIParameter{},
			"response_params": []*plugin_common.APIParameter{},
		},
		"agent_tool_version": {
			"request_params":  []*plugin_common.APIParameter{},
			"response_params": []*plugin_common.APIParameter{},
		},
		"tool": {
			"request_params":  []*plugin_common.APIParameter{},
			"response_params": []*plugin_common.APIParameter{},
		},
		"tool_draft": {
			"request_params":  []*plugin_common.APIParameter{},
			"response_params": []*plugin_common.APIParameter{},
		},
		"tool_version": {
			"request_params":  []*plugin_common.APIParameter{},
			"response_params": []*plugin_common.APIParameter{},
		},
	},
	// "domain/conversation/chat/internal/query": {
	//	"chat": {},
	// },
	// "domain/conversation/conversation/internal/query": {
	//	"conversation": {},
	// },
	// "domain/conversation/message/internal/query": {
	//	"message": {},
	// },
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
			"variable_list": []*memory_common.Variable{},
		},
	},
	// "domain/model/dal/query": {
	//	"model_meta": {
	//		"capability":   &model.Capability{},
	//		"conn_config":  &model.ConnConfig{},
	//		"param_schema": &openapi3.Schema{},
	//		//"status":       model.Status(0),
	//	},
	//	"model_entity": {
	//		//"scenario": model.Scenario(0),
	//	},
	// },
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

	for path, mapping := range path2Table2Columns2Model {

		goPATH := os.Getenv("GOPATH")
		rootPath := goPATH + "/src/code.byted.org/flow/opencoze/backend/"

		g := gen.NewGenerator(gen.Config{
			OutPath: rootPath + path,
			Mode:    gen.WithoutContext | gen.WithDefaultQuery | gen.WithQueryInterface,
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
				if f.ColumnName == "updated_at" ||
					f.ColumnName == "created_at" ||
					f.ColumnName == "deleted_at" {
					// https://gorm.io/zh_CN/docs/models.html#%E5%88%9B%E5%BB%BA-x2F-%E6%9B%B4%E6%96%B0%E6%97%B6%E9%97%B4%E8%BF%BD%E8%B8%AA%EF%BC%88%E7%BA%B3%E7%A7%92%E3%80%81%E6%AF%AB%E7%A7%92%E3%80%81%E7%A7%92%E3%80%81Time%EF%BC%89
					f.GORMTag.Set("autoUpdateTime", "milli")
				}
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

		var models []any
		for table, col2Model := range mapping {
			opts := make([]gen.ModelOpt, 0, len(col2Model))
			for column, m := range col2Model {
				cp := m
				opts = append(opts, gen.FieldModify(genModify(column, cp)))
			}
			models = append(models, g.GenerateModel(table, opts...))
		}

		g.ApplyBasic(models...)

		g.Execute()
	}
}
