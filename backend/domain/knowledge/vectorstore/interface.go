package vectorstore

import (
	"context"

	"github.com/cloudwego/eino/components/indexer"
	"github.com/cloudwego/eino/components/retriever"
)

type VectorStore interface {
	indexer.Indexer // 暂定 store = insert + upsert
	retriever.Retriever

	// Create init collection and index
	Create(ctx context.Context) error
	// Drop removes collection and index
	Drop(ctx context.Context) error
	// Delete deletes data
	Delete(ctx context.Context, ids []string) error
}
