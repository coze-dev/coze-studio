package builtin

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/dslipak/pdf"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
)

type Parser struct {
}

func (p *Parser) Parse(ctx context.Context, reader io.Reader, document *entity.Document) (result *parser.Result, err error) {
	ps := document.ParsingStrategy
	cs := document.ChunkingStrategy

	meta, rawContent, err := p.parse(ctx, reader, ps)
	if err != nil {
		return nil, err
	}

	var slices []*entity.Slice
	switch cs.ChunkType {
	case entity.ChunkTypeCustom:
		slices, err = p.chunk(ctx, rawContent, document.ChunkingStrategy, document)
	default:
		return nil, fmt.Errorf("[Parse] chunk type not support, type=%d", cs.ChunkType)
	}

	if err != nil {
		return nil, err
	}

	return &parser.Result{
		DocumentMeta: meta,
		Slices:       slices,
	}, nil

}

func (p *Parser) parse(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy) (meta *entity.Document, plainText string, err error) {
	b, err := io.ReadAll(reader)
	if err != nil {
		return nil, "", err
	}

	newReader := bytes.NewReader(b)
	f, err := pdf.NewReader(newReader, newReader.Size())
	if err != nil {
		return nil, "", err
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
			return nil, "", fmt.Errorf("[Parse] read pdf page failed: %w, page= %d", err, i)
		}
		buf.WriteString(text + "\n")
	}

	// TODO: gen meta
	return nil, buf.String(), nil
}

var (
	spaceRegex = regexp.MustCompile(`\s+`)
	urlRegex   = regexp.MustCompile(`https?://\S+|www\.\S+`)
	emailRegex = regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
)

func (p *Parser) chunk(ctx context.Context, text string, cs *entity.ChunkingStrategy, document *entity.Document) (slices []*entity.Slice, err error) {
	if cs.TrimURLAndEmail {
		text = urlRegex.ReplaceAllString(text, "")
		text = emailRegex.ReplaceAllString(text, "")
	}

	if cs.TrimSpace {
		text = strings.TrimSpace(text)
		text = spaceRegex.ReplaceAllString(text, " ")
	}

	var (
		parts         = strings.Split(text, cs.Separator)
		buffer        strings.Builder
		currentLength int64
		overlapBuffer = ""
	)

	add := func(plainText string, rawContent []*entity.SliceContent) {
		slices = append(slices, &entity.Slice{
			Info:         common.Info{},
			KnowledgeID:  document.KnowledgeID,
			DocumentID:   document.ID,
			DocumentName: document.Name,
			PlainText:    plainText,
			RawContent:   rawContent,
			ByteCount:    int64(len(plainText)),
			CharCount:    int64(utf8.RuneCountInString(plainText)),
			Sequence:     int64(len(slices) + 1),
			Extra:        nil,
		})
	}

	for i, part := range parts {
		partLength := int64(len(part))
		if currentLength+partLength > cs.ChunkSize {
			add(buffer.String(), nil) // TODO: raw content
			buffer.Reset()

			if cs.Overlap > 0 && len(slices) > 0 {
				overlapBuffer = getOverlap(slices[len(slices)-1].PlainText, cs.Overlap)
				buffer.WriteString(overlapBuffer)
				currentLength = int64(len(overlapBuffer))
			} else {
				currentLength = 0
			}
		}
		if currentLength > 0 {
			buffer.WriteString(cs.Separator)
			currentLength += int64(len(cs.Separator))
		}
		buffer.WriteString(part)
		currentLength += partLength

		if i == len(parts)-1 {
			add(buffer.String(), nil) // TODO: raw content
		}
	}

	return slices, nil
}

func getOverlap(text string, overlap int64) string {
	if int64(len(text)) <= overlap {
		return text
	}
	return text[len(text)-int(overlap):]
}
