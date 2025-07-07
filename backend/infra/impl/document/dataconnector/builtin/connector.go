package builtin

import (
	"sync"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
)

var (
	fetchersMu sync.RWMutex
	fetchers   = make(map[dataconnector.ConnectorID]dataconnector.Fetcher)
)

func Register(cid dataconnector.ConnectorID, fetcher dataconnector.Fetcher) {
	fetchersMu.Lock()
	defer fetchersMu.Unlock()

	if fetcher == nil {
		panic("authfetcher: Register fetcher is nil")
	}
	if _, dup := fetchers[cid]; dup {
		panic("authfetcher: Register called twice for fetcher ")
	}
	fetchers[cid] = fetcher
}

// Get 获取已注册的fetcher
func Get(cid dataconnector.ConnectorID) dataconnector.Fetcher {
	fetchersMu.RLock()
	defer fetchersMu.RUnlock()
	return fetchers[cid]
}
