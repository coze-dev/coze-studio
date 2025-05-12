package messages2query

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type MessagesToQuery interface {
	MessagesToQuery(ctx context.Context, chatHistory []*schema.Message) (newQuery string, err error)
}
