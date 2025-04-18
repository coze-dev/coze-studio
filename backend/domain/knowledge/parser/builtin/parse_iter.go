package builtin

import (
	"context"
	"unicode/utf8"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
)

type rowIterator interface {
	NextRow() (row []string, end bool, err error)
}

func parseByRowIterator(ctx context.Context, iter rowIterator, ps *entity.ParsingStrategy, doc *entity.Document) (result *parser.Result, err error) {
	// TODO: 支持更灵活的表头对齐策略
	i := 0
	isAppend := len(doc.TableColumns) > 0
	result = &parser.Result{}
	rev := make(map[int]*entity.TableColumn)

	for {
		row, end, err := iter.NextRow()
		if err != nil {
			return nil, err
		}
		if end {
			break
		}

		if i == ps.HeaderLine {
			var schema []*entity.TableColumn
			for j, col := range row {
				schema = append(schema, &entity.TableColumn{
					Name:     col,
					Type:     entity.TableColumnTypeUnknown,
					Sequence: int64(j),
				})
			}
			if isAppend {
				if err = alignTableSchema(doc.TableColumns, schema); err != nil { // todo: 这个可能得返回给前端，不能作为 error
					return nil, err
				}
				schema = doc.TableColumns
			}
			result.TableSchema = schema
			for j := range schema {
				tc := schema[j]
				rev[int(tc.Sequence)] = tc
			}
		}

		if i >= ps.DataStartLine {
			tbl := &entity.SliceTable{
				Columns: make([]entity.TableColumnData, len(result.TableSchema)),
			}
			sc := &entity.SliceContent{
				Type:  entity.SliceContentTypeTable,
				Table: tbl,
			}
			s := &entity.Slice{
				KnowledgeID:  doc.KnowledgeID,
				DocumentID:   doc.ID,
				DocumentName: doc.Name,
				RawContent:   []*entity.SliceContent{sc},
				ByteCount:    0,
				CharCount:    0,
				Sequence:     int64(len(result.Slices)),
			}
			for j := range row {
				colSchema, found := rev[j]
				if !found { // 列裁剪
					continue
				}

				val := row[j]
				s.ByteCount += int64(len(val))
				s.CharCount += int64(utf8.RuneCountInString(val))

				if isAppend {
					data, err := assertValAs(colSchema.Type, val)
					if err != nil {
						return nil, err
					}
					tbl.Columns[j] = *data
				} else {
					exp := assertVal(val)
					colSchema.Type = transformColumnType(colSchema.Type, exp.Type)
					tbl.Columns[j] = entity.TableColumnData{
						Type:      entity.TableColumnTypeUnknown,
						ValString: &val,
					}
				}
			}
			result.Slices = append(result.Slices, s)
		}

		i++
		if ps.RowsCount != 0 && len(result.Slices) == ps.RowsCount {
			break
		}
	}

	if !isAppend {
		for _, col := range result.TableSchema {
			if col.Type == entity.TableColumnTypeUnknown {
				col.Type = entity.TableColumnTypeString
			}
		}
		if err = alignTableSliceValue(result.TableSchema, result.Slices); err != nil {
			return nil, err
		}
	}

	return result, nil
}
