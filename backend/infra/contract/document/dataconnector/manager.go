package dataconnector

import "context"

type FetcherManager interface {
	Register(cid ConnectorID, fetcher Fetcher) error
	Get(cid ConnectorID) (Fetcher, error)
	GetByAuthID(ctx context.Context, authID int64) (Fetcher, error)
	List() map[ConnectorID]Fetcher
	Unregister(cid ConnectorID) error
}
