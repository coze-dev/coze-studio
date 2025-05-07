package eventbus

type ConsumerOpt func(option *ConsumerOption)

type ConsumerOption struct {
	Orderly *bool
	// ConsumeFromWhere
}

func WithConsumerOrderly(orderly bool) ConsumerOpt {
	return func(option *ConsumerOption) {
		option.Orderly = &orderly
	}
}
