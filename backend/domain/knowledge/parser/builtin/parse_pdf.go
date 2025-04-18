package builtin

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/dslipak/pdf"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

func parsePdf(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, doc *entity.Document) (plainText string, err error) {
	b, err := io.ReadAll(reader)
	if err != nil {
		return "", err
	}

	newReader := bytes.NewReader(b)
	f, err := pdf.NewReader(newReader, newReader.Size())
	if err != nil {
		return "", err
	}

	pages := f.NumPage()
	var buf bytes.Buffer
	fonts := make(map[string]*pdf.Font)
	for i := 1; i <= pages; i++ {
		p := f.Page(i)
		for _, name := range p.Fonts() { // cache fonts so we don't continually parse charmap
			if _, ok := fonts[name]; !ok {
				font := p.Font(name)
				fonts[name] = &font
			}
		}
		text, err := p.GetPlainText(fonts)
		if err != nil {
			return "", fmt.Errorf("[Parse] read pdf page failed: %w, page= %d", err, i)
		}
		buf.WriteString(text + "\n")
	}

	// TODO: gen meta
	return buf.String(), nil
}
