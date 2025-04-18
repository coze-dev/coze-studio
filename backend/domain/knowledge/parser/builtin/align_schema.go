package builtin

import (
	"fmt"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

func alignTableSchema(a, b []*entity.TableColumn) error {
	if len(a) != len(b) {
		return fmt.Errorf("[alignTableSchema] length not same")
	}

	for i := range a {
		colA := a[i]
		colB := b[i]
		if colA.Name != colB.Name {
			return fmt.Errorf("[alignTableSchema] col name invalid, expect=%s, got=%s", colA.Name, colB.Name)
		}
	}

	return nil
}

func alignTableSliceValue(schema []*entity.TableColumn, slices []*entity.Slice) error {
	for _, slice := range slices {
		tbl := slice.RawContent[0].Table
		for i, col := range tbl.Columns {
			newCol, err := assertValAs(schema[i].Type, *col.ValString)
			if err != nil {
				return err
			}

			tbl.Columns[i] = *newCol
		}
	}

	return nil
}

func transformColumnType(src, dst entity.TableColumnType) entity.TableColumnType {
	if src == entity.TableColumnTypeUnknown {
		return dst
	}
	if dst == entity.TableColumnTypeUnknown {
		return src
	}
	if dst == entity.TableColumnTypeString {
		return dst
	}
	if src == dst {
		return dst
	}
	if src == entity.TableColumnTypeInteger && dst == entity.TableColumnTypeNumber {
		return dst
	}
	return entity.TableColumnTypeString
}

func assertVal(val string) entity.TableColumnData {
	// TODO: 先不处理 image
	if val == "" {
		return entity.TableColumnData{
			Type:      entity.TableColumnTypeUnknown,
			ValString: &val,
		}
	}
	if t, err := strconv.ParseBool(val); err == nil {
		return entity.TableColumnData{
			Type:       entity.TableColumnTypeBoolean,
			ValBoolean: &t,
		}
	}
	if i, err := strconv.ParseInt(val, 10, 64); err == nil {
		return entity.TableColumnData{
			Type:       entity.TableColumnTypeInteger,
			ValInteger: &i,
		}
	}
	if f, err := strconv.ParseFloat(val, 64); err == nil {
		return entity.TableColumnData{
			Type:      entity.TableColumnTypeNumber,
			ValNumber: &f,
		}
	}
	if t, err := time.Parse(val, time.RFC3339); err == nil {
		return entity.TableColumnData{
			Type:    entity.TableColumnTypeTime,
			ValTime: &t,
		}
	}
	return entity.TableColumnData{
		Type:      entity.TableColumnTypeString,
		ValString: &val,
	}
}

func assertValAs(typ entity.TableColumnType, val string) (*entity.TableColumnData, error) {
	// TODO: 先不处理 image
	switch typ {
	case entity.TableColumnTypeString:
		return &entity.TableColumnData{
			Type:      entity.TableColumnTypeString,
			ValString: &val,
		}, nil

	case entity.TableColumnTypeInteger:
		i, err := strconv.ParseInt(val, 10, 64)
		if err != nil {
			return nil, err
		}
		return &entity.TableColumnData{
			Type:       entity.TableColumnTypeInteger,
			ValInteger: &i,
		}, nil

	case entity.TableColumnTypeTime:
		t, err := time.Parse(val, time.RFC3339)
		if err != nil {
			return nil, err
		}
		return &entity.TableColumnData{
			Type:    entity.TableColumnTypeTime,
			ValTime: &t,
		}, nil

	case entity.TableColumnTypeNumber:
		f, err := strconv.ParseFloat(val, 64)
		if err != nil {
			return nil, err
		}

		return &entity.TableColumnData{
			Type:      entity.TableColumnTypeNumber,
			ValNumber: &f,
		}, nil

	case entity.TableColumnTypeBoolean:
		t, err := strconv.ParseBool(val)
		if err != nil {
			return nil, err
		}
		return &entity.TableColumnData{
			Type:       entity.TableColumnTypeBoolean,
			ValBoolean: &t,
		}, nil

	default:
		return nil, fmt.Errorf("[assertValAs] type not support, type=%d, val=%s", typ, val)
	}
}
