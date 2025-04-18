package builtin

import (
	"context"
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
