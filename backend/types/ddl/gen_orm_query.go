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
)

var path2Table2Columns2Model = map[string]map[string]map[string]any{
	"domain/agent/singleagent/internal/dal/query": {
		"single_agent_draft": {
			"model_info":      &agent_common.ModelInfo{},
			"onboarding_info": &agent_common.OnboardingInfo{},
			"prompt":          &agent_common.PromptInfo{},
			"plugin":          &[]agent_common.PluginInfo{},
			"knowledge":       &agent_common.Knowledge{},
			"workflow":        &[]agent_common.WorkflowInfo{},
			"suggest_reply":   &agent_common.SuggestReplyInfo{},
			"jump_config":     &agent_common.JumpConfig{},
		},
		"single_agent_version": {
			"model_info":      &agent_common.ModelInfo{},
			"onboarding_info": &agent_common.OnboardingInfo{},
			"prompt":          &agent_common.PromptInfo{},
			"plugin":          &[]agent_common.PluginInfo{},
			"knowledge":       &agent_common.Knowledge{},
			"workflow":        &[]agent_common.WorkflowInfo{},
			"suggest_reply":   &agent_common.SuggestReplyInfo{},
			"jump_config":     &agent_common.JumpConfig{},
		},
	},
	//"domain/model/dal/query": {
	//	"model_meta": {
	//		"capability":   &model.Capability{},
	//		"conn_config":  &model.ConnConfig{},
	//		"param_schema": &openapi3.Schema{},
	//		//"status":       model.Status(0),
	//	},
	//	"model_entity": {
	//		//"scenario": model.Scenario(0),
	//	},
	//},
}

func main() {
	dsn := os.Getenv("MYSQL_DSN")
	dsn = "root:password@tcp(localhost:3306)/test?charset=utf8mb4&parseTime=True"
	gormDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})
	if err != nil {
		log.Fatalf("gorm.Open failed, err=%v", err)
	}

	for path, mapping := range path2Table2Columns2Model {
		g := gen.NewGenerator(gen.Config{
			OutPath: path,
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
