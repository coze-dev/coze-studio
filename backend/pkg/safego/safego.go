package safego

import (
	"context"

	"code.byted.org/flow/opencoze/backend/pkg/goutil"
)

func Go(ctx context.Context, fn func()) {
	go func() {
		defer goutil.Recovery(ctx)

		fn()
	}()
}
