package builtin

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/dslipak/pdf"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

func parsePDF(ctx context.Context, reader io.Reader, document *entity.Document) (slices []*entity.Slice, err error) {
	cs := document.ChunkingStrategy

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

	switch cs.ChunkType {
	case entity.ChunkTypeCustom:
		slices, err = chunkCustom(ctx, buf.String(), cs, document)
	default:
		return nil, fmt.Errorf("[parsePDF] chunk type not support, type=%d", cs.ChunkType)
	}
	if err != nil {
		return nil, err
	}

	return slices, nil
}
