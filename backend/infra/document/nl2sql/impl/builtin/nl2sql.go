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

	"github.com/coze-dev/coze-studio/backend/bizpkg/llm/modelbuilder"
	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/infra/document/nl2sql"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

const (
	defaultTableFmt  = "table name: %s.\ntable describe: %s.\n\n| field name | description | field type | is required |\n"
	defaultColumnFmt = "| %s | %s | %s | %t |\n\n"
)

func NewNL2SQL(_ context.Context, cm modelbuilder.BaseChatModel, tpl prompt.ChatTemplate) (nl2sql.NL2SQL, error) {
	return &n2s{cm: cm, tpl: tpl}, nil
}

type n2s struct {
	ch       *compose.Chain[*nl2sqlInput, string]
	runnable compose.Runnable[*nl2sqlInput, string]

	cm  modelbuilder.BaseChatModel
	tpl prompt.ChatTemplate
}

func (n *n2s) NL2SQL(ctx context.Context, messages []*schema.Message, tables []*document.TableSchema, opts ...nl2sql.Option) (sql string, err error) {
	o := &nl2sql.Options{ChatModel: n.cm}
	for _, opt := range opts {
		opt(o)
	}

	if o.ChatModel == nil {
		return "", fmt.Errorf("[NL2SQL] chat model not configured")
	}

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
		AppendChatTemplate(n.tpl).
		AppendChatModel(o.ChatModel).
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
		return "", err
	}

	input := &nl2sqlInput{
		messages: messages,
		tables:   tables,
	}

	return r.Invoke(ctx, input)
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
