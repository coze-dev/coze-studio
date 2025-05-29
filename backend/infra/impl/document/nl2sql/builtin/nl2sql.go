package builtin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/nl2sql"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

const (
	defaultTableFmt  = "table name: %s.\ntable describe: %s.\n\n| field name | description | field type | is required |\n"
	defaultColumnFmt = "| %s | %s | %s | %t |\n\n"
)

func NewNL2SQL(ctx context.Context, cm chatmodel.BaseChatModel, tpl prompt.ChatTemplate) (nl2sql.NL2SQL, error) {
	c := compose.NewChain[*nl2sqlInput, string]().
		AppendLambda(compose.InvokableLambda(func(ctx context.Context, input *nl2sqlInput) (output map[string]any, err error) {
			if len(input.tables) == 0 {
				return nil, errors.New("table meta is empty")
			}
			tableDesc := strings.Builder{}
			for _, table := range input.tables {
				tableDesc.WriteString(fmt.Sprintf(defaultTableFmt, table.Name, table.Comment))
				for _, column := range table.Columns {
					tableDesc.WriteString(fmt.Sprintf(defaultColumnFmt, column.Name, column.Description, column.Type.String(), !column.Nullable))
				}
			}
			//logs.CtxInfof(ctx, "table schema: %s", tableDesc.String())
			return map[string]interface{}{
				"messages":     input.messages,
				"table_schema": tableDesc.String(),
			}, nil
		})).
		AppendChatTemplate(tpl).
		AppendChatModel(cm).
		AppendLambda(compose.InvokableLambda(func(ctx context.Context, msg *schema.Message) (sql string, err error) {
			var promptResp *promptResponse
			if err := json.Unmarshal([]byte(msg.Content), &promptResp); err != nil {
				logs.CtxWarnf(ctx, "unmarshal failed: %v", err)
				return "", err
			}
			if promptResp.SQL == "" {
				logs.CtxInfof(ctx, "no sql generated, err_code: %v, err_msg: %v", promptResp.ErrCode, promptResp.ErrMsg)
				return "", errors.New(promptResp.ErrMsg)
			}
			return promptResp.SQL, nil
		}))

	r, err := c.Compile(ctx)
	if err != nil {
		return nil, err
	}

	return &n2s{
		ch:       c,
		runnable: r,
	}, nil
}

type n2s struct {
	ch       *compose.Chain[*nl2sqlInput, string]
	runnable compose.Runnable[*nl2sqlInput, string]
}

func (n *n2s) NL2SQL(ctx context.Context, messages []*schema.Message, tables []*document.TableSchema) (sql string, err error) {
	input := &nl2sqlInput{
		messages: messages,
		tables:   tables,
	}

	return n.runnable.Invoke(ctx, input)
}

type nl2sqlInput struct {
	messages []*schema.Message
	tables   []*document.TableSchema
}

type promptResponse struct {
	SQL     string `json:"sql"`
	ErrCode int    `json:"err_code"`
	ErrMsg  string `json:"err_msg"`
}
