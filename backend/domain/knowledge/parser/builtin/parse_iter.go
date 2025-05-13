package builtin

import (
	"context"
	"unicode/utf8"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
)

type rowIterator interface {
	NextRow() (row []string, end bool, err error)
}

func parseByRowIterator(ctx context.Context, iter rowIterator, ps *entity.ParsingStrategy, doc *entity.Document) (
	tableSchema []*entity.TableColumn, slices []*entity.Slice, err error) {

	// TODO: 支持更灵活的表头对齐策略
	i := 0
	idIdx := -1
	isAppend := doc.IsAppend
	rev := make(map[int]*entity.TableColumn)

	for {
		row, end, err := iter.NextRow()
		if err != nil {
			return nil, nil, err
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
			if isAppend || len(doc.TableInfo.Columns) > 0 {
				// todo: 这个可能得返回给前端，不能作为 error
				if err = alignTableSchema(doc.TableInfo.Columns, schema); err != nil {
					return nil, nil, err
				}
				schema = doc.TableInfo.Columns
			}
			tableSchema = schema
			for j := range schema {
				tc := schema[j]
				rev[int(tc.Sequence)] = tc
				if tc.Name == consts.RDBFieldID {
					idIdx = j
				}
			}
		}

		if i >= ps.DataStartLine {
			tbl := &entity.SliceTable{
				Columns: make([]entity.TableColumnData, len(tableSchema)),
			}
			if idIdx != -1 {
				col := tableSchema[idIdx]
				tbl.Columns[idIdx] = entity.TableColumnData{
					ColumnID:   col.ID,
					ColumnName: col.Name,
					Type:       col.Type,
				}
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
				Sequence:     int64(len(slices)),
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
					data, err := convert.AssertValAs(colSchema.Type, val)
					if err != nil {
						return nil, nil, err
					}
					data.ColumnID = colSchema.ID
					data.ColumnName = colSchema.Name
					tbl.Columns[j] = *data
				} else {
					exp := convert.AssertVal(val)
					colSchema.Type = convert.TransformColumnType(colSchema.Type, exp.Type)
					tbl.Columns[j] = entity.TableColumnData{
						ColumnID:   colSchema.ID,
						ColumnName: colSchema.Name,
						Type:       entity.TableColumnTypeUnknown,
						ValString:  &val,
					}
				}
			}
			slices = append(slices, s)
		}

		i++
		if ps.RowsCount != 0 && len(slices) == ps.RowsCount {
			break
		}
	}

	if !isAppend {
		for _, col := range tableSchema {
			if col.Type == entity.TableColumnTypeUnknown {
				col.Type = entity.TableColumnTypeString
			}
		}
		if err = alignTableSliceValue(tableSchema, slices); err != nil {
			return nil, nil, err
		}
	}

	return tableSchema, slices, nil
}
