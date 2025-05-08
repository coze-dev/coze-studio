package convert

import (
	"fmt"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	rdbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
)

const (
	TimeFormat = "2006-01-02 15:04:05"
)

func ConvertColumnType(columnType entity.TableColumnType) rdbEntity.DataType {
	switch columnType {
	case entity.TableColumnTypeBoolean:
		return rdbEntity.TypeBoolean
	case entity.TableColumnTypeInteger:
		return rdbEntity.TypeBigInt
	case entity.TableColumnTypeNumber:
		return rdbEntity.TypeDouble
	case entity.TableColumnTypeString, entity.TableColumnTypeImage:
		return rdbEntity.TypeText
	case entity.TableColumnTypeTime:
		return rdbEntity.TypeTimestamp
	default:
		return rdbEntity.TypeText
	}
}
func AssertValAs(typ entity.TableColumnType, val string) (*entity.TableColumnData, error) {
	if val == "" {
		return &entity.TableColumnData{
			Type: typ,
		}, nil
	}

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
		if val == "" {
			var emptyTime time.Time
			return &entity.TableColumnData{
				Type:    entity.TableColumnTypeTime,
				ValTime: ptr.Of(emptyTime),
			}, nil
		}
		// 支持时间戳和时间字符串
		i, err := strconv.ParseInt(val, 10, 64)
		if err == nil {
			t := time.Unix(i, 0)
			return &entity.TableColumnData{
				Type:    entity.TableColumnTypeTime,
				ValTime: &t,
			}, nil

		}
		t, err := time.Parse(TimeFormat, val)
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

func AssertVal(val string) entity.TableColumnData {
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
	if t, err := time.Parse(TimeFormat, val); err == nil {
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
