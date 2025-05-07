package convertor

import (
	"fmt"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

const (
	TimeFormat = "2006-01-02 15:04:05"
)

func AssertValAs(typ entity.TableColumnType, val string) (*entity.TableColumnData, error) {
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
