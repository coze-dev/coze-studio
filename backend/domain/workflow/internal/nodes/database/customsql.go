package database

import (
	"context"
	"errors"
	"regexp"
	"strings"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

var regexStringParams = regexp.MustCompile("`\\{\\{([a-zA-Z_][a-zA-Z0-9_]*(?:\\.\\w+|\\[\\d+\\])*)+\\}\\}`|'\\{\\{([a-zA-Z_][a-zA-Z0-9_]*(?:\\.\\w+|\\[\\d+\\])*)+\\}\\}'")

type CustomSQLConfig struct {
	DatabaseInfoID    int64
	SQLTemplate       string
	OutputConfig      map[string]*nodes.TypeInfo
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
	}
	templateSQL := c.config.SQLTemplate

	sqlParams := regexStringParams.FindAllString(templateSQL, -1)

	if len(sqlParams) > 0 {
		ps := make([]string, 0, len(sqlParams))
		for _, p := range sqlParams {
			val, err := nodes.Jinja2TemplateRender(p, input)
			if err != nil {
				return nil, err
			}
			ps = append(ps, val[1:len(val)-1]) // what is rendered is `xxx` or `yyy` and you need to remove `` or ''
			templateSQL = strings.Replace(templateSQL, p, "?", 1)
		}
		req.Params = ps

	}

	sql, err := nodes.Jinja2TemplateRender(templateSQL, input)
	if err != nil {
		return nil, err
	}
	req.SQL = sql

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
