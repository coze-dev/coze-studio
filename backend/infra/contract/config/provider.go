package config

import "context"

//  zookeeper, etcd, nacos

type Provider interface {
	Initialize(ctx context.Context, namespace, group string, opts ...Option) (DynamicClient, error)
}

type DynamicClient interface {
	AddListener(key string, callback func(value string, err error)) error
	RemoveListener(key string) error
	Get(ctx context.Context, key string) (string, error)
}

type options struct{}

type Option struct {
	apply func(opts *options)

	implSpecificOptFn any
}
