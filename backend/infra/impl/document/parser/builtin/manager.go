package builtin

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/ocr"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

func NewManager(storage storage.Storage, ocr ocr.OCR) parser.Manager {
	return &manager{
		storage: storage,
		ocr:     ocr,
	}
}

type manager struct {
	ocr     ocr.OCR
	storage storage.Storage
}

func (m *manager) GetParser(config *parser.Config) (parser.Parser, error) {
	var pFn parseFn

	if config.ParsingStrategy.HeaderLine == 0 && config.ParsingStrategy.DataStartLine == 0 {
		config.ParsingStrategy.DataStartLine = 1
	} else if config.ParsingStrategy.HeaderLine >= config.ParsingStrategy.DataStartLine {
		return nil, fmt.Errorf("[GetParser] invalid header line and data start line, header=%d, data_start=%d",
			config.ParsingStrategy.HeaderLine, config.ParsingStrategy.DataStartLine)
	}

	switch config.FileExtension {
	case parser.FileExtensionPDF:
		pFn = parsePDFPy(config, m.storage, m.ocr)
	case parser.FileExtensionTXT,
		parser.FileExtensionMarkdown:
		pFn = parseMarkdown(config, m.storage, m.ocr)
	case parser.FileExtensionDocx:
		pFn = parseDocx(config, m.storage, m.ocr)
	case parser.FileExtensionCSV:
		pFn = parseCSV(config)
	case parser.FileExtensionXLSX:
		pFn = parseXLSX(config)
	case parser.FileExtensionJSON:
		pFn = parseJSON(config)
	case parser.FileExtensionJsonMaps:
		pFn = parseJSONMaps(config)
	default:
		return nil, fmt.Errorf("[Parse] document type not support, type=%s", config.FileExtension)
	}

	return &p{parseFn: pFn}, nil
}
