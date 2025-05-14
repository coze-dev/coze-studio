package agentflow

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/components/tool/utils"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	dbEntity "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
)

type databaseConfig struct {
	userID      int64
	spaceID     int64
	connectorID *int64
	isDraft     bool

	databaseConf []*bot_common.Database
	dbSvr        crossdomain.Database
}

type databaseTool struct {
	userID      int64
	spaceID     int64
	connectorID *int64
	isDraft     bool
	databaseID  int64

	dbSvr crossdomain.Database
}

type ExecuteSQLRequest struct {
	SQL       string                  `json:"sql" jsonschema:"description=SQL query to execute against the database. You can use standard SQL syntax like SELECT, INSERT, UPDATE, DELETE."`
	SQLParams []*dbEntity.SQLParamVal `json:"sql_params" jsonschema:"description=Optional parameters for parameterized SQL queries. Use these to safely insert values into your query and prevent SQL injection."`
}

func (t *databaseTool) Invoke(ctx context.Context, req ExecuteSQLRequest) (string, error) {
	eReq := &database.ExecuteSQLRequest{
		SQL:        &req.SQL,
		DatabaseID: t.databaseID,
		SQLParams:  req.SQLParams,

		User: &userEntity.UserIdentity{
			UserID:  t.userID,
			SpaceID: t.spaceID,
		},
		ConnectorID: t.connectorID,
	}

	eReq.TableType = dbEntity.TableType_OnlineTable
	if t.isDraft {
		eReq.TableType = dbEntity.TableType_DraftTable
	}

	sqlResult, err := t.dbSvr.ExecuteSQL(ctx, eReq)
	if err != nil {
		return "", err
	}

	return formatDatabaseResult(sqlResult), nil
}

func newDatabaseTools(ctx context.Context, conf *databaseConfig) ([]tool.InvokableTool, error) {
	if conf == nil || conf.dbSvr == nil || len(conf.databaseConf) == 0 {
		return nil, nil
	}

	dbInfos := conf.databaseConf
	dbSvr := conf.dbSvr

	d := &databaseTool{
		userID:      conf.userID,
		spaceID:     conf.spaceID,
		connectorID: conf.connectorID,
		isDraft:     conf.isDraft,
		dbSvr:       dbSvr,
	}

	tools := make([]tool.InvokableTool, 0, len(dbInfos))
	for _, dbInfo := range dbInfos {
		tID, err := strconv.ParseInt(dbInfo.GetTableId(), 10, 64)
		if err != nil {
			return nil, err
		}

		d.databaseID = tID
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

	sb.WriteString(fmt.Sprintf("mysql '%s' query tool.", tableInfo.GetTableName()))
	if tableInfo.GetTableDesc() != "" {
		sb.WriteString(fmt.Sprintf(" This table stores %s.", tableInfo.GetTableDesc()))
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

func formatDatabaseResult(result *database.ExecuteSQLResponse) string {
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

	for _, record := range result.Records {
		sb.WriteString("| ")
		for _, header := range headers {
			value, exists := record[header]
			if !exists {
				value = ""
			}
			sb.WriteString(value + " | ")
		}
		sb.WriteString("\n")
	}

	if result.RowsAffected != nil {
		sb.WriteString("\nRows affected: " + strconv.FormatInt(*result.RowsAffected, 10))
	}

	return sb.String()
}
