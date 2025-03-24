package cache

import (
	"context"

	"github.com/redis/go-redis"
)

type Cmdable = redis.Cmdable

type Provider interface {
	Initialize(ctx context.Context) (Cmdable, error)
}
