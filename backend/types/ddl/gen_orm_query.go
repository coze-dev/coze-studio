package main

//
//import (
//	"log"
//	"os"
//	"reflect"
//	"strings"
//
//	"github.com/getkin/kin-openapi/openapi3"
//	"gorm.io/driver/mysql"
//	"gorm.io/gen"
//	"gorm.io/gorm"
//	"gorm.io/gorm/schema"
//
//	singleagent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/interna/dal/model"
//	"code.byted.org/flow/opencoze/backend/domain/model/dal/model"
//)
//
//var path2Table2Columns2Model = map[string]map[string]map[string]any{
//	"domain/agent/singleagent/dal/query": {
//		"single_agent_draft": {
//			"model_info":    &singleagent.ModelInfo{},
//			"prompt":        &singleagent.Prompt{},
//			"plugin":        &singleagent.Plugin{},
//			"knowledge":     &singleagent.Knowledge{},
//			"workflow":      &singleagent.Workflow{},
//			"suggest_reply": &singleagent.SuggestReply{},
//			"jump_config":   &singleagent.JumpConfig{},
//		},
//		"single_agent_version": {
//			"model_info":    &singleagent.ModelInfo{},
//			"prompt":        &singleagent.Prompt{},
//			"plugin":        &singleagent.Plugin{},
//			"knowledge":     &singleagent.Knowledge{},
//			"workflow":      &singleagent.Workflow{},
//			"suggest_reply": &singleagent.SuggestReply{},
//			"jump_config":   &singleagent.JumpConfig{},
//		},
//	},
//	"domain/model/dal/query": {
//		"model_meta": {
//			"capability":   &model.Capability{},
//			"conn_config":  &model.ConnConfig{},
//			"param_schema": &openapi3.Schema{},
//			//"status":       model.Status(0),
//		},
//		"model_entity": {
//			//"scenario": model.Scenario(0),
//		},
//	},
//}
//
//func main() {
//	dsn := os.Getenv("MYSQL_DSN")
//	gormDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
//		NamingStrategy: schema.NamingStrategy{
//			SingularTable: true,
//		},
//	})
//	if err != nil {
//		log.Fatalf("gorm.Open failed, err=%v", err)
//	}
//
//	for path, mapping := range path2Table2Columns2Model {
//		g := gen.NewGenerator(gen.Config{
//			OutPath: path,
//			Mode:    gen.WithoutContext | gen.WithDefaultQuery | gen.WithQueryInterface,
//		})
//
//		parts := strings.Split(path, "/")
//		modelPath := strings.Join(append(parts[:len(parts)-1], g.Config.ModelPkgPath), "/")
//
//		g.UseDB(gormDB)
//		g.WithOpts(gen.FieldType("deleted_at", "gorm.DeletedAt"))
//
//		var resolveType func(typ reflect.Type, required bool) string
//		resolveType = func(typ reflect.Type, required bool) string {
//			switch typ.Kind() {
//			case reflect.Ptr:
//				return resolveType(typ.Elem(), false)
//			case reflect.Slice:
//				return "[]" + resolveType(typ.Elem(), required)
//			default:
//				prefix := "*"
//				if required {
//					prefix = ""
//				}
//
//				if strings.HasSuffix(typ.PkgPath(), modelPath) {
//					return prefix + typ.Name()
//				}
//
//				return prefix + typ.String()
//			}
//		}
//
//		genModify := func(col string, model any) func(f gen.Field) gen.Field {
//			return func(f gen.Field) gen.Field {
//				if f.ColumnName != col {
//					return f
//				}
//
//				st := reflect.TypeOf(model)
//				// f.Name = st.Name()
//				f.Type = resolveType(st, true)
//				f.GORMTag.Set("serializer", "json")
//				return f
//			}
//		}
//
//		var models []any
//		for table, col2Model := range mapping {
//			opts := make([]gen.ModelOpt, 0, len(col2Model))
//			for column, m := range col2Model {
//				cp := m
//				opts = append(opts, gen.FieldModify(genModify(column, cp)))
//			}
//			models = append(models, g.GenerateModel(table, opts...))
//		}
//
//		g.ApplyBasic(models...)
//
//		g.Execute()
//	}
//}
