package convert

import (
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	dbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func DocumentToTableSchema(docID int64, doc *entity.Document) (*dbEntity.Table, error) {
	schema := &dbEntity.Table{
		Name:    strconv.FormatInt(docID, 10),
		Columns: make([]*dbEntity.Column, 0, len(doc.TableColumns)),
		Indexes: nil,
		Options: nil,
	}

	for _, col := range doc.TableColumns {
		column := &dbEntity.Column{
			Name:    col.Name,
			Comment: &col.Description,
		}

		switch col.Type {
		case entity.TableColumnTypeString:
			if col.Indexing {
				column.DataType = dbEntity.TypeVarchar
				column.Length = ptr.Of(255)
			} else {
				column.DataType = dbEntity.TypeText // todo: index 时用 varchar ?
			}
		case entity.TableColumnTypeInteger:
			column.DataType = dbEntity.TypeInt
		case entity.TableColumnTypeTime:
			column.DataType = dbEntity.TypeTimestamp
		case entity.TableColumnTypeNumber:
			column.DataType = dbEntity.TypeInt // todo: demical?
		case entity.TableColumnTypeBoolean:
			column.DataType = dbEntity.TypeBoolean
		case entity.TableColumnTypeImage:
			column.DataType = dbEntity.TypeText // todo: base64 / uri ?
		default:
			return nil, fmt.Errorf("[DocumentToTableSchema] column type not support, type=%d", col.Type)
		}

		schema.Columns = append(schema.Columns, column)
	}

	return schema, nil
}
