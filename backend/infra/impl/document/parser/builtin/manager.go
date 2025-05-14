package builtin

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
)

func NewManager(imageX imagex.ImageX) parser.Manager {
	return &manager{imageX: imageX}
}

type manager struct {
	imageX imagex.ImageX
}

func (m *manager) GetParser(config *parser.Config) (parser.Parser, error) {
	var pFn parseFn

	switch config.FileExtension {
	case parser.FileExtensionPDF:
		pFn = parsePDF(config)
	case parser.FileExtensionTXT,
		parser.FileExtensionMarkdown:
		pFn = parseText(config)
	case parser.FileExtensionDocx:
		pFn = parseDocx(config, m.imageX)
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
