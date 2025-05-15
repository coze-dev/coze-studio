package crossdomain

import "context"

type ChatModel interface {
	StreamExecute(ctx context.Context)
}
