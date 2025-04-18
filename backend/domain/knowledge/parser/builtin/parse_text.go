package builtin

import (
	"context"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

func parseText(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, doc *entity.Document) (plainText string, err error) {
	content, err := io.ReadAll(reader)
	if err != nil {
		return "", err
	}
	return string(content), nil
}
