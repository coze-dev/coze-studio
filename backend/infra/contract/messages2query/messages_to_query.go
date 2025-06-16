package messages2query

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type MessagesToQuery interface {
	MessagesToQuery(ctx context.Context, messages []*schema.Message, opts ...Option) (newQuery string, err error)
}
