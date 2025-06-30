package es

import (
	"context"
)

type Client interface {
	Create(ctx context.Context, index, id string, document any) error
	Update(ctx context.Context, index, id string, document any) error
	Delete(ctx context.Context, index, id string) error
	Search(ctx context.Context, index string, req *Request) (*Response, error)
	Exists(ctx context.Context, index string) (bool, error)
	CreateIndex(ctx context.Context, index string, properties map[string]any) error
	DeleteIndex(ctx context.Context, index string) error
	Types() Types
	NewBulkIndexer(index string) (BulkIndexer, error)
}

type Types interface {
	NewLongNumberProperty() any
	NewTextProperty() any
	NewUnsignedLongNumberProperty() any
}

type BulkIndexer interface {
	Add(ctx context.Context, item BulkIndexerItem) error
	Close(ctx context.Context) error
}
