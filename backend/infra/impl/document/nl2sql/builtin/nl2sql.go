package builtin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/nl2sql"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func NewNL2SQL(cm chatmodel.ChatModel, systemPrompt string) nl2sql.NL2SQL {
	return &n2s{cm: cm, sp: systemPrompt}
}

type n2s struct {
	cm chatmodel.ChatModel
	sp string
}

const queryTemplate = `help me implement NL2SQL.
table schema description:{{tableSchema}}
natural language description of the SQL requirement: {{chat_history}}.`
const (
	defaultTableFmt  = "table name: %s.\ntable describe: %s.\n\n| field name | description | field type | is required |\n"
	defaultColumnFmt = "| %s | %s | %s | %t |\n\n"
)

func (n *n2s) NL2SQL(ctx context.Context, messages []*schema.Message, tables []*document.TableSchema) (sql string, err error) {
	if len(tables) == 0 {
		return "", errors.New("table meta is empty")
	}
	tableDesc := ""
	for _, table := range tables {
		tableDesc += fmt.Sprintf(defaultTableFmt, table.Name, table.Comment)
		for _, column := range table.Columns {
			tableDesc += fmt.Sprintf(defaultColumnFmt, column.Name, column.Description, column.Type.String(), !column.Nullable)
		}
	}
	logs.CtxInfof(ctx, "table schema: %s", tableDesc)
	tpl := prompt.FromMessages(schema.Jinja2,
		schema.SystemMessage(n.sp),
		schema.UserMessage(queryTemplate),
	)

	input, err := tpl.Format(ctx, map[string]interface{}{
		"chat_history": messages,
		"tableSchema":  tableDesc,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "render template failed: %v", err)
		return "", err
	}

	message, err := n.cm.Generate(ctx, input)
	if err != nil {
		logs.CtxErrorf(ctx, "generate failed: %v", err)
		return "", err
	}
	var promptResp *promptResponse
	if err := json.Unmarshal([]byte(message.Content), &promptResp); err != nil {
		logs.CtxWarnf(ctx, "unmarshal failed: %v", err)
		return "", err
	}
	if promptResp.SQL == "" {
		logs.CtxInfof(ctx, "no sql generated, err_code: %v, err_msg: %v", promptResp.ErrCode, promptResp.ErrMsg)
		return "", errors.New(promptResp.ErrMsg)
	}
	return promptResp.SQL, nil
}

type promptResponse struct {
	SQL     string `json:"sql"`
	ErrCode int    `json:"err_code"`
	ErrMsg  string `json:"err_msg"`
}
