package checkpoint

import (
	"context"

	"github.com/cloudwego/eino/compose"
)

type inMemoryStore struct {
	m map[string][]byte
}

func (i *inMemoryStore) Get(_ context.Context, checkPointID string) ([]byte, bool, error) {
	v, ok := i.m[checkPointID]
	return v, ok, nil
}

func (i *inMemoryStore) Set(_ context.Context, checkPointID string, checkPoint []byte) error {
	i.m[checkPointID] = checkPoint
	return nil
}

var checkpointStoreInstance compose.CheckPointStore

func init() {
	checkpointStoreInstance = &inMemoryStore{
		m: make(map[string][]byte),
	}
}

func GetStore() compose.CheckPointStore {
	return checkpointStoreInstance
}
