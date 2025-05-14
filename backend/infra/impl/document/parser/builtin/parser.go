package builtin

import (
	"context"
	"io"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
)

type p struct {
	parseFn
}

func (p p) Parse(ctx context.Context, reader io.Reader, opts ...parser.Option) ([]*schema.Document, error) {
	return p.parseFn(ctx, reader, opts...)
}

type parseFn func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error)
