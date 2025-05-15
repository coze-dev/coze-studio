package dal

import (
	"context"
	"strconv"

	"github.com/redis/go-redis/v9"

	"code.byted.org/flow/opencoze/backend/pkg/errorx"
)

func NewCountRepo(cli *redis.Client) *CounterImpl {
	return &CounterImpl{
		cacheClient: cli,
	}
}

type CounterImpl struct {
	cacheClient *redis.Client
}

func (c *CounterImpl) Get(ctx context.Context, key string) (int64, error) {
	val, err := c.cacheClient.Get(ctx, key).Result()
	if err == redis.Nil {
		return 0, nil
	}
	if err != nil {
		return 0, errorx.Wrapf(err, "failed to get count for %s", key)
	}

	return strconv.ParseInt(val, 10, 64)
}

func (c *CounterImpl) IncrBy(ctx context.Context, key string, incr int64) error {
	_, err := c.cacheClient.IncrBy(ctx, key, incr).Result()
	return errorx.Wrapf(err, "failed to incr_by count for %s", key)
}

func (c *CounterImpl) Set(ctx context.Context, key string, value int64) error {
	_, err := c.cacheClient.Set(ctx, key, value, 0).Result()
	return errorx.Wrapf(err, "failed to set count for %s", key)
}

func (c *CounterImpl) Del(ctx context.Context, key string) error {
	_, err := c.cacheClient.Del(ctx, key).Result()
	return errorx.Wrapf(err, "failed to del count for %s", key)
}
