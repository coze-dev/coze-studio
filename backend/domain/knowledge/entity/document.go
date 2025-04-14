package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
)

type Document struct {
	common.Info

	KnowledgeID       int64
	Type              DocumentType
	URI               string
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

	TableColumns []*TableColumn

	// LevelURI   string // 层级分段预览 uri
	// PreviewURI string // 预览 uri
}

type TableColumn struct {
	ID          int64
	Name        string
	Type        TableColumnType
	Description string
	Indexing    bool  // 是否索引
	Sequence    int64 // 表格中的原始序号
}
