package parser

import (
	"context"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

type Parser interface {
	Parse(ctx context.Context, contentReader io.Reader, documentInfo *entity.Document) (
		result *Result, err error)
}

type Result struct {
	Size        int64
	CharCount   int64
	TableSchema []*entity.TableColumn
	Slices      []*entity.Slice
}
