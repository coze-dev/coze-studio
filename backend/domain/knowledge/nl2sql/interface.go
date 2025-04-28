package rewrite

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type NL2Sql interface {
	NL2Sql(ctx context.Context, query string, chatHistory []*schema.Message, tableSchema string) (sqlString string, err error)
}
