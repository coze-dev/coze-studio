package tcc

import (
	"context"

	"code.byted.org/flow/opencoze/backend/infra/contract/config"
	"code.byted.org/gopkg/tccclient"
)

// TODO: below impl only for test, remove before opensource

type ProviderOption func(cfg *tccclient.ConfigV2)

type Provider struct {
	cfg *tccclient.ConfigV2
}

func (p *Provider) Initialize(ctx context.Context, serviceName, confSpace string, opts ...any) (config.DynamicClient, error) {
	conf := p.cfg
	if conf == nil {
		conf = tccclient.NewConfigV2()
	}

	if confSpace != "" {
		conf.Confspace = confSpace
	}

	for _, opt := range opts {
		if o, ok := opt.(ProviderOption); ok {
			o(conf)
		}
	}

	cli, err := tccclient.NewClientV2(serviceName, conf)
	if err != nil {
		return nil, err
	}

	return &client{cli}, nil
}

// 另外一种写法可以把 init 参数清理掉
//func NewProvider(conf *tccclient.ConfigV2) config.Provider {
//	return &Provider{cfg: conf}
//}
