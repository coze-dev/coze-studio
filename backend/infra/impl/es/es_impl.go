package es

import (
	"fmt"
	"os"

	"code.byted.org/flow/opencoze/backend/infra/contract/es"
)

type (
	Client          = es.Client
	Types           = es.Types
	BulkIndexer     = es.BulkIndexer
	BulkIndexerItem = es.BulkIndexerItem
	BoolQuery       = es.BoolQuery
	Query           = es.Query
	Response        = es.Response
	Request         = es.Request
)

func New() (Client, error) {
	v := os.Getenv("ES_VERSION")
	if v == "v8" {
		return newES8()
	} else if v == "v7" {
		return newES7()
	}

	return nil, fmt.Errorf("unsupported es version %s", v)
}
