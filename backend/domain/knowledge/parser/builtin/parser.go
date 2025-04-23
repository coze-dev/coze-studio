package builtin

import (
	"context"
	"fmt"
	"io"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
)

func NewParser(imageX imagex.ImageX) parser.Parser {
	return &defaultParser{
		parseTextFnMapping: map[string]parseTextFn{
			entity.FileExtensionPDF:      parsePDF,
			entity.FileExtensionTXT:      parseText,
			entity.FileExtensionMarkdown: parseText,
			entity.FileExtensionDocx:     parseDocx(imageX),
		},
		// TODO: parse column name
		parseSheetFnMapping: map[string]parseSheetFn{
			entity.FileExtensionCSV:  parseCSV,
			entity.FileExtensionXLSX: parseXLSX,
			entity.FileExtensionJSON: parseJSON,
		},
	}
}

type defaultParser struct {
	parseTextFnMapping  map[string]parseTextFn
	parseSheetFnMapping map[string]parseSheetFn
}

type parseTextFn func(ctx context.Context, reader io.Reader, document *entity.Document) ([]*entity.Slice, error)

type parseSheetFn func(ctx context.Context, reader io.Reader, ps *entity.ParsingStrategy, doc *entity.Document) (tableSchema []*entity.TableColumn, slices []*entity.Slice, err error)

func (p *defaultParser) Parse(ctx context.Context, reader io.Reader, document *entity.Document) (result *parser.Result, err error) {
	result = &parser.Result{}

	switch document.Type {
	case entity.DocumentTypeText:
		if fn, ok := p.parseTextFnMapping[document.FilenameExtension]; ok {
			result.Slices, err = fn(ctx, reader, document)
		} else {
			return nil, fmt.Errorf("[Parse] extension not support, type=%d, file extension=%v", document.Type, document.FilenameExtension)
		}

	case entity.DocumentTypeTable:
		if fn, ok := p.parseSheetFnMapping[document.FilenameExtension]; ok {
			result.TableSchema, result.Slices, err = fn(ctx, reader, document.ParsingStrategy, document)
		} else {
			return nil, fmt.Errorf("[Parse] extension not support, type=%d, file extension=%v", document.Type, document.FilenameExtension)
		}

	default:
		return nil, fmt.Errorf("[Parse] document type not support, type=%d", document.Type)
	}

	if err != nil {
		return nil, err
	}

	for _, s := range result.Slices {
		result.Size += s.ByteCount
		result.CharCount += s.CharCount
	}

	return result, nil
}
