package cachelock

import (
	"context"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
)

type LockResult interface {
	ReleaseLock() error
	GetLockVal() int64
	GetLockErr() error
}

type Locker interface {
	GetLock(ctx context.Context, key string) (bool, LockResult)
	Renewal(ctx context.Context, key string) error
	Expire() time.Duration
	GetCacheClient() cache.Cmdable
}
