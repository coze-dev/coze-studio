package parser

import (
	"context"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

type Parser interface {
	Parse(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, cs *entity.ChunkingStrategy) (
		result *Result, err error)
	AsyncParse() // todo: 讨论是否提供异步 parse 方法
}

type Result struct {
	DocumentMeta *entity.Document
	Slices       []*entity.Slice
}
