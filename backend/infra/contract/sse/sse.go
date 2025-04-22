package sse

import (
	"context"

	"github.com/hertz-contrib/sse"
)

type SSender interface {
	Send(ctx context.Context, s *sse.Stream, event *sse.Event) error
}
