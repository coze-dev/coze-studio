package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
)

type Document struct {
	common.Info

	KnowledgeID       int64
	Type              DocumentType
	RawContent        string            // 用户自定义的原始内容
	URI               string            // 文档 uri
	Size              int64             // 文档 bytes
	SliceCount        int64             // slice 数量
	CharCount         int64             // 文档字符数
	FilenameExtension string            // 文档后缀, csv/pdf...
	Status            DocumentStatus    // 文档状态
	StatusMsg         string            // 文档状态详细信息
	Hits              int64             // 命中次数
	Source            DocumentSource    // 文档来源
	ParsingStrategy   *ParsingStrategy  // 解析策略
	ChunkingStrategy  *ChunkingStrategy // 分段策略

	TableInfo TableInfo
	IsAppend  bool // 是否在表格中追加

	// LevelURI   string // 层级分段预览 uri
	// PreviewURI string // 预览 uri
}

type TableInfo struct {
	VirtualTableName  string         `json:"virtual_table_name"`
	PhysicalTableName string         `json:"physical_table_name"`
	TableDesc         string         `json:"table_desc"`
	Columns           []*TableColumn `json:"columns"`
}
type TableSheet struct {
	SheetId       int64 // sheet id
	HeaderLineIdx int64 // 表头行
	StartLineIdx  int64 // 数据起始行
}
type TableColumn struct {
	ID          int64
	Name        string
	Type        TableColumnType
	Description string
	Indexing    bool  // 是否索引
	Sequence    int64 // 表格中的原始序号
}
