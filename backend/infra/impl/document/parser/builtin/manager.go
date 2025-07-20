/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package builtin

import (
	"fmt"

	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/ocr"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/goutil"
)

func NewManager(storage storage.Storage, ocr ocr.OCR, imageAnnotationModel chatmodel.BaseChatModel) parser.Manager {
	return &manager{
		storage: storage,
		ocr:     ocr,
		model:   imageAnnotationModel,
	}
}

type manager struct {
	ocr     ocr.OCR
	storage storage.Storage
	model   chatmodel.BaseChatModel
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
		pFn = parseByPython(config, m.storage, m.ocr, goutil.GetPython3Path(), goutil.GetPythonFilePath("parse_pdf.py"))
	case parser.FileExtensionTXT:
		pFn = parseText(config)
	case parser.FileExtensionMarkdown:
		pFn = parseMarkdown(config, m.storage, m.ocr)
	case parser.FileExtensionDocx:
		pFn = parseByPython(config, m.storage, m.ocr, goutil.GetPython3Path(), goutil.GetPythonFilePath("parse_docx.py"))
	case parser.FileExtensionCSV:
		pFn = parseCSV(config)
	case parser.FileExtensionXLSX:
		pFn = parseXLSX(config)
	case parser.FileExtensionJSON:
		pFn = parseJSON(config)
	case parser.FileExtensionJsonMaps:
		pFn = parseJSONMaps(config)
	case parser.FileExtensionJPG, parser.FileExtensionJPEG, parser.FileExtensionPNG:
		pFn = parseImage(config, m.model)
	default:
		return nil, fmt.Errorf("[Parse] document type not support, type=%s", config.FileExtension)
	}

	return &p{parseFn: pFn}, nil
}
