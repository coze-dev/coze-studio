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
	"context"
	"fmt"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/embedding"
	"github.com/coze-dev/coze-studio/backend/infra/oceanbase"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ManagerConfig struct {
	Client    *oceanbase.OceanBaseClient
	Embedding embedding.Embedder
	BatchSize int

	EnableCache    bool
	CacheTTL       time.Duration
	MaxConnections int
	ConnTimeout    time.Duration

	EnableConnectionPool bool
	PoolMaxIdle          int
	PoolMaxLifetime      time.Duration
	QueryTimeout         time.Duration
	MaxRetries           int           // optional: default 3
	RetryDelay           time.Duration // optional: default 1s
}

// Create an OceanBase vector storage manager
func NewManager(config *ManagerConfig) (searchstore.Manager, error) {
	if config.Client == nil {
		return nil, fmt.Errorf("[NewManager] oceanbase client not provided")
	}
	if config.Embedding == nil {
		return nil, fmt.Errorf("[NewManager] oceanbase embedder not provided")
	}

	if config.BatchSize == 0 {
		config.BatchSize = defaultBatchSize
	}

	if config.CacheTTL == 0 {
		config.CacheTTL = 5 * time.Minute
	}
	if config.MaxConnections == 0 {
		config.MaxConnections = defaultMaxOpenConns
	}
	if config.ConnTimeout == 0 {
		config.ConnTimeout = 30 * time.Second
	}

	if config.PoolMaxIdle == 0 {
		config.PoolMaxIdle = 10
	}
	if config.PoolMaxLifetime == 0 {
		config.PoolMaxLifetime = 1 * time.Hour
	}
	if config.QueryTimeout == 0 {
		config.QueryTimeout = 30 * time.Second
	}
	if config.MaxRetries == 0 {
		config.MaxRetries = 3
	}
	if config.RetryDelay == 0 {
		config.RetryDelay = 1 * time.Second
	}

	manager := &oceanbaseManager{
		config: config,
		cache:  make(map[string]*cachedSearchStore),
		mu:     &sync.RWMutex{},
	}

	if config.EnableCache {
		go manager.startCacheCleaner()
	}

	ctx, cancel := context.WithTimeout(context.Background(), config.ConnTimeout)
	defer cancel()

	if err := config.Client.InitDatabase(ctx); err != nil {
		logs.CtxWarnf(ctx, "Failed to initialize OceanBase database: %v", err)
	}

	logs.CtxInfof(ctx, "Created OceanBase vector store manager with cache=%v, batchSize=%d, pool=%v",
		config.EnableCache, config.BatchSize, config.EnableConnectionPool)
	return manager, nil
}

type oceanbaseManager struct {
	config *ManagerConfig
	cache  map[string]*cachedSearchStore
	mu     *sync.RWMutex
}

// cachedSearchStore 缓存的搜索存储
type cachedSearchStore struct {
	store    searchstore.SearchStore
	lastUsed time.Time
}

func (m *oceanbaseManager) Create(ctx context.Context, req *searchstore.CreateRequest) error {
	if err := ValidateCollectionName(req.CollectionName); err != nil {
		return fmt.Errorf("[Create] invalid collection name: %w", err)
	}

	tableName := TableName(req.CollectionName)

	dimension := m.getVectorDimension()

	logs.CtxInfof(ctx, "[Create] Using dimension: %d for collection: %s", dimension, req.CollectionName)

	if err := m.config.Client.CreateCollection(ctx, req.CollectionName, dimension); err != nil {
		return fmt.Errorf("[Create] create vector collection failed: %w", err)
	}

	if err := m.recordCollection(ctx, req.CollectionName, tableName); err != nil {
		logs.CtxWarnf(ctx, "Failed to record collection: %v", err)
	}

	m.clearCache(req.CollectionName)

	logs.CtxInfof(ctx, "Created OceanBase collection: %s (table: %s)", req.CollectionName, tableName)
	return nil
}

func (m *oceanbaseManager) Drop(ctx context.Context, req *searchstore.DropRequest) error {
	if err := ValidateCollectionName(req.CollectionName); err != nil {
		return fmt.Errorf("[Drop] invalid collection name: %w", err)
	}

	tableName := TableName(req.CollectionName)

	if err := m.config.Client.DropCollection(ctx, req.CollectionName); err != nil {
		return fmt.Errorf("[Drop] drop collection failed: %w", err)
	}

	if err := m.removeCollection(ctx, req.CollectionName); err != nil {
		logs.CtxWarnf(ctx, "Failed to remove collection record: %v", err)
	}

	m.clearCache(req.CollectionName)

	logs.CtxInfof(ctx, "Deleted OceanBase collection: %s (table: %s)", req.CollectionName, tableName)
	return nil
}

func (m *oceanbaseManager) GetType() searchstore.SearchStoreType {
	return searchstore.TypeVectorStore
}

func (m *oceanbaseManager) GetSearchStore(ctx context.Context, collectionName string) (searchstore.SearchStore, error) {
	if err := ValidateCollectionName(collectionName); err != nil {
		return nil, fmt.Errorf("[GetSearchStore] invalid collection name: %w", err)
	}

	if m.config.EnableCache {
		if cached := m.getCachedStore(collectionName); cached != nil {
			return cached, nil
		}
	}

	store := &oceanbaseSearchStore{
		manager:        m,
		collectionName: collectionName,
		tableName:      TableName(collectionName),
	}

	if m.config.EnableCache {
		m.cacheStore(collectionName, store)
	}

	return store, nil
}

