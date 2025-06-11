package checkpoint

import (
	"context"
	"sync"

	"github.com/cloudwego/eino/compose"
)

type inMemoryStore struct {
	m  map[string][]byte
	mu sync.RWMutex
}

func (i *inMemoryStore) Get(_ context.Context, checkPointID string) ([]byte, bool, error) {
	i.mu.RLock()
	v, ok := i.m[checkPointID]
	i.mu.RUnlock()
	return v, ok, nil
}

func (i *inMemoryStore) Set(_ context.Context, checkPointID string, checkPoint []byte) error {
	i.mu.Lock()
	i.m[checkPointID] = checkPoint
	i.mu.Unlock()
	return nil
}

func NewInMemoryStore() compose.CheckPointStore {
	return &inMemoryStore{
		m: make(map[string][]byte),
	}
}
