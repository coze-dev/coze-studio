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

package ppstructure

import (
	"fmt"

	"github.com/coze-dev/coze-studio/backend/infra/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/document/ocr"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser/impl/builtin"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/goutil"
)

func NewManager(apiConfig *APIConfig, ocr ocr.OCR, storage storage.Storage, imageAnnotationModel chatmodel.BaseChatModel) parser.Manager {
	return &manager{
		apiConfig:            apiConfig,
		ocr:                  ocr,
		storage:              storage,
		imageAnnotationModel: imageAnnotationModel,
	}
}

type manager struct {
	apiConfig            *APIConfig
	ocr                  ocr.OCR
	storage              storage.Storage
	imageAnnotationModel chatmodel.BaseChatModel
}

func (m *manager) GetParser(config *parser.Config) (parser.Parser, error) {

	if config.ParsingStrategy.HeaderLine == 0 && config.ParsingStrategy.DataStartLine == 0 {
		config.ParsingStrategy.DataStartLine = 1
	} else if config.ParsingStrategy.HeaderLine >= config.ParsingStrategy.DataStartLine {
		return nil, fmt.Errorf("[GetParser] invalid header line and data start line, header=%d, data_start=%d",
			config.ParsingStrategy.HeaderLine, config.ParsingStrategy.DataStartLine)
	}

	var pFn builtin.ParseFn
	switch config.FileExtension {
	case parser.FileExtensionPDF:
		fileType := 0
		return &ppstructureParser{config, m.apiConfig, fileType, m.ocr, m.storage}, nil
	case parser.FileExtensionTXT:
		pFn = builtin.ParseText(config)
		return &builtin.Parser{ParseFn: pFn}, nil
	case parser.FileExtensionMarkdown:
		pFn = builtin.ParseMarkdown(config, m.storage, m.ocr)
		return &builtin.Parser{ParseFn: pFn}, nil
	case parser.FileExtensionDocx:
		pFn = builtin.ParseByPython(config, m.storage, m.ocr, goutil.GetPython3Path(), goutil.GetPythonFilePath("parse_docx.py"))
		return &builtin.Parser{ParseFn: pFn}, nil
	case parser.FileExtensionCSV:
		pFn = builtin.ParseCSV(config)
		return &builtin.Parser{ParseFn: pFn}, nil
	case parser.FileExtensionXLSX:
		pFn = builtin.ParseXLSX(config)
		return &builtin.Parser{ParseFn: pFn}, nil
	case parser.FileExtensionJSON:
		pFn = builtin.ParseJSON(config)
		return &builtin.Parser{ParseFn: pFn}, nil
	case parser.FileExtensionJsonMaps:
		pFn = builtin.ParseJSONMaps(config)
		return &builtin.Parser{ParseFn: pFn}, nil
	case parser.FileExtensionJPG, parser.FileExtensionJPEG, parser.FileExtensionPNG:
		pFn = builtin.ParseImage(config, m.imageAnnotationModel)
		return &builtin.Parser{ParseFn: pFn}, nil
	default:
		return nil, fmt.Errorf("[Parse] document type not support, type=%s", config.FileExtension)
	}
}

func (m *manager) IsAutoAnnotationSupported() bool {
	return m.imageAnnotationModel != nil
}
