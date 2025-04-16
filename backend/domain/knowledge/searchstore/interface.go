package searchstore

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

type SearchStore interface {
	// Create init collection and index
	Create(ctx context.Context, document *entity.Document) error
	// Drop removes collection and index
	Drop(ctx context.Context, knowledgeID int64) error
	// Store upsert data
	Store(ctx context.Context, req *StoreRequest) error
	// Delete delete data
	Delete(ctx context.Context, knowledgeID int64, slicesIDs []int64) error
	// Retrieve search data
	Retrieve(ctx context.Context, req *RetrieveRequest) ([]*knowledge.RetrieveSlice, error)
	// GetType get search engine type
	GetType() Type
}

type StoreRequest struct {
	KnowledgeID  int64
	DocumentID   int64
	DocumentType entity.DocumentType
	Slices       []*entity.Slice
	CreatorID    int64
	// 表格需要将 table schema 一起传入
	TableSchema []*entity.TableColumn
}

type RetrieveRequest struct {
	KnowledgeInfoMap map[int64]*knowledge.KnowledgeInfo
	Query            string

	TopK      *int64
	MinScore  *float64
	CreatorID *int64
	FilterDSL map[string]interface{}
}
