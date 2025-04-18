package builtin

import (
	"context"
	"fmt"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
)

type Parser struct{}

var parseDocFnMapping = map[string]parseDocFn{
	entity.FileExtensionPDF:      parsePdf,
	entity.FileExtensionTXT:      parseText,
	entity.FileExtensionMarkdown: parseText,
}

var parseSheetFnMapping = map[string]parseSheetFn{
	entity.FileExtensionCSV:  parseCSV,
	entity.FileExtensionXLSX: parseXLSX,
	entity.FileExtensionJSON: parseJSON,
}

var chunkFnMapping = map[entity.ChunkType]chunkFn{
	entity.ChunkTypeCustom: chunkCustom,
}

type parseDocFn func(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, doc *entity.Document) (plainText string, err error)

type parseSheetFn func(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, doc *entity.Document) (result *parser.Result, err error)

type chunkFn func(ctx context.Context, text string, cs *entity.ChunkingStrategy, document *entity.Document) (slices []*entity.Slice, err error)

func (p *Parser) Parse(ctx context.Context, reader io.Reader, document *entity.Document) (result *parser.Result, err error) {
	ps := document.ParsingStrategy
	cs := document.ChunkingStrategy

	switch document.Type {
	case entity.DocumentTypeText:
		var (
			rawContent string
			slices     []*entity.Slice
		)

		if fn, ok := parseDocFnMapping[document.FilenameExtension]; ok {
			rawContent, err = fn(ctx, reader, ps, document)
			if err != nil {
				return nil, fmt.Errorf("[Parse] parse failed, %w", err)
			}
		} else {
			return nil, fmt.Errorf("[Parse] extension not support, type=%d, file extension=%v", document.Type, document.FilenameExtension)
		}

		if fn, ok := chunkFnMapping[cs.ChunkType]; ok {
			slices, err = fn(ctx, rawContent, cs, document)
			if err != nil {
				return nil, fmt.Errorf("[Parse] chunk failed, %w", err)
			}
		} else {
			return nil, fmt.Errorf("[Parse] chunk type not support, type=%d", cs.ChunkType)
		}

		size := int64(0)
		charCount := int64(0)
		for _, s := range slices {
			size += s.ByteCount
			charCount += s.CharCount
		}
		return &parser.Result{
			Size:        size,
			CharCount:   charCount,
			TableSchema: nil,
			Slices:      slices,
		}, nil

	case entity.DocumentTypeTable:
		if fn, ok := parseSheetFnMapping[document.FilenameExtension]; ok {
			return fn(ctx, reader, ps, document)
		} else {
			return nil, fmt.Errorf("[Parse] extension not support, type=%d, file extension=%v", document.Type, document.FilenameExtension)
		}

	default:
		return nil, fmt.Errorf("[Parse] document type not support, type=%d", document.Type)
	}

}
