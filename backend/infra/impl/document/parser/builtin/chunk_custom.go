package builtin

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

var (
	spaceRegex = regexp.MustCompile(`\s+`)
	urlRegex   = regexp.MustCompile(`https?://\S+|www\.\S+`)
	emailRegex = regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
)

func chunkCustom(_ context.Context, text string, config *contract.Config, opts ...parser.Option) (docs []*schema.Document, err error) {
	cs := config.ChunkingStrategy
	if cs.Overlap >= cs.ChunkSize {
		return nil, fmt.Errorf("[chunkCustom] invalid param, overlap >= chunk_size")
	}

	var (
		parts         = strings.Split(text, cs.Separator)
		buffer        strings.Builder
		currentLength int64
		overlapBuffer = ""

		options = parser.GetCommonOptions(&parser.Options{ExtraMeta: map[string]any{}}, opts...)
	)

	trim := func(text string) string {
		if cs.TrimURLAndEmail {
			text = urlRegex.ReplaceAllString(text, "")
			text = emailRegex.ReplaceAllString(text, "")
		}

		if cs.TrimSpace {
			text = strings.TrimSpace(text)
			text = spaceRegex.ReplaceAllString(text, " ")
		}

		return text
	}

	add := func(plainText string) {
		doc := &schema.Document{
			Content:  plainText,
			MetaData: map[string]any{},
		}

		for k, v := range options.ExtraMeta {
			doc.MetaData[k] = v
		}

		docs = append(docs, doc)
	}

	processPart := func(part string) {
		for partLength := int64(len(part)); partLength > 0; partLength = int64(len(part)) {
			pos := min(partLength, cs.ChunkSize-currentLength)
			add(part[:pos])
			buffer.Reset()
			if cs.Overlap > 0 && len(docs) > 0 {
				overlapBuffer = getOverlap(docs[len(docs)-1].Content, cs.Overlap)
				buffer.WriteString(overlapBuffer)
				currentLength = int64(len(overlapBuffer))
			} else {
				currentLength = 0
			}
			part = part[pos:]
		}
	}

	for _, part := range parts {
		processPart(trim(part))
	}

	return docs, nil
}

func getOverlap(text string, overlap int64) string {
	if int64(len(text)) <= overlap {
		return text
	}
	return text[len(text)-int(overlap):]
}
