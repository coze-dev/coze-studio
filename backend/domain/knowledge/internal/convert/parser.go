package convert

import (
	"strconv"
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
		ExtractImage:  ps.ExtractImage,
		ExtractTable:  ps.ExtractTable,
		ImageOCR:      ps.ImageOCR,
		SheetID:       ptr.Of(int(ps.SheetID)),
		HeaderLine:    ps.HeaderLine,
		DataStartLine: ps.DataStartLine,
		RowsCount:     ps.RowsCount,
		IsAppend:      isAppend,
		Columns:       convColumns(columns),
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

const (
	TimeFormat       = "2006-01-02 15:04:05"
	defauleStringVal = ""
	defaultIntVal    = 0
	defaultFloatVal  = 0.0
	defaultBoolVal   = false
	defaultImageVal  = ""
)

func AssertValForce(typ document.TableColumnType, val string) *document.ColumnData {
	cd := &document.ColumnData{
		Type: typ,
	}
	// TODO: 先不处理 image
	switch typ {
	case document.TableColumnTypeString:
		cd.ValString = &val
		return cd

	case document.TableColumnTypeInteger:
		i, err := strconv.ParseInt(val, 10, 64)
		if err != nil {
			cd.ValInteger = ptr.Of(int64(defaultIntVal))
			return cd
		}
		cd.ValInteger = ptr.Of(i)
		return cd

	case document.TableColumnTypeTime:
		t, err := time.Parse(TimeFormat, val)
		if err != nil {
			cd.ValTime = ptr.Of(time.Time{})
			return cd
		}
		cd.ValTime = ptr.Of(t)
		return cd

	case document.TableColumnTypeNumber:
		f, err := strconv.ParseFloat(val, 64)
		if err != nil {
			cd.ValNumber = ptr.Of(float64(defaultFloatVal))
			return cd
		}
		cd.ValNumber = ptr.Of(f)
		return cd

	case document.TableColumnTypeBoolean:
		t, err := strconv.ParseBool(val)
		if err != nil {
			cd.ValBoolean = ptr.Of(defaultBoolVal)
			return cd
		}
		cd.ValBoolean = ptr.Of(t)
		return cd

	default:
		cd.ValString = &val
		return cd
	}
}
