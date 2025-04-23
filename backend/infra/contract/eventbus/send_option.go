package eventbus

type SendOpt func(option *SendOption)

type SendOption struct {
	ShardingKey *string
}

func WithShardingKey(key string) SendOpt {
	return func(o *SendOption) {
		o.ShardingKey = &key
	}
}
