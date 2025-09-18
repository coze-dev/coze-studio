package tool

import (
	"context"
)

type Invocation interface {
	Do(ctx context.Context, args *InvocationArgs) (request string, resp string, err error)
}
