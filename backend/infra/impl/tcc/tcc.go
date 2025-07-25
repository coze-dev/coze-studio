package tcc

import (
	"context"
	"encoding/json"
	"errors"

	"code.byted.org/gopkg/logs"
	"code.byted.org/gopkg/tccclient/v3"
	tccclientV3 "code.byted.org/gopkg/tccclient/v3"
)

var (
	tccClient *tccclientV3.ClientV3
)

// clientV3 为全局变量，只在服务启动时初始化一次
func InitTCCClient() error {
	var err error
	tccClient, err = tccclientV3.NewClientV3("tiktok.pns.data_infra")
	if err != nil {
		return err
	}

	return nil
}

// Client 获取tcc client
func Client() *tccclientV3.ClientV3 {
	if tccClient == nil {
		err := InitTCCClient()
		if err != nil {
			panic(err)
		}
	}
	return tccClient
}

// GetConfigByKey 获取tcc配置
func GetConfigByKey[T any](ctx context.Context, v3 *tccclient.ClientV3, key string) (T, error) {
	var t T
	if v3 == nil {
		logs.CtxError(ctx, "[GetTCConfV3] v3 is nil")
		return t, errors.New("tcc v3 client is nil")
	}
	// 使用Getter API可以安全，便捷的获取解析+缓存的值对象
	getter := v3.NewGetter("/default", key, json.Unmarshal, t)
	inf, err := getter(ctx)
	if err != nil {
		logs.CtxError(ctx, "[GetTCConfV3] get key error, key:%s, err:%v", key, err)
		if err, ok := err.(tccclient.ErrFallbackDefault); ok {
			// 如果你连零值都无法接受，panic是唯一的做法
			panic(err)
		}
	}
	return inf.(T), nil
}
