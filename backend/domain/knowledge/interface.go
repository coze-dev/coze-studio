package knowledge

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/pkg/lang/sets"
)

type Knowledge interface {
	CreateKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error)
	UpdateKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error)
	DeleteKnowledge(ctx context.Context, knowledge *entity.Knowledge) (*entity.Knowledge, error)
	CopyKnowledge(ctx context.Context) // todo: 跨空间拷贝，看下功能是否要支持
	MGetKnowledge(ctx context.Context, ids []int64) ([]*entity.Knowledge, error)
	ListKnowledge(ctx context.Context) // todo: 这个上移到 resource？

	CreateDocument(ctx context.Context, document *entity.Document) (*entity.Document, error)
	UpdateDocument(ctx context.Context, document *entity.Document) (*entity.Document, error)
	DeleteDocument(ctx context.Context, document *entity.Document) (*entity.Document, error)
	ListDocument(ctx context.Context, request *ListDocumentRequest) (*ListDocumentResponse, error)
	MGetDocumentProgress(ctx context.Context, ids []int64) ([]*DocumentProgress, error)
	ResegmentDocument(ctx context.Context, request ResegmentDocumentRequest) error
	GetTableSchema(ctx context.Context, id int64) ([]*entity.TableColumn, error)

	CreateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error)
	UpdateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error)
	DeleteSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error)
	ListSlice(ctx context.Context, request *ListSliceRequest) (*ListSliceResponse, error)

	Retrieve(ctx context.Context, req *RetrieveRequest) ([]*RetrieveSlice, error)
}

type ListDocumentRequest struct {
	KnowledgeID int64
	Name        string
	Limit       int
	Cursor      *string
}

type ListDocumentResponse struct {
	Documents  []*entity.Document
	HasMore    bool
	NextCursor *string
}

type DocumentProgress struct {
	ID           int64
	Name         string
	Size         int64
	Type         string
	Progress     int
	Status       entity.DocumentStatus
	StatusMsg    string
	RemainingSec int64
}

type ResegmentDocumentRequest struct {
	ID               int64
	ParsingStrategy  *entity.ParsingStrategy
	ChunkingStrategy *entity.ChunkingStrategy
}

type ListSliceRequest struct {
	DocumentID int64
	Limit      int
	Cursor     *string
}

type ListSliceResponse struct {
	Slices     []*entity.Slice
	HasMore    bool
	NextCursor *string
}

type RetrieveRequest struct {
	Query       string
	ChatHistory []*schema.Message

	// 从指定的知识库和文档中召回
	KnowledgeIDs []int64
	DocumentIDs  []int64 // todo: 确认下这个场景

	// 召回策略
	Strategy *entity.RetrievalStrategy
}

type RetrieveContext struct {
	Ctx            context.Context
	OriginQuery    string            // 原始 query
	RewrittenQuery *string           // 改写后的 query, 如果没有改写，就是 nil, 会在执行过程中添加上去
	ChatHistory    []*schema.Message // 如果没有对话历史或者不需要历史，则为 nil
	KnowledgeIDs   sets.Set[int64]   // 本次检索涉及的知识库id
	// 召回策略
	Strategy *entity.RetrievalStrategy
	// 检索涉及的 document 信息
	Documents []*model.KnowledgeDocument
}

type RetrieveSlice struct {
	Slice *entity.Slice
	Score float64
}
