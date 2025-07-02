package database

import (
	"context"
	"errors"
	"reflect"
	"regexp"
	"strings"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
)

var regexStringParams = regexp.MustCompile("`\\{\\{([a-zA-Z_][a-zA-Z0-9_]*(?:\\.\\w+|\\[\\d+\\])*)+\\}\\}`|'\\{\\{([a-zA-Z_][a-zA-Z0-9_]*(?:\\.\\w+|\\[\\d+\\])*)+\\}\\}'")

type CustomSQLConfig struct {
	DatabaseInfoID    int64
	SQLTemplate       string
	OutputConfig      map[string]*vo.TypeInfo
	CustomSQLExecutor database.DatabaseOperator
}

func NewCustomSQL(_ context.Context, cfg *CustomSQLConfig) (*CustomSQL, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}
	if cfg.SQLTemplate == "" {
		return nil, errors.New("sql template is required")
	}
	if cfg.CustomSQLExecutor == nil {
		return nil, errors.New("custom sqler is required")
	}
	return &CustomSQL{
		config: cfg,
	}, nil
}

type CustomSQL struct {
	config *CustomSQLConfig
}

func (c *CustomSQL) Execute(ctx context.Context, input map[string]any) (map[string]any, error) {

	req := &database.CustomSQLRequest{
		DatabaseInfoID: c.config.DatabaseInfoID,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
	}

	inputBytes, err := sonic.Marshal(input)
	if err != nil {
		return nil, err
	}

	templateSQL := ""
	templateParts := nodes.ParseTemplate(c.config.SQLTemplate)
	sqlParams := make([]database.SQLParam, 0, len(templateParts))
	var nilError = errors.New("field is nil")
	for _, templatePart := range templateParts {
		if !templatePart.IsVariable {
			templateSQL += templatePart.Value
			continue
		}
		templateSQL += "?"

		val, err := templatePart.Render(inputBytes, nodes.WithCustomRender(reflect.Type(nil), func(a any) (string, error) {
			return "", nilError
		}))

		if err != nil {
			if !errors.Is(err, nilError) {
				return nil, err
			}
			sqlParams = append(sqlParams, database.SQLParam{
				IsNull: true,
			})
		} else {
			sqlParams = append(sqlParams, database.SQLParam{
				Value:  val,
				IsNull: false,
			})
		}

	}

	// replace sql template '?' to ?
	req.SQL = strings.Replace(templateSQL, "'?'", "?", -1)
	req.Params = sqlParams
	response, err := c.config.CustomSQLExecutor.Execute(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(c.config.OutputConfig, response)
	if err != nil {
		return nil, err
	}

	return ret, nil
}
