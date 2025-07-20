package knowledge

import (
	"github.com/bytedance/sonic"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type ListKnowledgeRequest struct {
	IDs        []int64
	SpaceID    *int64
	AppID      *int64
	Name       *string // 完全匹配
	Status     []int32
	UserID     *int64
	Query      *string // 模糊匹配
	Page       *int
	PageSize   *int
	Order      *Order
	OrderType  *OrderType
	FormatType *DocumentType
}

type Order int32

const (
	OrderCreatedAt Order = 1
	OrderUpdatedAt Order = 2
)

type OrderType int32

const (
	OrderTypeAsc  OrderType = 1
	OrderTypeDesc OrderType = 2
)

type DocumentType int64

const (
	DocumentTypeText    DocumentType = 0 // 文本
	DocumentTypeTable   DocumentType = 1 // 表格
	DocumentTypeImage   DocumentType = 2 // 图片
	DocumentTypeUnknown DocumentType = 9 // 未知
)

type ListKnowledgeResponse struct {
	KnowledgeList []*Knowledge
	Total         int64
}

type Knowledge struct {
	Info
	SliceHit int64
	Type     DocumentType
	Status   KnowledgeStatus
}

type Info struct {
	ID          int64
	Name        string
	Description string
	IconURI     string
	IconURL     string
	CreatorID   int64
	SpaceID     int64
	AppID       int64
	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64
}

type KnowledgeStatus int64

const (
	KnowledgeStatusInit    KnowledgeStatus = 0
	KnowledgeStatusEnable  KnowledgeStatus = 1
	KnowledgeStatusDisable KnowledgeStatus = 3
)

type RetrieveRequest struct {
	Query       string
	ChatHistory []*schema.Message

	// 从指定的知识库和文档中召回
	KnowledgeIDs []int64
	DocumentIDs  []int64 // todo: 确认下这个场景

	// 召回策略
	Strategy *RetrievalStrategy

	// 用于 nl2sql 和 message to query 的 chat model config
	ChatModelProtocol *chatmodel.Protocol
	ChatModelConfig   *chatmodel.Config
}

type RetrievalStrategy struct {
	TopK      *int64   // 1-10 default 3
	MinScore  *float64 // 0.01-0.99 default 0.5
	MaxTokens *int64

	SelectType         SelectType // 调用方式
	SearchType         SearchType // 搜索策略
	EnableQueryRewrite bool
	EnableRerank       bool
	EnableNL2SQL       bool
}

type SelectType int64

const (
	SelectTypeAuto     = 0 // 自动调用
	SelectTypeOnDemand = 1 // 按需调用
)

type SearchType int64

const (
	SearchTypeSemantic SearchType = 0 // 语义
	SearchTypeFullText SearchType = 1 // 全文
	SearchTypeHybrid   SearchType = 2 // 混合
)

type RetrieveResponse struct {
	RetrieveSlices []*RetrieveSlice
}

type RetrieveSlice struct {
	Slice *Slice
	Score float64
}

type Slice struct {
	Info

	KnowledgeID  int64
	DocumentID   int64
	DocumentName string
	RawContent   []*SliceContent
	SliceStatus  SliceStatus
	ByteCount    int64 // 切片 bytes
	CharCount    int64 // 切片字符数
	Sequence     int64 // 切片位置序号
	Hit          int64 // 命中次数
	Extra        map[string]string
}

func (s *Slice) GetSliceContent() string {
	if len(s.RawContent) == 0 {
		return ""
	}
	if s.RawContent[0].Type == SliceContentTypeTable {
		contentMap := map[string]string{}
		for _, column := range s.RawContent[0].Table.Columns {
			contentMap[column.ColumnName] = column.GetStringValue()
		}
		byteData, err := sonic.Marshal(contentMap)
		if err != nil {
			return ""
		}
		return string(byteData)
	}
	data := ""
	for i := range s.RawContent {
		item := s.RawContent[i]
		if item == nil {
			continue
		}
		if item.Type == SliceContentTypeTable {
			var contentMap map[string]string
			for _, column := range s.RawContent[0].Table.Columns {
				contentMap[column.ColumnName] = column.GetStringValue()
			}
			byteData, err := sonic.Marshal(contentMap)
			if err != nil {
				return ""
			}
			data += string(byteData)
		}
		if item.Type == SliceContentTypeText {
			data += ptr.From(item.Text)
		}
	}
	return data
}

type SliceContent struct {
	Type SliceContentType

	Text  *string
	Image *SliceImage
	Table *SliceTable
}

type SliceStatus int64

const (
	SliceStatusInit        SliceStatus = 0 // 初始化
	SliceStatusFinishStore SliceStatus = 1 // searchStore存储完成
	SliceStatusFailed      SliceStatus = 9 // 失败
)

type SliceContentType int64

const (
	SliceContentTypeText SliceContentType = 0
	//SliceContentTypeImage SliceContentType = 1
	SliceContentTypeTable SliceContentType = 2
)

type SliceImage struct {
	Base64  []byte
	URI     string
	OCR     bool // 是否使用 ocr 提取了文本
	OCRText *string
}

type SliceTable struct { // table slice 为一行数据
	Columns []*document.ColumnData
}

type DeleteKnowledgeRequest struct {
	KnowledgeID int64
}
type GetKnowledgeByIDRequest struct {
	KnowledgeID int64
}

type GetKnowledgeByIDResponse struct {
	Knowledge *Knowledge
}

type MGetKnowledgeByIDRequest struct {
	KnowledgeIDs []int64
}

type MGetKnowledgeByIDResponse struct {
	Knowledge []*Knowledge
}

type CopyKnowledgeRequest struct {
	KnowledgeID   int64
	TargetAppID   int64
	TargetSpaceID int64
	TargetUserID  int64
	TaskUniqKey   string
}
type CopyStatus int64

const (
	CopyStatus_Successful CopyStatus = 1
	CopyStatus_Processing CopyStatus = 2
	CopyStatus_Failed     CopyStatus = 3
	CopyStatus_KeepOrigin CopyStatus = 4
)

type CopyKnowledgeResponse struct {
	OriginKnowledgeID int64
	TargetKnowledgeID int64
	CopyStatus        CopyStatus
	ErrMsg            string
}
type MoveKnowledgeToLibraryRequest struct {
	KnowledgeID int64
}
