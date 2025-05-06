package llm_based

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/schema"
)

func TestNL2Sql(t *testing.T) {
	nl2sql := NewNL2Sql(nil, "")
	RewrittenQuery, err := nl2sql.NL2Sql(context.Background(), "查询project_id为10086的销售记录", []*schema.Message{}, `table name: sales_record.
table describe: 销售记录.

| field name | description | field type | is required |
| id |  | bigint | true |
| product_id |  | bigint |  |
| comment |  | varchar(32) | false |
`)
	t.Log(err)
	t.Log(RewrittenQuery)
}
