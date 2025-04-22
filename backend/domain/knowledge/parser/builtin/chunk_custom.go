package builtin

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"unicode/utf8"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

var (
	spaceRegex = regexp.MustCompile(`\s+`)
	urlRegex   = regexp.MustCompile(`https?://\S+|www\.\S+`)
	emailRegex = regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
)

func chunkCustom(ctx context.Context, text string, cs *entity.ChunkingStrategy, document *entity.Document) (slices []*entity.Slice, err error) {
	if cs.Overlap >= cs.ChunkSize {
		return nil, fmt.Errorf("[chunkCustom] invalid param, overlap >= chunk_size")
	}

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

	add := func(plainText string) {
		slices = append(slices, &entity.Slice{
			KnowledgeID:  document.KnowledgeID,
			DocumentID:   document.ID,
			DocumentName: document.Name,
			PlainText:    plainText,
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeText,
					Text: &plainText,
				},
			},
			ByteCount: int64(len(plainText)),
			CharCount: int64(utf8.RuneCountInString(plainText)),
			Sequence:  int64(len(slices)),
			Extra:     nil,
		})
	}

	processPart := func(part string) {
		for partLength := int64(len(part)); partLength > 0; partLength = int64(len(part)) {
			pos := min(partLength, cs.ChunkSize-currentLength)
			add(part[:pos])
			buffer.Reset()
			if cs.Overlap > 0 && len(slices) > 0 {
				overlapBuffer = getOverlap(slices[len(slices)-1].PlainText, cs.Overlap)
				buffer.WriteString(overlapBuffer)
				currentLength = int64(len(overlapBuffer))
			} else {
				currentLength = 0
			}
			part = part[pos:]
		}
	}

	for _, part := range parts {
		processPart(part)
	}

	return slices, nil
}

func getOverlap(text string, overlap int64) string {
	if int64(len(text)) <= overlap {
		return text
	}
	return text[len(text)-int(overlap):]
}
