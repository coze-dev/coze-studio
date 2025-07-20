/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package entity

import (
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
)

type Document struct {
	knowledge.Info

	KnowledgeID      int64
	Type             knowledge.DocumentType
	RawContent       string               // 用户自定义的原始内容
	URI              string               // 文档 uri
	URL              string               // 文档 url
	Size             int64                // 文档 bytes
	SliceCount       int64                // slice 数量
	CharCount        int64                // 文档字符数
	FileExtension    parser.FileExtension // 文档后缀, csv/pdf...
	Status           DocumentStatus       // 文档状态
	StatusMsg        string               // 文档状态详细信息
	Hits             int64                // 命中次数
	Source           DocumentSource       // 文档来源
	ParsingStrategy  *ParsingStrategy     // 解析策略
	ChunkingStrategy *ChunkingStrategy    // 分段策略

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
	SheetId       int64  // sheet id
	HeaderLineIdx int64  // 表头行
	StartLineIdx  int64  // 数据起始行
	SheetName     string // sheet的名称
	TotalRows     int64  // 总行数
}
type TableColumn struct {
	ID          int64
	Name        string
	Type        document.TableColumnType
	Description string
	Indexing    bool  // 是否索引
	Sequence    int64 // 表格中的原始序号
}

type WhereDocumentOpt struct {
	IDs          []int64
	KnowledgeIDs []int64
	StatusIn     []int32
	StatusNotIn  []int32
	CreatorID    int64
	Limit        int
	Offset       *int
	Cursor       *string
	SelectAll    bool
}
