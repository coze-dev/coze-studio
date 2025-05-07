package es8

import (
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"

	"os"

	"github.com/elastic/go-elasticsearch/v8"
)

func NewElasticSearch() (*es8.Client, error) {
	esAddr := os.Getenv("ES_ADDR")
	esClient, err := elasticsearch.NewTypedClient(elasticsearch.Config{
		Addresses: []string{esAddr},
	})
	if err != nil {
		return nil, err
	}

	return esClient, nil
}
