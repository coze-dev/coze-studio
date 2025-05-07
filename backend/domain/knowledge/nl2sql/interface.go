package nl2sql

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type DBTableMetadata struct {
	TableName string
	Comment   string
	Columns   []*DBColumnMetadata
}

type DBColumnMetadata struct {
	ColumnName  string
	DataType    string
	Comment     string
	IsAllowNull bool
	IsPrimary   bool
}

type NL2Sql interface {
	NL2Sql(ctx context.Context, query string, chatHistory []*schema.Message, dbMeta []*DBTableMetadata) (sqlString string, err error)
}
