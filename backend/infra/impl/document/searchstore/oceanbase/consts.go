/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package oceanbase

import (
	"fmt"
	"time"
)

const (
	defaultBatchSize                   = 100
	defaultTopK                        = 10
	defaultVectorDimension             = 2048
	defaultVectorMemoryLimitPercentage = 30
	defaultMaxOpenConns                = 100
	defaultMaxIdleConns                = 10
	defaultConnMaxLifetime             = 3600
	defaultConnMaxIdleTime             = 1800
	defaultCacheTTL                    = 300
	defaultConnTimeout                 = 30
	defaultMaxRetries                  = 3
	defaultRetryDelay                  = 1
	maxVectorDimension                 = 4096
	maxCollectionNameLength            = 255
	maxSQLIdentifierLength             = 64
	maxContentLength                   = 65535
	maxBatchSize                       = 1000

	enableCacheDefault        = true
	enableMetricsDefault      = true
	enableSlowQueryLogDefault = true
	slowQueryThreshold        = 1000

	ErrCodeInvalidConfig           = "INVALID_CONFIG"
	ErrCodeConnectionFailed        = "CONNECTION_FAILED"
	ErrCodeQueryTimeout            = "QUERY_TIMEOUT"
	ErrCodeVectorDimensionMismatch = "VECTOR_DIMENSION_MISMATCH"
	ErrCodeCollectionNotFound      = "COLLECTION_NOT_FOUND"
	ErrCodeDuplicateCollection     = "DUPLICATE_COLLECTION"
)

type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	Database string

	VectorDimension             int
	MetricType                  string
	MaxOpenConns                int
	MaxIdleConns                int
	ConnMaxLifetime             time.Duration
	ConnMaxIdleTime             time.Duration
	VectorMemoryLimitPercentage int
	BatchSize                   int

	EnableCache        bool
	CacheTTL           time.Duration
	EnableMetrics      bool
	EnableSlowQueryLog bool
	MaxRetries         int
	RetryDelay         time.Duration
	ConnTimeout        time.Duration
}

func DefaultConfig() *Config {
	return &Config{
		Host:                        getEnv("OCEANBASE_HOST", "localhost"),
		Port:                        getEnvAsInt("OCEANBASE_PORT", 2881),
		User:                        getEnv("OCEANBASE_USER", "root"),
		Password:                    getEnv("OCEANBASE_PASSWORD", ""),
		Database:                    getEnv("OCEANBASE_DATABASE", "test"),
		VectorDimension:             getVectorDimension(),
		MetricType:                  "cosine",
		MaxOpenConns:                getEnvAsInt("OCEANBASE_MAX_OPEN_CONNS", defaultMaxOpenConns),
		MaxIdleConns:                getEnvAsInt("OCEANBASE_MAX_IDLE_CONNS", defaultMaxIdleConns),
		ConnMaxLifetime:             time.Duration(getEnvAsInt("OCEANBASE_CONN_MAX_LIFETIME", defaultConnMaxLifetime)) * time.Second,
		ConnMaxIdleTime:             time.Duration(getEnvAsInt("OCEANBASE_CONN_MAX_IDLE_TIME", defaultConnMaxIdleTime)) * time.Second,
		VectorMemoryLimitPercentage: getEnvAsInt("OCEANBASE_VECTOR_MEMORY_LIMIT_PERCENTAGE", defaultVectorMemoryLimitPercentage),
		BatchSize:                   getEnvAsInt("OCEANBASE_BATCH_SIZE", defaultBatchSize),
		EnableCache:                 getEnvAsBool("OCEANBASE_ENABLE_CACHE", enableCacheDefault),
		CacheTTL:                    time.Duration(getEnvAsInt("OCEANBASE_CACHE_TTL", defaultCacheTTL)) * time.Second,
		EnableMetrics:               getEnvAsBool("OCEANBASE_ENABLE_METRICS", enableMetricsDefault),
		EnableSlowQueryLog:          getEnvAsBool("OCEANBASE_ENABLE_SLOW_QUERY_LOG", enableSlowQueryLogDefault),
		MaxRetries:                  getEnvAsInt("OCEANBASE_MAX_RETRIES", defaultMaxRetries),
		RetryDelay:                  time.Duration(getEnvAsInt("OCEANBASE_RETRY_DELAY", defaultRetryDelay)) * time.Second,
		ConnTimeout:                 time.Duration(getEnvAsInt("OCEANBASE_CONN_TIMEOUT", defaultConnTimeout)) * time.Second,
	}
}

func (c *Config) Validate() error {
	if c.Host == "" {
		return fmt.Errorf("host cannot be empty")
	}
	if c.Port <= 0 || c.Port > 65535 {
		return fmt.Errorf("port must be between 1 and 65535")
	}
	if c.User == "" {
		return fmt.Errorf("user cannot be empty")
	}
	if c.Database == "" {
		return fmt.Errorf("database cannot be empty")
	}
	if c.VectorDimension <= 0 || c.VectorDimension > maxVectorDimension {
		return fmt.Errorf("vector dimension must be between 1 and %d", maxVectorDimension)
	}
	if c.BatchSize <= 0 || c.BatchSize > maxBatchSize {
		return fmt.Errorf("batch size must be between 1 and %d", maxBatchSize)
	}
	if c.MaxOpenConns <= 0 {
		return fmt.Errorf("max open connections must be positive")
	}
	if c.MaxIdleConns <= 0 || c.MaxIdleConns > c.MaxOpenConns {
		return fmt.Errorf("max idle connections must be positive and not greater than max open connections")
	}
	if c.CacheTTL <= 0 {
		return fmt.Errorf("cache TTL must be positive")
	}
	if c.MaxRetries < 0 {
		return fmt.Errorf("max retries cannot be negative")
	}
	if c.RetryDelay < 0 {
		return fmt.Errorf("retry delay cannot be negative")
	}
	if c.ConnTimeout <= 0 {
		return fmt.Errorf("connection timeout must be positive")
	}
	return nil
}

func getVectorDimension() int {
	if dims := getEnvAsInt("ARK_EMBEDDING_DIMS", 0); dims > 0 {
		return dims
	}
	if dims := getEnvAsInt("OPENAI_EMBEDDING_DIMS", 0); dims > 0 {
		return dims
	}
	return defaultVectorDimension
}
