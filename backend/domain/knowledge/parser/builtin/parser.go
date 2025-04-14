package builtin

import (
	"context"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
)

type Parser struct {
}

func (p *Parser) Parse(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, cs *entity.ChunkingStrategy) (result *parser.Result, err error) {
	//TODO implement me
	panic("implement me")
}

func (p *Parser) AsyncParse() {
	//TODO implement me
	panic("implement me")
}
