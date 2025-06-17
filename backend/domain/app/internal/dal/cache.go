package dal

import (
	"context"
	"errors"
	"time"

	redisV9 "github.com/redis/go-redis/v9"

	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type AppCache struct {
	cacheCli *redisV9.Client
}

func NewAppCache(cacheCli *redisV9.Client) *AppCache {
	return &AppCache{
		cacheCli: cacheCli,
	}
}

func (a *AppCache) Get(ctx context.Context, key string) (value string, exist bool, err error) {
	cmd := a.cacheCli.Get(ctx, key)
	if cmd.Err() != nil {
		if errors.Is(cmd.Err(), redisV9.Nil) {
			return "", false, nil
		}
		return "", false, cmd.Err()
	}

	return cmd.Val(), true, nil
}

func (a *AppCache) Set(ctx context.Context, key string, value string, expiration *time.Duration) (err error) {
	_expiration := ptr.FromOrDefault(expiration, 0)

	cmd := a.cacheCli.Set(ctx, key, value, _expiration)

	return cmd.Err()
}
