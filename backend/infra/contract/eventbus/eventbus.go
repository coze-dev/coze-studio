package eventbus

import "context"

type Producer interface {
	Send(ctx context.Context, body []byte) error
	BatchSend(ctx context.Context, bodyArr [][]byte) error
}

type Consumer interface{}
type ConsumerHandle interface {
	HandleMessage(ctx context.Context, msg *Message) error
}

type Message struct {
	Topic string
	Group string
	Body  []byte
}
