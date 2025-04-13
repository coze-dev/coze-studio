package kafka

import (
	"context"

	"github.com/IBM/sarama"

	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/lang/signal"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type producerImpl struct {
	topic string
	p     sarama.SyncProducer
}

func NewProducer(broker, topic string) (eventbus.Producer, error) {
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.Return.Errors = true
	config.Producer.RequiredAcks = sarama.WaitForAll

	producer, err := sarama.NewSyncProducer([]string{broker}, config)
	if err != nil {
		return nil, err
	}

	go func() {
		signal.WaitExit()
		if err := producer.Close(); err != nil {
			logs.Errorf("close producer error: %s", err.Error())
		}
	}()

	return &producerImpl{
		topic: topic,
		p:     producer,
	}, nil
}

func (r *producerImpl) Send(ctx context.Context, body []byte) error {
	msg := &sarama.ProducerMessage{
		Topic: r.topic,
		Value: sarama.ByteEncoder(body),
	}
	// 发送消息
	partition, offset, err := r.p.SendMessage(msg)
	if err != nil {
		return err
	}

	logs.Debugf("send message success partition:%d, offset:%d", partition, offset)
	return nil
}

func (r *producerImpl) BatchSend(ctx context.Context, bodyArr [][]byte) error {
	var msgArr []*sarama.ProducerMessage
	for _, body := range bodyArr {
		msgArr = append(msgArr, &sarama.ProducerMessage{
			Topic: r.topic,
			Value: sarama.ByteEncoder(body),
		})
	}

	err := r.p.SendMessages(msgArr)
	if err != nil {
		return err
	}

	return nil
}
