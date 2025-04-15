package rewrite

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type QueryRewriter interface {
	Rewrite(ctx context.Context, query string, chatHistory []*schema.Message) (newQuery string, err error) // todo: 确认下当前可以提供的字段，替换 query 和 extra
}
