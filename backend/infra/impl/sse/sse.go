package sse

import (
	"context"

	"github.com/hertz-contrib/sse"
)

type SSenderImpl struct {
	ss *sse.Stream
}

func NewSSESender(ss *sse.Stream) *SSenderImpl {
	return &SSenderImpl{
		ss: ss,
	}
}

func (s *SSenderImpl) Send(ctx context.Context, event *sse.Event) error {

	return s.ss.Publish(event)
}
