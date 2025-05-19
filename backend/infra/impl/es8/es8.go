package es8

import (
	"os"

	"code.byted.org/flow/opencoze/backend/infra/contract/es8"

	"github.com/elastic/go-elasticsearch/v8"
)

type Client = es8.Client

func New() (*es8.Client, error) {
	esAddr := os.Getenv("ES_ADDR")
	esClient, err := elasticsearch.NewTypedClient(elasticsearch.Config{
		Addresses: []string{esAddr},
	})
	if err != nil {
		return nil, err
	}

	return esClient, nil
}
