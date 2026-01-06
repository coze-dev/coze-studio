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

package convert

import (
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func DocumentToParseConfig(doc *entity.Document) *parser.Config {
	return ToParseConfig(doc.FileExtension, doc.ParsingStrategy, doc.ChunkingStrategy, doc.IsAppend, doc.TableInfo.Columns)
}

func ToParseConfig(fileExtension parser.FileExtension, ps *entity.ParsingStrategy, cs *entity.ChunkingStrategy, isAppend bool, columns []*entity.TableColumn) *parser.Config {
	if ps == nil {
		ps = &entity.ParsingStrategy{HeaderLine: 0, DataStartLine: 1}
	}

	p := &parser.ParsingStrategy{
		ExtractImage:        ps.ExtractImage,
		ExtractTable:        ps.ExtractTable,
		ImageOCR:            ps.ImageOCR,
		FilterPages:         ps.FilterPages,
		SheetID:             ptr.Of(int(ps.SheetID)),
		HeaderLine:          ps.HeaderLine,
		DataStartLine:       ps.DataStartLine,
		RowsCount:           ps.RowsCount,
		IsAppend:            isAppend,
		Columns:             convColumns(columns),
		IgnoreColumnTypeErr: true, // default true
		ImageAnnotationType: ptr.From(ptr.From(ps).CaptionType),
	}

	var c *parser.ChunkingStrategy
	if cs != nil {
		c = &parser.ChunkingStrategy{
			ChunkType:       cs.ChunkType,
			ChunkSize:       cs.ChunkSize,
			Separator:       cs.Separator,
			Overlap:         cs.Overlap,
			TrimSpace:       cs.TrimSpace,
			TrimURLAndEmail: cs.TrimURLAndEmail,
			MaxDepth:        cs.MaxDepth,
			SaveTitle:       cs.SaveTitle,
		}
	}

	return &parser.Config{
		FileExtension:    fileExtension,
		ParsingStrategy:  p,
		ChunkingStrategy: c,
	}
}

func convColumns(src []*entity.TableColumn) []*document.Column {
	resp := make([]*document.Column, 0, len(src))
	for _, c := range src {
		if c.Name == consts.RDBFieldID {
			continue
		}
		dc := &document.Column{
			ID:          c.ID,
			Name:        c.Name,
			Type:        c.Type,
			Description: c.Description,
			Nullable:    !c.Indexing,
			IsPrimary:   false,
			Sequence:    int(c.Sequence),
		}
		resp = append(resp, dc)
	}
	return resp
}

func Type2DefaultVal(typ document.TableColumnType) any {
	switch typ {
	case document.TableColumnTypeString:
		return ""
	case document.TableColumnTypeInteger:
		return 0
	case document.TableColumnTypeTime:
		return time.Time{}
	case document.TableColumnTypeNumber:
		return 0.0
	case document.TableColumnTypeBoolean:
		return false
	case document.TableColumnTypeImage:
		return []byte{}
	default:
		return ""
	}
}
