package rewrite

import "context"

type QueryRewriter interface {
	Rewrite(ctx context.Context, query string, extra map[string]string) (newQuery string, err error) // todo: 确认下当前可以提供的字段，替换 query 和 extra
}
