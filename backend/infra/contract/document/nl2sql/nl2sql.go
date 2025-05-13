package nl2sql

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
)

type NL2SQL interface {
	NL2SQL(ctx context.Context, chatHistory []*schema.Message, tables []*document.TableSchema) (sql string, err error)
}
