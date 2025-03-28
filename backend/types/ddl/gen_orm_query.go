package main

import (
	"log"
	"os"
	"reflect"

	"gorm.io/driver/mysql"
	"gorm.io/gen"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/dal/model"
)

var table2Column2Model = map[string]map[string]any{
	"single_agent_draft": {
		"model_info":    &model.ModelInfo{},
		"prompt":        &model.Prompt{},
		"plugin":        &model.Plugin{},
		"knowledge":     &model.Knowledge{},
		"workflow":      &model.Workflow{},
		"suggest_reply": &model.SuggestReply{},
		"jump_config":   &model.JumpConfig{},
	},
	"single_agent_version": {
		"model_info":    &model.ModelInfo{},
		"prompt":        &model.Prompt{},
		"plugin":        &model.Plugin{},
		"knowledge":     &model.Knowledge{},
		"workflow":      &model.Workflow{},
		"suggest_reply": &model.SuggestReply{},
		"jump_config":   &model.JumpConfig{},
	},
}

func main() {
	dsn := os.Getenv("MYSQL_DSN")
	gormDB, err := gorm.Open(mysql.Open(dsn))
	if err != nil {
		log.Fatalf("gorm.Open failed, err=%v", err)
	}

	g := gen.NewGenerator(gen.Config{
		OutPath: "../../domain/agent/singleagent/dal/query",
		Mode:    gen.WithoutContext | gen.WithDefaultQuery | gen.WithQueryInterface,
	})

	g.UseDB(gormDB)
	g.WithOpts(gen.FieldType("deleted_at", "gorm.DeletedAt"))

	var resolveType func(typ reflect.Type) string
	resolveType = func(typ reflect.Type) string {
		switch typ.Kind() {
		case reflect.Ptr:
			return resolveType(typ.Elem())
		case reflect.Slice:
			return "[]" + resolveType(typ.Elem())
		default:
			return "*" + typ.Name()
		}
	}

	genModify := func(col string, model any) func(f gen.Field) gen.Field {
		return func(f gen.Field) gen.Field {
			if f.ColumnName != col {
				return f
			}

			st := reflect.TypeOf(model)
			// f.Name = st.Name()
			f.Type = resolveType(st)
			f.GORMTag.Set("serializer", "json")
			return f
		}
	}

	var models []any
	for table, col2Model := range table2Column2Model {
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
