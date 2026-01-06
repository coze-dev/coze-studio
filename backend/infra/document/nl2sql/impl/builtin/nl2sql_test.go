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
	"testing"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/infra/document"
)

func TestNL2SQL(t *testing.T) {
	ctx := context.Background()

	t.Run("test table meta not provided", func(t *testing.T) {
		impl, err := NewNL2SQL(ctx, &mockChatModel{"mock resp"}, prompt.FromMessages(schema.Jinja2,
			schema.SystemMessage("system message 123"),
			schema.UserMessage("{{messages}}, {{table_meta}}"),
		))
		assert.NoError(t, err)

		sql, err := impl.NL2SQL(ctx, []*schema.Message{schema.UserMessage("hello")}, nil)
		assert.Error(t, err)
		assert.Equal(t, "", sql)
	})

	t.Run("test parse failed", func(t *testing.T) {
		impl, err := NewNL2SQL(ctx, &mockChatModel{"mock resp"}, prompt.FromMessages(schema.Jinja2,
			schema.SystemMessage("system message 123"),
			schema.UserMessage("{{messages}}, {{table_meta}}"),
		))
		assert.NoError(t, err)

		sql, err := impl.NL2SQL(ctx, []*schema.Message{schema.UserMessage("hello")}, []*document.TableSchema{
			{
				Name:    "mock_table_1",
				Comment: "hello",
				Columns: []*document.Column{
					{
						ID:          121,
						Name:        "id",
						Type:        document.TableColumnTypeInteger,
						Description: "test",
						Nullable:    false,
						IsPrimary:   true,
						Sequence:    0,
					},
					{
						ID:          123,
						Name:        "col_1",
						Type:        document.TableColumnTypeString,
						Description: "column_1",
						Nullable:    true,
						IsPrimary:   false,
						Sequence:    1,
					},
				},
			},
		})
		assert.Error(t, err)
		assert.Equal(t, "", sql)
	})

	t.Run("test success", func(t *testing.T) {
		impl, err := NewNL2SQL(ctx, &mockChatModel{`{"sql":"mock sql","err_code":0,"err_msg":""}`}, prompt.FromMessages(schema.Jinja2,
			schema.SystemMessage("system message 123"),
			schema.UserMessage("{{messages}}, {{table_meta}}"),
		))
		assert.NoError(t, err)

		sql, err := impl.NL2SQL(ctx, []*schema.Message{schema.UserMessage("hello")}, []*document.TableSchema{
			{
				Name:    "mock_table_1",
				Comment: "hello",
				Columns: []*document.Column{
					{
						ID:          121,
						Name:        "id",
						Type:        document.TableColumnTypeInteger,
						Description: "test",
						Nullable:    false,
						IsPrimary:   true,
						Sequence:    0,
					},
					{
						ID:          123,
						Name:        "col_1",
						Type:        document.TableColumnTypeString,
						Description: "column_1",
						Nullable:    true,
						IsPrimary:   false,
						Sequence:    1,
					},
				},
			},
		})
		assert.NoError(t, err)
		assert.Equal(t, "mock sql", sql)
	})

}

type mockChatModel struct {
	content string
}

func (m mockChatModel) Generate(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.Message, error) {
	return schema.AssistantMessage(m.content, nil), nil
}

func (m mockChatModel) Stream(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	return nil, nil
}

func (m mockChatModel) BindTools(tools []*schema.ToolInfo) error {
	return nil
}

const sys = "# Role: NL2SQL Consultant\n\n## Goals\nTranslate natural language statements into SQL queries in MySQL standard. Follow the Constraints and return only a JSON always.\n\n## Format\n- JSON format only. JSON contains field \"sql\" for generated SQL, filed \"err_code\" for reason type, field \"err_msg\" for detail reason (prefer more than 10 words)\n- Don't use \"```json\" markdown format\n\n## Skills\n- Good at Translate natural language statements into SQL queries in MySQL standard.\n\n## Define\n\"err_code\" Reason Type Define:\n- 0 means you generated a SQL\n- 3002 means you cannot generate a SQL because of timeout\n- 3003 means you cannot generate a SQL because of table schema missing\n- 3005 means you cannot generate a SQL because of some term is ambiguous\n\n## Example\nQ: Help me implement NL2SQL.\n​.table schema description: ​​CREATE TABLE `sales_records` (\\n  `sales_id` bigint(20) unsigned NOT NULL COMMENT 'id of sales person',\\n  `product_id` bigint(64) COMMENT 'id of product',\\n  `sale_date` datetime(3) COMMENT 'sold date and time',\\n  `quantity_sold` int(11) COMMENT 'sold amount',\\n  PRIMARY KEY (`sales_id`)\\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售记录表';\n​.natural language description of the SQL requirement:  ​​​​查询上月的销量总额第一名的销售员和他的销售总额\nA: {\n  \"sql\":\"SELECT sales_id, SUM(quantity_sold) AS total_sales FROM sales_records WHERE MONTH(sale_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) AND YEAR(sale_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) GROUP BY sales_id ORDER BY total_sales DESC LIMIT 1\",\n  \"err_code\":0,\n  \"err_msg\":\"SQL query generated successfully\"\n}"
const usr = "help me implement NL2SQL.\ntable schema description:{{tableSchema}}\nnatural language description of the SQL requirement: {{chat_history}}."
