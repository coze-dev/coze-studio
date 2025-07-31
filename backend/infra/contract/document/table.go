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

package document

import (
	"strconv"
	"time"

	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type TableSchema struct {
	Name    string
	Comment string
	Columns []*Column
}

type Column struct {
	ID          int64
	Name        string
	Type        TableColumnType
	Description string
	Nullable    bool
	IsPrimary   bool
	Sequence    int // sort number
}

type TableColumnType int

const (
	TableColumnTypeUnknown TableColumnType = 0
	TableColumnTypeString  TableColumnType = 1
	TableColumnTypeInteger TableColumnType = 2
	TableColumnTypeTime    TableColumnType = 3
	TableColumnTypeNumber  TableColumnType = 4
	TableColumnTypeBoolean TableColumnType = 5
	TableColumnTypeImage   TableColumnType = 6
)

func (t TableColumnType) String() string {
	switch t {
	case TableColumnTypeString:
		return "varchar"
	case TableColumnTypeInteger:
		return "bigint"
	case TableColumnTypeTime:
		return "timestamp"
	case TableColumnTypeNumber:
		return "double"
	case TableColumnTypeBoolean:
		return "boolean"
	case TableColumnTypeImage:
		return "image"
	default:
		return "unknown"
	}
}

type ColumnData struct {
	ColumnID   int64
	ColumnName string
	Type       TableColumnType
	ValString  *string
	ValInteger *int64
	ValTime    *time.Time
	ValNumber  *float64
	ValBoolean *bool
	ValImage   *string // base64 / url
}

func (d *ColumnData) GetValue() interface{} {
	switch d.Type {
	case TableColumnTypeString:
		return d.ValString
	case TableColumnTypeInteger:
		return d.ValInteger
	case TableColumnTypeTime:
		return d.ValTime
	case TableColumnTypeNumber:
		return d.ValNumber
	case TableColumnTypeBoolean:
		return d.ValBoolean
	case TableColumnTypeImage:
		return d.ValImage
	default:
		return nil
	}
}

func (d *ColumnData) GetStringValue() string {
	switch d.Type {
	case TableColumnTypeString:
		return ptr.From(d.ValString)
	case TableColumnTypeInteger:
		return strconv.FormatInt(ptr.From(d.ValInteger), 10)
	case TableColumnTypeTime:
		return ptr.From(d.ValTime).Format(time.DateTime)
	case TableColumnTypeNumber:
		return strconv.FormatFloat(ptr.From(d.ValNumber), 'f', 20, 64)
	case TableColumnTypeBoolean:
		return strconv.FormatBool(ptr.From(d.ValBoolean))
	case TableColumnTypeImage:
		return ptr.From(d.ValImage)
	default:
		return ptr.From(d.ValString)
	}
}

func (d *ColumnData) GetNullableStringValue() string {
	switch d.Type {
	case TableColumnTypeString:
		return ptr.From(d.ValString)
	case TableColumnTypeInteger:
		if d.ValInteger == nil {
			return ""
		}
		return strconv.FormatInt(ptr.From(d.ValInteger), 10)
	case TableColumnTypeTime:
		if d.ValTime == nil {
			return ""
		}
		return ptr.From(d.ValTime).Format(time.DateTime)
	case TableColumnTypeNumber:
		if d.ValNumber == nil {
			return ""
		}
		return strconv.FormatFloat(ptr.From(d.ValNumber), 'f', 20, 64)
	case TableColumnTypeBoolean:
		if d.ValBoolean == nil {
			return ""
		}
		return strconv.FormatBool(ptr.From(d.ValBoolean))
	case TableColumnTypeImage:
		if d.ValImage == nil {
			return ""
		}
		return ptr.From(d.ValImage)
	default:
		return ptr.From(d.ValString)
	}
}
