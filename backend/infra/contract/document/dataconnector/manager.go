package dataconnector

type FetcherManager interface {
	Register(cid ConnectorID, fetcher Fetcher) error
	Get(cid ConnectorID) (Fetcher, error)
	List() map[ConnectorID]Fetcher
	Unregister(cid ConnectorID) error
}
