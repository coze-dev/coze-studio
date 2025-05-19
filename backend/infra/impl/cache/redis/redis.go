package redis

import (
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type Client = redis.Client

func New() *redis.Client {
	addr := os.Getenv("REDIS_ADDR")
	rdb := redis.NewClient(&redis.Options{
		Addr: addr, // Redis地址
		DB:   0,    // 默认数据库
		// 连接池配置
		PoolSize:        100,             // 最大连接数（建议设置为CPU核心数*10）
		MinIdleConns:    10,              // 最小空闲连接
		MaxIdleConns:    30,              // 最大空闲连接
		ConnMaxIdleTime: 5 * time.Minute, // 空闲连接超时时间

		// 超时配置
		DialTimeout:  5 * time.Second, // 连接建立超时
		ReadTimeout:  3 * time.Second, // 读操作超时
		WriteTimeout: 3 * time.Second, // 写操作超时
	})

	return rdb
}
