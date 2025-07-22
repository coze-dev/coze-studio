package builtin

import (
	"context"
	"errors"
	"fmt"

	"sync"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/repository"
	"gorm.io/gorm"
)

// fetcherManager 实现
type fetcherManager struct {
	mu       sync.RWMutex
	authDao  repository.AuthRepo
	fetchers map[dataconnector.ConnectorID]dataconnector.Fetcher
}

// NewFetcherManager 构造函数
func NewFetcherManager(db *gorm.DB) dataconnector.FetcherManager {
	return &fetcherManager{
		authDao:  repository.NewAuthDAO(db),
		fetchers: make(map[dataconnector.ConnectorID]dataconnector.Fetcher),
	}
}
func (m *fetcherManager) Register(cid dataconnector.ConnectorID, fetcher dataconnector.Fetcher) error {
	if fetcher == nil {
		return errors.New("fetcher cannot be nil")
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.fetchers[cid]; exists {
		return fmt.Errorf("fetcher with ID %v already registered", cid)
	}

	m.fetchers[cid] = fetcher
	return nil
}

func (m *fetcherManager) Get(cid dataconnector.ConnectorID) (dataconnector.Fetcher, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	fetcher, exists := m.fetchers[cid]
	if !exists {
		return nil, fmt.Errorf("fetcher %v not found", cid)
	}

	return fetcher, nil
}

func (m *fetcherManager) List() map[dataconnector.ConnectorID]dataconnector.Fetcher {
	m.mu.RLock()
	defer m.mu.RUnlock()

	// 返回副本避免外部修改
	copy := make(map[dataconnector.ConnectorID]dataconnector.Fetcher, len(m.fetchers))
	for k, v := range m.fetchers {
		copy[k] = v
	}
	return copy
}

func (m *fetcherManager) Unregister(cid dataconnector.ConnectorID) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.fetchers[cid]; !exists {
		return fmt.Errorf("fetcher %v not registered", cid)
	}

	delete(m.fetchers, cid)
	return nil
}

func (m *fetcherManager) GetByAuthID(ctx context.Context, authID int64) (dataconnector.Fetcher, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	auth, err := m.authDao.GetAuthByID(ctx, authID)
	if err != nil {
		return nil, err
	}

	fetcher, exists := m.fetchers[dataconnector.ConnectorID(auth.ConnectorID)]
	if !exists {
		return nil, fmt.Errorf("fetcher not found")
	}

	return fetcher, nil
}
