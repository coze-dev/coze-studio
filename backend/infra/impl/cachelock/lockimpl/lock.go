package lockimpl

import (
	"context"
	"strconv"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cachelock"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type cacheLocker struct {
	cache      cache.Cmdable
	Expiration time.Duration
}

func NewCacheLocker(c cache.Cmdable, timeout int64) *cacheLocker {
	return &cacheLocker{
		cache:      c,
		Expiration: time.Duration(timeout) * time.Second,
	}
}

type cacheLockResult struct {
	origin  cachelock.Locker
	lockVal int64
	lockKey string
	locked  bool
	ctx     context.Context
	cancel  context.CancelFunc
	err     error
}

func (locker *cacheLockResult) ReleaseLock() error {
	if !locker.locked && locker.err == nil {
		return nil
	}
	if locker.cancel != nil {
		locker.cancel()
	}
	return releaseLock(locker.ctx, locker.origin.GetCacheClient(), locker.lockKey, locker.lockVal)
}
func (locker *cacheLockResult) GetLockVal() int64 {
	if locker.locked {
		return locker.lockVal
	}
	return 0
}
func (locker *cacheLockResult) GetLockErr() error {
	if locker.err != nil {
		return locker.err
	}
	return nil
}
func (locker *cacheLocker) GetLock(ctx context.Context, key string) (bool, cachelock.LockResult) {
	lockVal := time.Now().UnixNano()
	lock, err := locker.cache.SetNX(ctx, key, lockVal, locker.Expiration).Result()
	return locker.buildLockResult(ctx, key, lockVal, lock, err)
}

func (locker *cacheLocker) Renewal(ctx context.Context, key string) error {
	_, err := locker.cache.Expire(ctx, key, locker.Expiration).Result()
	if err != nil {
		return err
	}
	return nil
}

func (locker *cacheLocker) Expire() time.Duration {
	return locker.Expiration
}

func (locker *cacheLocker) buildLockResult(ctx context.Context, key string, lockVal int64, locked bool, err error) (bool, *cacheLockResult) {
	lockResult := cacheLockResult{
		origin:  locker,
		lockVal: lockVal,
		lockKey: key,
		locked:  locked,
		err:     err,
		ctx:     ctx,
	}
	if err != nil {
		lockResult.locked = false
	}
	if lockResult.locked {
		ctx, cancel := context.WithCancel(ctx)
		lockResult.cancel = cancel
		lockResult.ctx = ctx
		lockResult.watchDog()
	}
	return lockResult.locked, &lockResult
}

func (locker *cacheLockResult) watchDog() {
	ticker := time.NewTicker(locker.origin.Expire() / 3)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-locker.ctx.Done():
				return
			case <-ticker.C:
				if !locker.locked {
					return
				}
				err := locker.origin.Renewal(locker.ctx, locker.lockKey)
				if err != nil {
					logs.CtxErrorf(locker.ctx, "watch dog renewal lock failed, err = %v", err)
					continue
				}
			}
		}
	}()
}

func (locker *cacheLocker) GetCacheClient() cache.Cmdable {
	return locker.cache
}
func releaseLock(ctx context.Context, cache cache.Cmdable, key string, lockVal int64) error {
	token, err := cache.Get(ctx, key).Result()
	if err != nil { // 弱依赖
		logs.CtxErrorf(ctx, "get lock key(%s) value failed, err = %v", key, err)
	}
	if err == nil && token != strconv.FormatInt(lockVal, 10) { // 说明已经被其他实例修改了，这里直接 return
		logs.CtxErrorf(ctx, "lock key = %s token changed, lock token = %s , new token = %s",
			key, strconv.FormatInt(lockVal, 10), token)
		return nil
	}
	_, err = cache.Del(ctx, key).Result() // 删除
	if err != nil {
		// 删除失败，就等 key 自然过期了
		logs.CtxErrorf(ctx, "delete lock key(%s)  failed, err = %v", key, err)
	}

	logs.CtxInfof(ctx, "delete lock key(%s) success ", key)
	return nil
}
