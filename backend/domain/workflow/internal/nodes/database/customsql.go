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
	"fmt"
	"reflect"
	"regexp"
	"strconv"

	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/database"
	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

var singleQuotesStringRegexp = regexp.MustCompile("[`']\\{\\{([a-zA-Z_][a-zA-Z0-9_]*(?:\\.\\w+|\\[\\d+\\])*)+\\}\\}[`']")

type CustomSQLConfig struct {
	DatabaseInfoID int64
	SQLTemplate    string
}

func (c *CustomSQLConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeDatabaseCustomSQL,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	dsList := n.Data.Inputs.DatabaseInfoList
	if len(dsList) == 0 {
		return nil, fmt.Errorf("database info is requird")
	}
	databaseInfo := dsList[0]

	dsID, err := strconv.ParseInt(databaseInfo.DatabaseInfoID, 10, 64)
	if err != nil {
		return nil, err
	}
	c.DatabaseInfoID = dsID

	sql := n.Data.Inputs.SQL
	if len(sql) == 0 {
		return nil, fmt.Errorf("sql is requird")
	}

	c.SQLTemplate = sql

	if err = convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err = convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (c *CustomSQLConfig) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	if c.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}
	if c.SQLTemplate == "" {
		return nil, errors.New("sql template is required")
	}

	return &CustomSQL{
		databaseInfoID: c.DatabaseInfoID,
		sqlTemplate:    c.SQLTemplate,
		outputTypes:    ns.OutputTypes,
	}, nil
}

type CustomSQL struct {
	databaseInfoID int64
	sqlTemplate    string
	outputTypes    map[string]*vo.TypeInfo
}

func (c *CustomSQL) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	req := &database.CustomSQLRequest{
		DatabaseInfoID: c.databaseInfoID,
		IsDebugRun:     isDebugExecute(ctx),
		UserID:         getExecUserID(ctx),
		ConnectorID:    getConnectorID(ctx),
	}

	inputBytes, err := sonic.Marshal(input)
	if err != nil {
		return nil, err
	}

	templateParts := nodes.ParseTemplate(singleQuotesStringRegexp.ReplaceAllString(c.sqlTemplate, "?"))
	templateSQL := ""
	if len(templateParts) > 0 {
		if len(templateParts) == 0 {
			templateSQL = templateParts[0].Value
		} else {
			for _, templatePart := range templateParts {
				if !templatePart.IsVariable {
					templateSQL += templatePart.Value
					continue
				}

				val, err := templatePart.Render(inputBytes, nodes.WithCustomRender(reflect.TypeOf(false), func(val any) (string, error) {
					b := val.(bool)
					if b {
						return "1", nil
					}
					return "0", nil
				}))
				if err != nil {
					return nil, err
				}
				templateSQL += val

			}
		}

	} else {
		return nil, fmt.Errorf("parse template invalid")
	}

	sqlParamStrings := singleQuotesStringRegexp.FindAllString(c.sqlTemplate, -1)
	sqlParams := make([]database.SQLParam, 0, len(sqlParamStrings))
	for _, s := range sqlParamStrings {
		parts := nodes.ParseTemplate(s)
		for _, part := range parts {
			if part.IsVariable {
				val, err := part.Render(inputBytes, nodes.WithCustomRender(reflect.TypeOf(false), func(val any) (string, error) {
					b := val.(bool)
					if b {
						return "1", nil
					}
					return "0", nil
				}))
				if err != nil {
					return nil, err
				}
				sqlParams = append(sqlParams, database.SQLParam{
					Value: val,
				})
			}
		}
	}

	req.SQL = templateSQL
	req.Params = sqlParams
	response, err := crossdatabase.DefaultSVC().Execute(ctx, req)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(c.outputTypes, response)
	if err != nil {
		return nil, err
	}

	return ret, nil
}
