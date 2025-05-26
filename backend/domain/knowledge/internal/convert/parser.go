package convert

import (
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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
		SheetID:             ptr.Of(int(ps.SheetID)),
		HeaderLine:          ps.HeaderLine,
		DataStartLine:       ps.DataStartLine,
		RowsCount:           ps.RowsCount,
		IsAppend:            isAppend,
		Columns:             convColumns(columns),
		IgnoreColumnTypeErr: true, // default true
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
