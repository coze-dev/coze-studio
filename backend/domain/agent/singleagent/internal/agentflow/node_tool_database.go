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

package agentflow

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/components/tool/utils"

	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/api/model/data/database/table"
	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/contract/database"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	"github.com/coze-dev/coze-studio/backend/infra/impl/sqlparser"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

const (
	TimeFormat = "2006-01-02 15:04:05"
)

type databaseConfig struct {
	agentIdentity *entity.AgentIdentity
	userID        string
	spaceID       int64

	databaseConf []*bot_common.Database
}

type databaseTool struct {
	agentIdentity *entity.AgentIdentity
	connectorUID  string
	spaceID       int64

	databaseID int64

	name           string
	promptDisabled bool
}

type ExecuteSQLRequest struct {
	SQL string `json:"sql" jsonschema:"description=SQL query to execute against the database. You can use standard SQL syntax like SELECT, INSERT, UPDATE, DELETE."`
}

func (d *databaseTool) Invoke(ctx context.Context, req ExecuteSQLRequest) (string, error) {
	if req.SQL == "" {
		return "", fmt.Errorf("sql is empty")
	}
	if d.promptDisabled {
		return "the tool to be called is not available", nil
	}

	tableType := table.TableType_OnlineTable
	if d.agentIdentity.IsDraft {
		tableType = table.TableType_DraftTable
	}

	tableName, err := sqlparser.NewSQLParser().GetTableName(req.SQL)
	if err != nil {
		return "", err
	}
	if tableName != d.name {
		return "", fmt.Errorf("sql table name %s not match database %s", tableName, d.name)
	}

	eReq := &service.ExecuteSQLRequest{
		SQL:         &req.SQL,
		DatabaseID:  d.databaseID,
		SQLType:     database.SQLType_Raw,
		UserID:      d.connectorUID,
		SpaceID:     d.spaceID,
		ConnectorID: ptr.Of(d.agentIdentity.ConnectorID),
		TableType:   tableType,
	}

	sqlResult, err := crossdatabase.DefaultSVC().ExecuteSQL(ctx, eReq)
	if err != nil {
		return "", err
	}

	return formatDatabaseResult(sqlResult), nil
}

func newDatabaseTools(ctx context.Context, conf *databaseConfig) ([]tool.InvokableTool, error) {
	if conf == nil || len(conf.databaseConf) == 0 {
		return nil, nil
	}

	dbInfos := conf.databaseConf

	tools := make([]tool.InvokableTool, 0, len(dbInfos))
	for _, dbInfo := range dbInfos {
		tID, err := strconv.ParseInt(dbInfo.GetTableId(), 10, 64)
		if err != nil {
			return nil, err
		}
		d := &databaseTool{
			spaceID:        conf.spaceID,
			connectorUID:   conf.userID,
			agentIdentity:  conf.agentIdentity,
			promptDisabled: dbInfo.GetPromptDisabled(),
			name:           dbInfo.GetTableName(),
			databaseID:     tID,
		}

		dbTool, err := utils.InferTool(dbInfo.GetTableName(), buildDatabaseToolDescription(dbInfo), d.Invoke)
		if err != nil {
			return nil, err
		}

		tools = append(tools, dbTool)
	}

	return tools, nil
}

func buildDatabaseToolDescription(tableInfo *bot_common.Database) string {
	var sb strings.Builder

	sb.WriteString(fmt.Sprintf("Mysql query tool. Table name is '%s'.", tableInfo.GetTableName()))
	if tableInfo.GetTableDesc() != "" {
		sb.WriteString(fmt.Sprintf(" This table's desc is %s.", tableInfo.GetTableDesc()))
	}
	sb.WriteString("\n\nTable structure:\n")

	for _, field := range tableInfo.FieldList {
		if field.Name == nil || field.Type == nil {
			continue
		}

		fieldType := getFieldTypeString(*field.Type)
		sb.WriteString(fmt.Sprintf("- %s (%s)", *field.Name, fieldType))

		if field.Desc != nil && *field.Desc != "" {
			sb.WriteString(fmt.Sprintf(": %s", *field.Desc))
		}

		if field.MustRequired != nil && *field.MustRequired {
			sb.WriteString(" (required)")
		}

		sb.WriteString("\n")
	}

	sb.WriteString("\nUse SQL to query this table. You can write SQL statements directly to operate.")
	return sb.String()
}

func getFieldTypeString(fieldType bot_common.FieldItemType) string {
	switch fieldType {
	case bot_common.FieldItemType_Text:
		return "text"
	case bot_common.FieldItemType_Number:
		return "number"
	case bot_common.FieldItemType_Date:
		return "date"
	case bot_common.FieldItemType_Float:
		return "float"
	case bot_common.FieldItemType_Boolean:
		return "bool"
	default:
		return "invalid"
	}
}

func formatDatabaseResult(result *service.ExecuteSQLResponse) string {
	var sb strings.Builder

	if len(result.Records) == 0 {
		if result.RowsAffected == nil {
			return "result is empty"
		} else {
			sb.WriteString("Rows affected: " + strconv.FormatInt(*result.RowsAffected, 10))
			return sb.String()
		}
	}

	var headers []string
	if len(result.Records) > 0 {
		firstRecord := result.Records[0]
		for key := range firstRecord {
			headers = append(headers, key)
		}
		sort.Strings(headers)
	}

	if len(headers) == 0 {
		return "no fields found in result"
	}

	sb.WriteString("| ")
	for _, header := range headers {
		sb.WriteString(header + " | ")
	}
	sb.WriteString("\n")

	sb.WriteString("| ")
	for range headers {
		sb.WriteString("--- | ")
	}
	sb.WriteString("\n")

	fieldMap := slices.ToMap(result.FieldList, func(f *database.FieldItem) (string, *database.FieldItem) {
		return f.Name, f
	})
	for _, record := range result.Records {
		sb.WriteString("| ")
		for _, header := range headers {
			value, exists := record[header]
			if !exists {
				value = ""
			}
			fieldType := table.FieldItemType_Text
			fValue, fExists := fieldMap[header]
			if fExists {
				fieldType = fValue.Type
			}
			sb.WriteString(convertDBValueToString(value, fieldType) + " | ")
		}
		sb.WriteString("\n")
	}

	if result.RowsAffected != nil {
		sb.WriteString("\nRows affected: " + strconv.FormatInt(*result.RowsAffected, 10))
	}

	return sb.String()
}

func convertDBValueToString(value interface{}, fieldType table.FieldItemType) string {
	switch fieldType {
	case table.FieldItemType_Text:
		if byteArray, ok := value.([]uint8); ok {
			return string(byteArray)
		}

	case table.FieldItemType_Number:
		switch v := value.(type) {
		case int64:
			return strconv.FormatInt(v, 10)
		case []uint8:
			return string(v)
		}

	case table.FieldItemType_Float:
		switch v := value.(type) {
		case float64:
			return strconv.FormatFloat(v, 'f', -1, 64)
		case []uint8:
			return string(v)
		}

	case table.FieldItemType_Boolean:
		switch v := value.(type) {
		case bool:
			return strconv.FormatBool(v)
		case int64:
			return strconv.FormatBool(v != 0)
		case []uint8:
			boolStr := string(v)
			if boolStr == "1" || boolStr == "true" {
				return "true"
			}
			return "false"
		}

	case table.FieldItemType_Date:
		switch v := value.(type) {
		case time.Time:
			return v.Format(TimeFormat)
		case []uint8:
			return string(v)
		}
	}

	return fmt.Sprintf("%v", value)
}
