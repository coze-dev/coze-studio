package nl2sqlImpl

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/schema"
)

func TestNL2Sql(t *testing.T) {
	nl2sql := NewNL2Sql(nil, "")
	RewrittenQuery, err := nl2sql.NL2Sql(context.Background(), "查询project_id为10086的销售记录主键id", []*schema.Message{}, nil)
	t.Log(err)
	t.Log(RewrittenQuery)
}
