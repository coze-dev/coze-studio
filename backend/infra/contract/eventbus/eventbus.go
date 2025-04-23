package eventbus

import "context"

type Producer interface {
	Send(ctx context.Context, body []byte, opts ...SendOpt) error
	BatchSend(ctx context.Context, bodyArr [][]byte, opts ...SendOpt) error
}

type (
	Consumer       interface{}
	ConsumerHandle interface {
		HandleMessage(ctx context.Context, msg *Message) error
	}
)

type Message struct {
	Topic string
	Group string
	Body  []byte
}
