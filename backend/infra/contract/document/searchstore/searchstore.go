package searchstore

import (
	"context"

	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"
)

type SearchStore interface {
	indexer.Indexer

	retriever.Retriever

	Delete(ctx context.Context, ids []string) error
}

// document indexing
const (
	MetaDataKeyCreatorID       = "creator_id"       // val: int64
	MetaDataKeyExternalStorage = "external_storage" // val: map[string]any
)
