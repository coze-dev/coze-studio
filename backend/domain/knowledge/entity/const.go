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
	DocumentTypeText  DocumentType = 0 // 文本
	DocumentTypeTable DocumentType = 1 // 表格
	DocumentTypeImage DocumentType = 2 // 图片
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

type DocumentSource int64

const (
	DocumentSourceLocal  DocumentSource = 0 // 本地文件上传
	DocumentSourceCustom DocumentSource = 2 // 自定义文本
)

type TableColumnType int64

const (
	TableColumnTypeUnknown TableColumnType = 0
	TableColumnTypeText    TableColumnType = 1
	TableColumnTypeNumber  TableColumnType = 2
	TableColumnTypeDate    TableColumnType = 3
	TableColumnTypeFloat   TableColumnType = 4
	TableColumnTypeBoolean TableColumnType = 5
	TableColumnTypeImage   TableColumnType = 6
)

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