func (m *oceanbaseManager) recordCollection(ctx context.Context, collectionName, tableName string) error {
	// Create collections metadata table if not exists
	createTableSQL := `
		CREATE TABLE IF NOT EXISTS oceanbase_collections (
			collection_name VARCHAR(255) PRIMARY KEY,
			table_name VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			status ENUM('active', 'deleted') DEFAULT 'active'
		)`

	if err := m.config.Client.GetDB().WithContext(ctx).Exec(createTableSQL).Error; err != nil {
		return fmt.Errorf("failed to create collections metadata table: %w", err)
	}

	// Insert or update collection record
	upsertSQL := `
		INSERT INTO oceanbase_collections (collection_name, table_name, status)
		VALUES (?, ?, 'active')
		ON DUPLICATE KEY UPDATE
			table_name = VALUES(table_name),
			status = 'active',
			updated_at = CURRENT_TIMESTAMP`

	if err := m.config.Client.GetDB().WithContext(ctx).Exec(upsertSQL, collectionName, tableName).Error; err != nil {
		return fmt.Errorf("failed to record collection metadata: %w", err)
	}

	logs.CtxInfof(ctx, "Recorded collection: %s (table: %s)", collectionName, tableName)
	return nil
}

func (m *oceanbaseManager) removeCollection(ctx context.Context, collectionName string) error {
	// Soft delete collection record by setting status to 'deleted'
	updateSQL := `
		UPDATE oceanbase_collections
		SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
		WHERE collection_name = ?`

	if err := m.config.Client.GetDB().WithContext(ctx).Exec(updateSQL, collectionName).Error; err != nil {
		return fmt.Errorf("failed to remove collection metadata: %w", err)
	}

	logs.CtxInfof(ctx, "Removed collection record: %s", collectionName)
	return nil
}

func (m *oceanbaseManager) getCachedStore(collectionName string) searchstore.SearchStore {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if cached, exists := m.cache[collectionName]; exists {
		if time.Since(cached.lastUsed) < m.config.CacheTTL {
			cached.lastUsed = time.Now()
			return cached.store
		}
		delete(m.cache, collectionName)
	}
	return nil
}

func (m *oceanbaseManager) cacheStore(collectionName string, store searchstore.SearchStore) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.cache[collectionName] = &cachedSearchStore{
		store:    store,
		lastUsed: time.Now(),
	}
}

func (m *oceanbaseManager) clearCache(collectionName string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	delete(m.cache, collectionName)
}

func (m *oceanbaseManager) startCacheCleaner() {
	ticker := time.NewTicker(m.config.CacheTTL / 2)
	defer ticker.Stop()

	for range ticker.C {
		m.cleanExpiredCache()
	}
}

func (m *oceanbaseManager) cleanExpiredCache() {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now()
	for key, cached := range m.cache {
		if now.Sub(cached.lastUsed) > m.config.CacheTTL {
			delete(m.cache, key)
		}
	}
}

func (m *oceanbaseManager) getVectorDimension() int {
	embeddingType := os.Getenv("EMBEDDING_TYPE")

	logs.Infof("[getVectorDimension] EMBEDDING_TYPE: %s", embeddingType)

	switch embeddingType {
	case "ark":
		if dimStr := os.Getenv("ARK_EMBEDDING_DIMS"); dimStr != "" {
			if dim, err := strconv.Atoi(dimStr); err == nil {
				return dim
			}
		}
	case "openai":
		if dimStr := os.Getenv("OPENAI_EMBEDDING_DIMS"); dimStr != "" {
			if dim, err := strconv.Atoi(dimStr); err == nil {
				return dim
			}
		}
	case "ollama":
		if dimStr := os.Getenv("OLLAMA_EMBEDDING_DIMS"); dimStr != "" {
			if dim, err := strconv.Atoi(dimStr); err == nil {
				return dim
			}
		}
	case "http":
		if dimStr := os.Getenv("HTTP_EMBEDDING_DIMS"); dimStr != "" {
			if dim, err := strconv.Atoi(dimStr); err == nil {
				return dim
			}
		}
	case "gemini":
		if dimStr := os.Getenv("GEMINI_EMBEDDING_DIMS"); dimStr != "" {
			if dim, err := strconv.Atoi(dimStr); err == nil {
				return dim
			}
		}
	}

	if dimStr := os.Getenv("ARK_EMBEDDING_DIMS"); dimStr != "" {
		if dim, err := strconv.Atoi(dimStr); err == nil {
			return dim
		}
	}

	if dimStr := os.Getenv("OPENAI_EMBEDDING_DIMS"); dimStr != "" {
		if dim, err := strconv.Atoi(dimStr); err == nil {
			return dim
		}
	}

	if dimStr := os.Getenv("OLLAMA_EMBEDDING_DIMS"); dimStr != "" {
		if dim, err := strconv.Atoi(dimStr); err == nil {
			return dim
		}
	}

	if dimStr := os.Getenv("HTTP_EMBEDDING_DIMS"); dimStr != "" {
		if dim, err := strconv.Atoi(dimStr); err == nil {
			return dim
		}
	}

	if dimStr := os.Getenv("GEMINI_EMBEDDING_DIMS"); dimStr != "" {
		if dim, err := strconv.Atoi(dimStr); err == nil {
			return dim
		}
	}

	return 1024
}
