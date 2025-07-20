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

package database

import (
	"context"
	"errors"
	"reflect"
	"strings"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

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
		val, err := templatePart.Render(inputBytes, nodes.WithNilRender(func() (string, error) {
			return "", nilError
		}),
			nodes.WithCustomRender(reflect.TypeOf(false), func(val any) (string, error) {
				b := val.(bool)
				if b {
					return "1", nil
				}
				return "0", nil
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
	templateSQL = strings.Replace(templateSQL, "'?'", "?", -1)
	templateSQL = strings.Replace(templateSQL, "`?`", "?", -1)
	req.SQL = templateSQL
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
