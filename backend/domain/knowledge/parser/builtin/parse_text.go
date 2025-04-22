package builtin

import (
	"context"
	"fmt"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

func parseText(ctx context.Context, reader io.Reader, document *entity.Document) (slices []*entity.Slice, err error) {
	cs := document.ChunkingStrategy

	content, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	switch cs.ChunkType {
	case entity.ChunkTypeCustom:
		slices, err = chunkCustom(ctx, string(content), cs, document)
	default:
		return nil, fmt.Errorf("[parseText] chunk type not support, type=%d", cs.ChunkType)
	}
	if err != nil {
		return nil, err
	}

	return slices, nil

}
