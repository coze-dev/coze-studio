package builtin

import (
	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

type rowIterator interface {
	NextRow() (row []string, end bool, err error)
}

func parseByRowIterator(iter rowIterator, config *contract.Config, opts ...parser.Option) (
	docs []*schema.Document, err error) {

	//tableSchema []*document.Column, rows [][]*document.ColumnData, err error) {

	ps := config.ParsingStrategy
	options := parser.GetCommonOptions(&parser.Options{}, opts...)
	i := 0
	isAppend := ps.IsAppend
	rev := make(map[int]*document.Column)

	var (
		expColumns []*document.Column
		expData    [][]*document.ColumnData
	)

	for {
		row, end, err := iter.NextRow()
		if err != nil {
			return nil, err
		}
		if end {
			break
		}
		if i == ps.HeaderLine {
			var columns []*document.Column
			for j, col := range row {
				columns = append(columns, &document.Column{
					Name:     col,
					Type:     document.TableColumnTypeUnknown,
					Sequence: j,
				})
			}
			if isAppend || len(ps.Columns) > 0 {
				// todo: 这个可能得返回给前端，不能作为 error
				if err = alignTableSchema(ps.Columns, columns); err != nil {
					return nil, err
				}
				columns = ps.Columns
			}

			expColumns = columns
			for j := range columns {
				tc := columns[j]
				rev[tc.Sequence] = tc
			}
		}

		if i >= ps.DataStartLine {
			var rowData []*document.ColumnData
			for j := range row {
				colSchema, found := rev[j]
				if !found { // 列裁剪
					continue
				}

				val := row[j]

				if isAppend {
					data, err := assertValAs(colSchema.Type, val)
					if err != nil {
						return nil, err
					}
					data.ColumnID = colSchema.ID
					data.ColumnName = colSchema.Name
					rowData = append(rowData, data)
				} else {
					exp := assertVal(val)
					colSchema.Type = transformColumnType(colSchema.Type, exp.Type)
					rowData = append(rowData, &document.ColumnData{
						ColumnID:   colSchema.ID,
						ColumnName: colSchema.Name,
						Type:       document.TableColumnTypeUnknown,
						ValString:  &val,
					})
				}
			}
			expData = append(expData, rowData)
		}

		i++
		if ps.RowsCount != 0 && len(docs) == ps.RowsCount {
			break
		}
	}

	if !isAppend {
		for _, col := range expColumns {
			if col.Type == document.TableColumnTypeUnknown {
				col.Type = document.TableColumnTypeString
			}
		}

		for _, row := range expData {
			if err = alignTableSliceValue(expColumns, row); err != nil {
				return nil, err
			}
		}

		doc := &schema.Document{
			MetaData: map[string]any{
				document.MetaDataKeyColumns:    expColumns,
				document.MetaDataKeyColumnData: expData,
			},
		}

		for k, v := range options.ExtraMeta {
			doc.MetaData[k] = v
		}

		docs = append(docs, doc)
	}

	return docs, nil
}
