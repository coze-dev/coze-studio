package dal

import (
	"context"
	"errors"
	"time"

	redisV9 "github.com/redis/go-redis/v9"

	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type OAuthCache struct {
	cacheCli *redisV9.Client
}

func NewOAuthCache(cacheCli *redisV9.Client) *OAuthCache {
	return &OAuthCache{
		cacheCli: cacheCli,
	}
}

func (o *OAuthCache) Get(ctx context.Context, key string) (value string, exist bool, err error) {
	cmd := o.cacheCli.Get(ctx, key)
	if cmd.Err() != nil {
		if errors.Is(cmd.Err(), redisV9.Nil) {
			return "", false, nil
		}
		return "", false, cmd.Err()
	}

	return cmd.Val(), true, nil
}

func (o *OAuthCache) Set(ctx context.Context, key string, value string, expiration *time.Duration) (err error) {
	_expiration := ptr.FromOrDefault(expiration, 0)

	cmd := o.cacheCli.Set(ctx, key, value, _expiration)

	return cmd.Err()
}
