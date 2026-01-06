/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package convert

import (
	"fmt"
	"reflect"
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

const timeFormat = "2006-01-02 15:04:05"

func TransformColumnType(src, dst document.TableColumnType) document.TableColumnType {
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

const columnPrefix = "c_%d"

func ColumnIDToRDBField(colID int64) string {
	return fmt.Sprintf(columnPrefix, colID)
}

func ParseAnyData(col *entity.TableColumn, data any) (*document.ColumnData, error) {
	resp := &document.ColumnData{
		ColumnID:   col.ID,
		ColumnName: col.Name,
		Type:       col.Type,
	}
	if data == nil {
		return resp, nil
	}

	switch col.Type {
	case document.TableColumnTypeString:
		switch v := data.(type) {
		case string:
			resp.ValString = ptr.Of(v)
		case []byte:
			resp.ValString = ptr.Of(string(v))
		default:
			return nil, fmt.Errorf("[ParseAnyData] type assertion failed")
		}
	case document.TableColumnTypeInteger:
		switch data.(type) {
		case int, int8, int16, int32, int64:
			resp.ValInteger = ptr.Of(reflect.ValueOf(data).Int())
		case uint, uint8, uint16, uint32, uint64, uintptr:
			resp.ValInteger = ptr.Of(int64(reflect.ValueOf(data).Uint()))
		default:
			return nil, fmt.Errorf("[ParseAnyData] type assertion failed")
		}
	case document.TableColumnTypeTime:
		if t, ok := data.(time.Time); ok {
			resp.ValTime = &t
		} else if b, ok := data.([]byte); ok {
			t, err := time.Parse(timeFormat, string(b))
			if err != nil {
				return nil, fmt.Errorf("[ParseAnyData] format time failed, %w", err)
			}
			resp.ValTime = &t
		} else {
			return nil, fmt.Errorf("[ParseAnyData] type assertion failed")
		}
	case document.TableColumnTypeNumber:
		switch data.(type) {
		case float32, float64:
			resp.ValNumber = ptr.Of(reflect.ValueOf(data).Float())
		default:
			return nil, fmt.Errorf("[ParseAnyData] type assertion failed")
		}
	case document.TableColumnTypeBoolean:
		switch data.(type) {
		case bool:
			resp.ValBoolean = ptr.Of(data.(bool))
		case int, int8, int16, int32, int64:
			if reflect.ValueOf(data).Int() >= 1 {
				resp.ValBoolean = ptr.Of(true)
			} else {
				resp.ValBoolean = ptr.Of(false)
			}
		case uint, uint8, uint16, uint32, uint64, uintptr:
			resp.ValInteger = ptr.Of(int64(reflect.ValueOf(data).Uint()))
			if reflect.ValueOf(data).Int() >= 1 {
				resp.ValBoolean = ptr.Of(true)
			} else {
				resp.ValBoolean = ptr.Of(false)
			}
		default:
			return nil, fmt.Errorf("[ParseAnyData] type assertion failed")
		}
	case document.TableColumnTypeImage:
		switch v := data.(type) {
		case string:
			resp.ValImage = ptr.Of(v)
		case []byte:
			resp.ValImage = ptr.Of(string(v))
		default:
			return nil, fmt.Errorf("[ParseAnyData] type assertion failed")
		}
	default:
		return nil, fmt.Errorf("[ParseAnyData] column type not support, type=%d", col.Type)
	}

	return resp, nil
}

func FilterColumnsRDBID(cols []*entity.TableColumn) []*entity.TableColumn {
	for i := len(cols) - 1; i >= 0; i-- {
		if cols[i].Name == consts.RDBFieldID {
			cols = append(cols[:i], cols[i+1:]...)
			break
		}
	}
	return cols
}

func ColumnIDMapping(cols []*entity.TableColumn) map[int64]*entity.TableColumn {
	resp := make(map[int64]*entity.TableColumn, len(cols))
	for i := range cols {
		col := cols[i]
		resp[col.ID] = col
	}
	return resp
}
