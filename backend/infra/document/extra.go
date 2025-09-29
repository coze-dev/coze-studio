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
	"fmt"

	"github.com/cloudwego/eino/schema"
)

const (
	MetaDataKeyColumns     = "table_columns"      // val: []*Column
	MetaDataKeyColumnData  = "table_column_data"  // val: []*ColumnData
	MetaDataKeyColumnsOnly = "table_columns_only" // val: struct{}, which means table has no data, only header.

	MetaDataKeyCreatorID       = "creator_id"       // val: int64
	MetaDataKeyExternalStorage = "external_storage" // val: map[string]any
)

func GetDocumentColumns(doc *schema.Document) ([]*Column, error) {
	if doc == nil || doc.MetaData == nil {
		return nil, fmt.Errorf("invalid document")
	}

	columns, ok := doc.MetaData[MetaDataKeyColumns].([]*Column)
	if !ok {
		return nil, fmt.Errorf("invalid document columns")
	}

	return columns, nil
}

func WithDocumentColumns(doc *schema.Document, columns []*Column) *schema.Document {
	doc.MetaData[MetaDataKeyColumns] = columns
	return doc
}

func GetDocumentColumnData(doc *schema.Document) ([]*ColumnData, error) {
	if doc == nil || doc.MetaData == nil {
		return nil, fmt.Errorf("invalid document")
	}

	data, ok := doc.MetaData[MetaDataKeyColumnData].([]*ColumnData)
	if !ok {
		return nil, fmt.Errorf("invalid document column data")
	}

	return data, nil
}

func WithDocumentColumnData(doc *schema.Document, data []*ColumnData) *schema.Document {
	doc.MetaData[MetaDataKeyColumnData] = data
	return doc
}

func WithDocumentColumnsOnly(doc *schema.Document) *schema.Document {
	doc.MetaData[MetaDataKeyColumnsOnly] = struct{}{}
	return doc
}

func GetDocumentColumnsOnly(doc *schema.Document) (bool, error) {
	if doc == nil || doc.MetaData == nil {
		return false, fmt.Errorf("invalid document")
	}

	_, ok := doc.MetaData[MetaDataKeyColumnsOnly].(struct{})
	return ok, nil
}

func GetDocumentsColumnsOnly(docs []*schema.Document) (bool, error) {
	if len(docs) != 1 {
		return false, nil
	}

	return GetDocumentColumnsOnly(docs[0])
}

func GetDocumentCreatorID(doc *schema.Document) (int64, error) {
	if doc == nil || doc.MetaData == nil {
		return 0, fmt.Errorf("invalid document")
	}

	creatorID, ok := doc.MetaData[MetaDataKeyCreatorID].(int64)
	if !ok {
		return 0, fmt.Errorf("invalid document creator id")
	}

	return creatorID, nil
}

func WithDocumentCreatorID(doc *schema.Document, creatorID int64) *schema.Document {
	doc.MetaData[MetaDataKeyCreatorID] = creatorID
	return doc
}

func GetDocumentExternalStorage(doc *schema.Document) (map[string]any, error) {
	if doc == nil || doc.MetaData == nil {
		return nil, fmt.Errorf("invalid document")
	}

	data, ok := doc.MetaData[MetaDataKeyExternalStorage].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid document external storage")
	}

	return data, nil
}

func WithDocumentExternalStorage(doc *schema.Document, externalStorage map[string]any) *schema.Document {
	doc.MetaData[MetaDataKeyExternalStorage] = externalStorage
	return doc
}
