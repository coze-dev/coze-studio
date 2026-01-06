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

package entity

type Column struct {
	Name          string // guaranteed uniqueness
	DataType      DataType
	Length        *int
	NotNull       bool
	DefaultValue  *string
	AutoIncrement bool // Indicates whether the column is automatically incremented
	Comment       *string
}

type Index struct {
	Name    string
	Type    IndexType
	Columns []string
}

type TableOption struct {
	Collate       *string
	AutoIncrement *int64 // Set the auto-increment initial value of the table
	Comment       *string
}

type Table struct {
	Name      string // guaranteed uniqueness
	Columns   []*Column
	Indexes   []*Index
	Options   *TableOption
	CreatedAt int64
	UpdatedAt int64
}

type ResultSet struct {
	Columns      []string
	Rows         []map[string]interface{}
	AffectedRows int64
}
