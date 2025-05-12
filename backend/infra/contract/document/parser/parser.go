package parser

import "github.com/cloudwego/eino/components/document/parser"

type Parser = parser.Parser

const (
	DocExtraKeyColumns    = "table_columns"     // val: []*document.Column
	DocExtraKeyColumnData = "table_column_data" // val: []*document.ColumnData
)
