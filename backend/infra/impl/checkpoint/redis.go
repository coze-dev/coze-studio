package checkpoint

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/cloudwego/eino/compose"
	"github.com/redis/go-redis/v9"
)

type redisStore struct {
	client *redis.Client
}

const (
	checkpointKeyTpl = "checkpoint_key:%s"
	checkpointExpire = 24 * 7 * 3600 * time.Second
)

func (r *redisStore) Get(ctx context.Context, checkPointID string) ([]byte, bool, error) {
	v, err := r.client.Get(ctx, fmt.Sprintf(checkpointKeyTpl, checkPointID)).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, false, nil
		}
		return nil, false, err
	}
	return v, true, nil
}

func (r *redisStore) Set(ctx context.Context, checkPointID string, checkPoint []byte) error {
	return r.client.Set(ctx, fmt.Sprintf(checkpointKeyTpl, checkPointID), checkPoint, checkpointExpire).Err()
}

func NewRedisStore(client *redis.Client) compose.CheckPointStore {
	return &redisStore{client: client}
}
