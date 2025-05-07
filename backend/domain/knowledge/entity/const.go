package entity

type KnowledgeStatus int64

const (
	KnowledgeStatusInit    KnowledgeStatus = 0
	KnowledgeStatusEnable  KnowledgeStatus = 1
	KnowledgeStatusDisable KnowledgeStatus = 2
)

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

type DocumentType int64

const (
	DocumentTypeText    DocumentType = 0 // 文本
	DocumentTypeTable   DocumentType = 1 // 表格
	DocumentTypeImage   DocumentType = 2 // 图片
	DocumentTypeUnknown DocumentType = 9 // 未知
)

type DocumentStatus int64

const (
	DocumentStatusUploading DocumentStatus = 0 // 上传中
	DocumentStatusEnable    DocumentStatus = 1 // 生效
	DocumentStatusDisable   DocumentStatus = 2 // 失效
	DocumentStatusDeleted   DocumentStatus = 3 // 已删除
	DocumentStatusChunking  DocumentStatus = 4 // 切片中
	//DocumentStatusRefreshing DocumentStatus = 5 // 刷新中
	DocumentStatusFailed DocumentStatus = 9 // 失败
)

func (s DocumentStatus) String() string {
	switch s {
	case DocumentStatusUploading:
		return "上传中"
	case DocumentStatusEnable:
		return "生效"
	case DocumentStatusDisable:
		return "失效"
	case DocumentStatusDeleted:
		return "已删除"
	case DocumentStatusChunking:
		return "切片中"
	//case DocumentStatusRefreshing:
	//	return "刷新中"
	case DocumentStatusFailed:
		return "失败"
	default:
		return "未知"
	}
}

type DocumentSource int64

const (
	DocumentSourceLocal  DocumentSource = 0 // 本地文件上传
	DocumentSourceCustom DocumentSource = 2 // 自定义文本
)

type TableColumnType int64

const (
	TableColumnTypeUnknown TableColumnType = 0
	TableColumnTypeString  TableColumnType = 1
	TableColumnTypeInteger TableColumnType = 2
	TableColumnTypeTime    TableColumnType = 3
	TableColumnTypeNumber  TableColumnType = 4
	TableColumnTypeBoolean TableColumnType = 5
	TableColumnTypeImage   TableColumnType = 6
)

func (t TableColumnType) String() string {
	switch t {
	case TableColumnTypeUnknown:
		return "未知"
	case TableColumnTypeString:
		return "string"
	case TableColumnTypeInteger:
		return "int"
	case TableColumnTypeTime:
		return "time"
	case TableColumnTypeNumber:
		return "number"
	case TableColumnTypeBoolean:
		return "bool"
	case TableColumnTypeImage:
		return "string"
	default:
		return "未知"
	}
}

type SliceContentType int64

const (
	SliceContentTypeText  SliceContentType = 0
	SliceContentTypeImage SliceContentType = 1
	SliceContentTypeTable SliceContentType = 2
)

type ChunkType int64

const (
	ChunkTypeDefault ChunkType = 0
	ChunkTypeCustom  ChunkType = 1
	ChunkTypeLeveled ChunkType = 2
)

const (
	// document
	FileExtensionPDF      = "pdf"
	FileExtensionTXT      = "txt"
	FileExtensionDoc      = "doc"
	FileExtensionDocx     = "docx"
	FileExtensionMarkdown = "markdown"

	// sheet
	FileExtensionCSV  = "csv"
	FileExtensionXLSX = "xlsx"
	FileExtensionJSON = "json"

	FileExtensionTableCustomContent = "_table_custom_content"
)
