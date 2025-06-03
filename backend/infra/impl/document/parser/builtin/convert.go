package builtin

import (
	"fmt"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

const (
	timeFormat = "2006-01-02 15:04:05"
)

func assertValAs(typ document.TableColumnType, val string) (*document.ColumnData, error) {
	if val == "" {
		return &document.ColumnData{
			Type: typ,
		}, nil
	}

	// TODO: 先不处理 image
	switch typ {
	case document.TableColumnTypeString:
		return &document.ColumnData{
			Type:      document.TableColumnTypeString,
			ValString: &val,
		}, nil

	case document.TableColumnTypeInteger:
		i, err := strconv.ParseInt(val, 10, 64)
		if err != nil {
			return nil, err
		}
		return &document.ColumnData{
			Type:       document.TableColumnTypeInteger,
			ValInteger: &i,
		}, nil

	case document.TableColumnTypeTime:
		if val == "" {
			var emptyTime time.Time
			return &document.ColumnData{
				Type:    document.TableColumnTypeTime,
				ValTime: ptr.Of(emptyTime),
			}, nil
		}
		// 支持时间戳和时间字符串
		i, err := strconv.ParseInt(val, 10, 64)
		if err == nil {
			t := time.Unix(i, 0)
			return &document.ColumnData{
				Type:    document.TableColumnTypeTime,
				ValTime: &t,
			}, nil

		}
		t, err := time.Parse(timeFormat, val)
		if err != nil {
			return nil, err
		}
		return &document.ColumnData{
			Type:    document.TableColumnTypeTime,
			ValTime: &t,
		}, nil

	case document.TableColumnTypeNumber:
		f, err := strconv.ParseFloat(val, 64)
		if err != nil {
			return nil, err
		}

		return &document.ColumnData{
			Type:      document.TableColumnTypeNumber,
			ValNumber: &f,
		}, nil

	case document.TableColumnTypeBoolean:
		t, err := strconv.ParseBool(val)
		if err != nil {
			return nil, err
		}
		return &document.ColumnData{
			Type:       document.TableColumnTypeBoolean,
			ValBoolean: &t,
		}, nil

	default:
		return nil, fmt.Errorf("[assertValAs] type not support, type=%d, val=%s", typ, val)
	}
}

func assertValAsForce(typ document.TableColumnType, val string, nullable bool) *document.ColumnData {
	cd := &document.ColumnData{
		Type: typ,
	}
	// TODO: 先不处理 image
	switch typ {
	case document.TableColumnTypeString:
		cd.ValString = &val
	case document.TableColumnTypeInteger:
		if i, err := strconv.ParseInt(val, 10, 64); err == nil {
			cd.ValInteger = ptr.Of(i)
		} else if !nullable {
			cd.ValInteger = ptr.Of(int64(0))
		}
	case document.TableColumnTypeTime:
		if t, err := time.Parse(timeFormat, val); err == nil {
			cd.ValTime = ptr.Of(t)
		} else if !nullable {
			cd.ValTime = ptr.Of(time.Time{})
		}
	case document.TableColumnTypeNumber:
		if f, err := strconv.ParseFloat(val, 64); err == nil {
			cd.ValNumber = ptr.Of(f)
		} else if !nullable {
			cd.ValNumber = ptr.Of(0.0)
		}
	case document.TableColumnTypeBoolean:
		if t, err := strconv.ParseBool(val); err == nil {
			cd.ValBoolean = ptr.Of(t)
		} else if !nullable {
			cd.ValBoolean = ptr.Of(false)
		}
	default:
		cd.ValString = &val
	}

	return cd
}

func assertVal(val string) document.ColumnData {
	// TODO: 先不处理 image
	if val == "" {
		return document.ColumnData{
			Type:      document.TableColumnTypeUnknown,
			ValString: &val,
		}
	}
	if t, err := strconv.ParseBool(val); err == nil {
		return document.ColumnData{
			Type:       document.TableColumnTypeBoolean,
			ValBoolean: &t,
		}
	}
	if i, err := strconv.ParseInt(val, 10, 64); err == nil {
		return document.ColumnData{
			Type:       document.TableColumnTypeInteger,
			ValInteger: &i,
		}
	}
	if f, err := strconv.ParseFloat(val, 64); err == nil {
		return document.ColumnData{
			Type:      document.TableColumnTypeNumber,
			ValNumber: &f,
		}
	}
	if t, err := time.Parse(timeFormat, val); err == nil {
		return document.ColumnData{
			Type:    document.TableColumnTypeTime,
			ValTime: &t,
		}
	}
	return document.ColumnData{
		Type:      document.TableColumnTypeString,
		ValString: &val,
	}
}

func transformColumnType(src, dst document.TableColumnType) document.TableColumnType {
	if src == document.TableColumnTypeUnknown {
		return dst
	}
	if dst == document.TableColumnTypeUnknown {
		return src
	}
	if dst == document.TableColumnTypeString {
		return dst
	}
	if src == dst {
		return dst
	}
	if src == document.TableColumnTypeInteger && dst == document.TableColumnTypeNumber {
		return dst
	}
	return document.TableColumnTypeString
}
