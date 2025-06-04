package builtin

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/dslipak/pdf"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

func parsePDF(config *contract.Config) parseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		b, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}

		newReader := bytes.NewReader(b)
		f, err := pdf.NewReader(newReader, newReader.Size())
		if err != nil {
			return nil, err
		}

		pages := f.NumPage()
		var buf bytes.Buffer
		fonts := make(map[string]*pdf.Font)
		for i := 1; i <= pages; i++ {
			p := f.Page(i)
			for _, name := range p.Fonts() {
				if _, ok := fonts[name]; !ok {
					font := p.Font(name)
					fonts[name] = &font
				}
			}
			text, err := p.GetPlainText(fonts)
			if err != nil {
				return nil, fmt.Errorf("[parsePDF] read pdf page failed: %w, page= %d", err, i)
			}
			buf.WriteString(text + "\n")
		}

		switch config.ChunkingStrategy.ChunkType {
		case contract.ChunkTypeCustom, contract.ChunkTypeDefault:
			docs, err = chunkCustom(ctx, buf.String(), config, opts...)
		default:
			return nil, fmt.Errorf("[parsePDF] chunk type not support, type=%d", config.ChunkingStrategy.ChunkType)
		}
		if err != nil {
			return nil, err
		}

		return docs, nil
	}
}
