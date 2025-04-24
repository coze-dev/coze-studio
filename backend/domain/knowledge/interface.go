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
	MGetKnowledge(ctx context.Context, request *MGetKnowledgeRequest) ([]*entity.Knowledge, int64, error)
	ListKnowledge(ctx context.Context) // todo: 这个上移到 resource？

	CreateDocument(ctx context.Context, document []*entity.Document) ([]*entity.Document, error)
	UpdateDocument(ctx context.Context, document *entity.Document) (*entity.Document, error)
	DeleteDocument(ctx context.Context, document *entity.Document) (*entity.Document, error)
	ListDocument(ctx context.Context, request *ListDocumentRequest) (*ListDocumentResponse, error)
	MGetDocumentProgress(ctx context.Context, ids []int64) ([]*DocumentProgress, error)
	ResegmentDocument(ctx context.Context, request ResegmentDocumentRequest) (*entity.Document, error)
	GetTableSchema(ctx context.Context, request *GetTableSchemaRequest) (GetTableSchemaResponse, error)
	ValidateTableSchema(ctx context.Context, request *ValidateTableSchemaRequest) (ValidateTableSchemaResponse, error)
	GetDocumentTableInfo(ctx context.Context, request *GetDocumentTableInfoRequest) (GetDocumentTableInfoResponse, error)
	CreateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error)
	UpdateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error)
	DeleteSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error)
	ListSlice(ctx context.Context, request *ListSliceRequest) (*ListSliceResponse, error)

	Retrieve(ctx context.Context, req *RetrieveRequest) ([]*RetrieveSlice, error)
}

type MGetKnowledgeRequest struct {
	IDs        []int64
	SpaceID    *int64
	ProjectID  *string
	Name       *string // 完全匹配
	Status     []int32
	UserID     *int64
	Query      *string // 模糊匹配
	Page       *int
	PageSize   *int
	Order      *Order
	OrderType  *OrderType
	FormatType *int64
}
type OrderType int32

const (
	OrderTypeAsc  OrderType = 1
	OrderTypeDesc OrderType = 2
)

type Order int32

const (
	OrderCreatedAt Order = 1
	OrderUpdatedAt Order = 2
)

type ListDocumentRequest struct {
	KnowledgeID int64
	DocumentIDs []int64
	Page        *int32
	PageSize    *int32
	Name        string
	Limit       int
	Cursor      *string
}

type ListDocumentResponse struct {
	Documents  []*entity.Document
	Total      int64
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
	KnowledgeID int64
	DocumentID  int64
	Keyword     *string
	Sequence    *int64
	PageNo      int64
	PageSize    int64
	Limit       int
	Cursor      *string
}

type ListSliceResponse struct {
	Slices     []*entity.Slice
	Total      int
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
	Ctx              context.Context
	OriginQuery      string                   // 原始 query
	RewrittenQuery   *string                  // 改写后的 query, 如果没有改写，就是 nil, 会在执行过程中添加上去
	ChatHistory      []*schema.Message        // 如果没有对话历史或者不需要历史，则为 nil
	KnowledgeIDs     sets.Set[int64]          // 本次检索涉及的知识库id
	KnowledgeInfoMap map[int64]*KnowledgeInfo // 知识库id到文档id的映射
	// 召回策略
	Strategy *entity.RetrievalStrategy
	// 检索涉及的 document 信息
	Documents []*model.KnowledgeDocument
}

type RetrieveSlice struct {
	Slice *entity.Slice
	Score float64
}
type KnowledgeInfo struct {
	DocumentIDs  []int64
	DocumentType entity.DocumentType
}
type GetTableSchemaRequest struct {
	DocumentID       int64             // knowledge document id
	TableSheet       entity.TableSheet // 表格信息
	TableDataType    TableDataType     // data Type
	OriginTableMeta  []*entity.TableColumn
	PreviewTableMeta []*entity.TableColumn
	SourceInfo       TableSourceInfo
}
type GetTableSchemaResponse struct {
	Code        int32
	Msg         string
	TableSheet  []*entity.TableSheet
	TableMeta   []*entity.TableColumn
	PreviewData []map[int64]string
}

type TableDataType int32

const (
	AllData     TableDataType = 0 // schema sheets 和 preview data
	OnlySchema  TableDataType = 1 // 只需要 schema 结构 & Sheets
	OnlyPreview TableDataType = 2 // 只需要 preview data
)

type GetDocumentTableInfoRequest struct {
	DocumentID int64
	SourceInfo TableSourceInfo
}

type GetDocumentTableInfoResponse struct {
	Code        int32
	Msg         string
	TableSheet  []*entity.TableSheet
	TableMeta   map[int64][]*entity.TableColumn
	PreviewData map[int64][]map[int64]string
}

type TableSourceInfo struct {
	Uri           string
	FileBase64    *string
	FileType      *string
	CustomContent *string
}

type ValidateTableSchemaRequest struct {
	DocumentID int64
	SourceInfo TableSourceInfo
	TableSheet *entity.TableSheet
}

type ValidateTableSchemaResponse struct {
	ColumnValidResult map[string]string
}
