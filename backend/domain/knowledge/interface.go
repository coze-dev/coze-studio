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

	CreateDocument(ctx context.Context, document []*entity.Document) ([]*entity.Document, error)
	UpdateDocument(ctx context.Context, document *entity.Document) (*entity.Document, error)
	DeleteDocument(ctx context.Context, document *entity.Document) (*entity.Document, error)
	ListDocument(ctx context.Context, request *ListDocumentRequest) (*ListDocumentResponse, error)
	MGetDocumentProgress(ctx context.Context, ids []int64) ([]*DocumentProgress, error)
	ResegmentDocument(ctx context.Context, request ResegmentDocumentRequest) (*entity.Document, error)
	GetAlterTableSchema(ctx context.Context, req *AlterTableSchemaRequest) (*TableSchemaResponse, error)
	ValidateTableSchema(ctx context.Context, request *ValidateTableSchemaRequest) (*ValidateTableSchemaResponse, error)
	GetDocumentTableInfo(ctx context.Context, request *GetDocumentTableInfoRequest) (*GetDocumentTableInfoResponse, error) // todo: 这个接口是否还有必要保留？
	GetImportDataTableSchema(ctx context.Context, req *ImportDataTableSchemaRequest) (*TableSchemaResponse, error)
	CreateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error)
	UpdateSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error)
	DeleteSlice(ctx context.Context, slice *entity.Slice) (*entity.Slice, error)
	ListSlice(ctx context.Context, request *ListSliceRequest) (*ListSliceResponse, error)
	Retrieve(ctx context.Context, req *RetrieveRequest) ([]*RetrieveSlice, error)
	CreateDocumentReview(ctx context.Context, req *CreateDocumentReviewRequest) ([]*entity.Review, error)
	MGetDocumentReview(ctx context.Context, reviewIDs []int64) ([]*entity.Review, error)
	SaveDocumentReview(ctx context.Context, req *SaveDocumentReviewRequest) error
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
	Limit       *int
	Offset      *int
	Cursor      *string
}

type ListDocumentResponse struct {
	Documents  []*entity.Document
	Total      int64
	HasMore    bool
	NextCursor *string
}

type DocumentProgress struct {
	ID            int64
	Name          string
	Size          int64
	FileExtension string
	Progress      int
	Status        entity.DocumentStatus
	StatusMsg     string
	RemainingSec  int64
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
	Sequence    int64
	Offset      int64
	Limit       int64
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
	TableColumns []*entity.TableColumn
}
type AlterTableSchemaRequest struct {
	DocumentID       int64
	TableDataType    TableDataType
	OriginTableMeta  []*entity.TableColumn
	PreviewTableMeta []*entity.TableColumn
}

type ImportDataTableSchemaRequest struct {
	// parse source data
	SourceInfo    TableSourceInfo
	TableSheet    *entity.TableSheet
	TableDataType TableDataType

	// DocumentID would be nil if is first time import
	DocumentID *int64

	// OriginTableMeta and PreviewTableMeta is not nil only in first time import
	OriginTableMeta  []*entity.TableColumn
	PreviewTableMeta []*entity.TableColumn
}

type TableSchemaResponse struct {
	Code           int32
	Msg            string
	TableSheet     *entity.TableSheet          // sheet detail
	AllTableSheets []*entity.TableSheet        // all sheets, len >= 1 when file type is xlsx
	TableMeta      []*entity.TableColumn       // columns
	PreviewData    [][]*entity.TableColumnData // rows: index -> value
}

type TableDataType int32

const (
	AllData     TableDataType = 0 // schema sheets 和 preview data
	OnlySchema  TableDataType = 1 // 只需要 schema 结构 & Sheets
	OnlyPreview TableDataType = 2 // 只需要 preview data
)

type GetDocumentTableInfoRequest struct {
	DocumentID *int64
	SourceInfo *TableSourceInfo
}

type GetDocumentTableInfoResponse struct {
	Code        int32
	Msg         string
	TableSheet  []*entity.TableSheet
	TableMeta   map[string][]*entity.TableColumn // table sheet index -> columns
	PreviewData map[string][]map[string]string   // table sheet index -> rows : sequence -> value
}

type TableSourceInfo struct {
	// FileType table file type, required when using Uri or FileBase64
	FileType *string
	// Uri table from uri
	Uri *string
	// FileBase64 table from base64
	FileBase64 *string
	// CustomContent table from raw content
	// rows: column name -> value
	CustomContent []map[string]string
}

type ValidateTableSchemaRequest struct {
	DocumentID int64
	SourceInfo TableSourceInfo
	TableSheet *entity.TableSheet
}

type ValidateTableSchemaResponse struct {
	ColumnValidResult map[string]string // column name -> validate result
}
type CreateDocumentReviewRequest struct {
	DatasetId       int64
	Reviews         []*ReviewInput
	ChunkStrategy   *entity.ChunkingStrategy
	ParsingStrategy *entity.ParsingStrategy
}

type ReviewInput struct {
	DocumentName string `thrift:"document_name,1" frugal:"1,default,string" json:"document_name"`
	DocumentType string `thrift:"document_type,2" frugal:"2,default,string" json:"document_type"`
	TosUri       string `thrift:"tos_uri,3" frugal:"3,default,string" json:"tos_uri"`
	DocumentId   *int64 `thrift:"document_id,4,optional" frugal:"4,optional,i64" json:"document_id,omitempty"`
}

type SaveDocumentReviewRequest struct {
	DatasetId   int64
	ReviewId    int64
	DocTreeJson string
}
