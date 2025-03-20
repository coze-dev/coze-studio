package mq

type MQ interface {
	Produce(topic string, msg []byte) error
	Consume(topic string, handler func(msg []byte) error) error
}
