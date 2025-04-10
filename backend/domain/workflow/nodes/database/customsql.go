package database

import (
	"context"
	"regexp"
	"strings"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

var regexStringParams = regexp.MustCompile("`\\{\\{([a-zA-Z_][a-zA-Z0-9_]*(?:\\.\\w+|\\[\\d+\\])*)+\\}\\}`|'\\{\\{([a-zA-Z_][a-zA-Z0-9_]*(?:\\.\\w+|\\[\\d+\\])*)+\\}\\}'")

type CustomSQLer interface {
	Execute(ctx context.Context, request *CustomSQLRequest) (*Response, error)
}
type CustomSQLConfig struct {
	DatabaseInfoID string
	SQLTemplate    string
	OutputConfig   OutputConfig
	CustomSQLer    CustomSQLer
}

type CustomSQL struct {
	config *CustomSQLConfig
}

type CustomSQLRequest struct {
	DatabaseInfoID string
	SQL            string
	Params         []string
}

func (c *CustomSQL) Execute(ctx context.Context, input map[string]any) (map[string]any, error) {

	req := &CustomSQLRequest{
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

	response, err := c.config.CustomSQLer.Execute(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(c.config.OutputConfig.OutputList, response)
	if err != nil {
		return nil, err
	}

	return ret, nil
}
