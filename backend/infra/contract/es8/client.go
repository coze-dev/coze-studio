package es8

import (
	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/bulk"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/delete"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/get"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/index"
	"github.com/elastic/go-elasticsearch/v8/typedapi/core/search"
)

// Client defines the interface for Elasticsearch operations
type Client interface {
	Index(index string) *index.Index
	BulkIndex(index string) *bulk.Bulk
	Search() *search.Search
	Get(index, id string) *get.Get
	Delete(index, id string) *delete.Delete
}

func New(cfg elasticsearch.Config) (Client, error) {
	cli, err := elasticsearch.NewTypedClient(cfg)
	if err != nil {
		return nil, err
	}
	return &esClient{cli: cli}, nil
}

type esClient struct {
	cli *elasticsearch.TypedClient
}

func (e *esClient) Delete(index, id string) *delete.Delete {
	return e.cli.Delete(index, id)
}

func (e *esClient) BulkIndex(index string) *bulk.Bulk {
	return e.cli.Bulk().Index(index)
}

func (e *esClient) Search() *search.Search {
	return e.cli.Search()
}

func (e *esClient) Get(index, id string) *get.Get {
	return e.cli.Get(index, id)
}

func (e *esClient) Index(index string) *index.Index {
	return e.cli.Index(index)
}
