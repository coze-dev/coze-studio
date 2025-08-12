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

package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

const fieldNameDocumentID = "document_id"

type fieldMappingFn func(doc *entity.Document, enableCompactTable bool) []*searchstore.Field

type slice2DocumentFn func(ctx context.Context, slice *entity.Slice, columns []*entity.TableColumn, enableCompactTable bool) (*schema.Document, error)

type document2SliceFn func(doc *schema.Document, knowledgeID, documentID, creatorID int64) (*entity.Slice, error)

var fMapping = map[knowledge.DocumentType]fieldMappingFn{
	knowledge.DocumentTypeText: func(doc *entity.Document, enableCompactTable bool) []*searchstore.Field {
		fields := []*searchstore.Field{
			{
				Name:      searchstore.FieldID,
				Type:      searchstore.FieldTypeInt64,
				IsPrimary: true,
			},
			{
				Name: searchstore.FieldCreatorID,
				Type: searchstore.FieldTypeInt64,
			},
			{
				Name: fieldNameDocumentID,
				Type: searchstore.FieldTypeInt64,
			},
			{
				Name:     searchstore.FieldTextContent,
				Type:     searchstore.FieldTypeText,
				Indexing: true,
			},
		}
		return fields
	},
	knowledge.DocumentTypeTable: func(doc *entity.Document, enableCompactTable bool) []*searchstore.Field {
		fields := []*searchstore.Field{
			{
				Name:      searchstore.FieldID,
				Type:      searchstore.FieldTypeInt64,
				IsPrimary: true,
			},
			{
				Name: searchstore.FieldCreatorID,
				Type: searchstore.FieldTypeInt64,
			},
			{
				Name: fieldNameDocumentID,
				Type: searchstore.FieldTypeInt64,
			},
		}

		if enableCompactTable {
			fields = append(fields, &searchstore.Field{
				Name:     searchstore.FieldTextContent,
				Type:     searchstore.FieldTypeText,
				Indexing: true,
			})
		} else {
			for _, col := range doc.TableInfo.Columns {
				if !col.Indexing {
					continue
				}
				fields = append(fields, &searchstore.Field{
					Name:     getColName(col.ID),
					Type:     searchstore.FieldTypeText,
					Indexing: true,
				})
			}
		}
		return fields
	},
	knowledge.DocumentTypeImage: func(doc *entity.Document, enableCompactTable bool) []*searchstore.Field {
		fields := []*searchstore.Field{
			{
				Name:      searchstore.FieldID,
				Type:      searchstore.FieldTypeInt64,
				IsPrimary: true,
			},
			{
				Name: searchstore.FieldCreatorID,
				Type: searchstore.FieldTypeInt64,
			},
			{
				Name: fieldNameDocumentID,
				Type: searchstore.FieldTypeInt64,
			},
			{
				Name:     searchstore.FieldTextContent,
				Type:     searchstore.FieldTypeText,
				Indexing: true,
			},
		}
		return fields
	},
}

var s2dMapping = map[knowledge.DocumentType]slice2DocumentFn{
	knowledge.DocumentTypeText: func(ctx context.Context, slice *entity.Slice, columns []*entity.TableColumn, enableCompactTable bool) (doc *schema.Document, err error) {
		doc = &schema.Document{
			ID:      strconv.FormatInt(slice.ID, 10),
			Content: slice.GetSliceContent(),
			MetaData: map[string]any{
				document.MetaDataKeyCreatorID: slice.CreatorID,
				document.MetaDataKeyExternalStorage: map[string]any{
					fieldNameDocumentID: slice.DocumentID,
				},
			},
		}

		return doc, nil
	},
	knowledge.DocumentTypeTable: func(ctx context.Context, slice *entity.Slice, columns []*entity.TableColumn, enableCompactTable bool) (doc *schema.Document, err error) {
		ext := map[string]any{
			fieldNameDocumentID: slice.DocumentID,
		}

		doc = &schema.Document{
			ID:      strconv.FormatInt(slice.ID, 10),
			Content: "",
			MetaData: map[string]any{
				document.MetaDataKeyCreatorID:       slice.CreatorID,
				document.MetaDataKeyExternalStorage: ext,
			},
		}

		if len(slice.RawContent) == 0 || slice.RawContent[0].Type != knowledgeModel.SliceContentTypeTable || slice.RawContent[0].Table == nil {
			return nil, fmt.Errorf("[s2dMapping] columns data not provided")
		}

		fm := make(map[string]any)
		vals := slice.RawContent[0].Table.Columns
		colIDMapping := convert.ColumnIDMapping(convert.FilterColumnsRDBID(columns))

		for _, val := range vals {
			col, found := colIDMapping[val.ColumnID]
			if !found {
				return nil, fmt.Errorf("[s2dMapping] column not found, id=%d, name=%s", val.ColumnID, val.ColumnName)
			}
			if !col.Indexing {
				continue
			}
			if enableCompactTable {
				fm[val.ColumnName] = val.GetValue()
			} else {
				ext[getColName(col.ID)] = val.GetValue()
			}
		}

		if len(fm) > 0 {
			b, err := json.Marshal(fm)
			if err != nil {
				return nil, fmt.Errorf("[s2dMapping] json marshal failed, %w", err)
			}
			doc.Content = string(b)
		}

		return doc, nil
	},
	knowledge.DocumentTypeImage: func(ctx context.Context, slice *entity.Slice, columns []*entity.TableColumn, enableCompactTable bool) (*schema.Document, error) {
		doc := &schema.Document{
			ID:      strconv.FormatInt(slice.ID, 10),
			Content: slice.GetSliceContent(),
			MetaData: map[string]any{
				document.MetaDataKeyCreatorID: slice.CreatorID,
				document.MetaDataKeyExternalStorage: map[string]any{
					fieldNameDocumentID: slice.DocumentID,
				},
			},
		}

		return doc, nil
	},
}

var d2sMapping = map[knowledge.DocumentType]document2SliceFn{
	knowledge.DocumentTypeText: func(doc *schema.Document, knowledgeID, documentID, creatorID int64) (*entity.Slice, error) {
		slice := &entity.Slice{
			Info:        knowledge.Info{},
			KnowledgeID: knowledgeID,
			DocumentID:  documentID,
			RawContent:  nil,
		}

		if doc.ID != "" {
			id, err := strconv.ParseInt(doc.ID, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("[d2sMapping] parse id failed, %w", err)
			}

			slice.ID = id
		}

		slice.RawContent = append(slice.RawContent, &knowledgeModel.SliceContent{
			Type: knowledgeModel.SliceContentTypeText,
			Text: ptr.Of(doc.Content),
		})

		if creatorID != 0 {
			slice.CreatorID = creatorID
		} else {
			cid, err := document.GetDocumentCreatorID(doc)
			if err != nil {
				return nil, err
			}
			slice.CreatorID = cid
		}

		if ext, err := document.GetDocumentExternalStorage(doc); err == nil {
			if documentID, ok := ext[fieldNameDocumentID].(int64); ok {
				slice.DocumentID = documentID
			}
		}

		return slice, nil
	},
	knowledge.DocumentTypeTable: func(doc *schema.Document, knowledgeID, documentID, creatorID int64) (*entity.Slice, error) {
		// NOTICE: The original data source of table type needs to be checked in rdb
		slice := &entity.Slice{
			Info:        knowledge.Info{},
			KnowledgeID: knowledgeID,
			DocumentID:  documentID,
			RawContent:  nil,
		}

		if doc.ID != "" {
			id, err := strconv.ParseInt(doc.ID, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("[d2sMapping] parse id failed, %w", err)
			}
			slice.ID = id
		}

		if creatorID != 0 {
			slice.CreatorID = creatorID
		} else {
			cid, err := document.GetDocumentCreatorID(doc)
			if err != nil {
				return nil, err
			}
			slice.CreatorID = cid
		}

		if ext, err := document.GetDocumentExternalStorage(doc); err == nil {
			if documentID, ok := ext[fieldNameDocumentID].(int64); ok {
				slice.DocumentID = documentID
			}
		}

		if vals, err := document.GetDocumentColumnData(doc); err == nil {
			slice.RawContent = append(slice.RawContent, &knowledgeModel.SliceContent{
				Type:  knowledgeModel.SliceContentTypeTable,
				Table: &knowledgeModel.SliceTable{Columns: vals},
			})
		}

		return slice, nil
	},
	knowledge.DocumentTypeImage: func(doc *schema.Document, knowledgeID, documentID, creatorID int64) (*entity.Slice, error) {
		slice := &entity.Slice{
			Info:        knowledge.Info{},
			KnowledgeID: knowledgeID,
			DocumentID:  documentID,
			RawContent:  nil,
		}

		if doc.ID != "" {
			id, err := strconv.ParseInt(doc.ID, 10, 64)
			if err != nil {
				return nil, fmt.Errorf("[d2sMapping] parse id failed, %w", err)
			}

			slice.ID = id
		}

		slice.RawContent = append(slice.RawContent, &knowledgeModel.SliceContent{
			Type: knowledgeModel.SliceContentTypeText,
			Text: ptr.Of(doc.Content),
		})

		if creatorID != 0 {
			slice.CreatorID = creatorID
		} else {
			cid, err := document.GetDocumentCreatorID(doc)
			if err != nil {
				return nil, err
			}
			slice.CreatorID = cid
		}

		if ext, err := document.GetDocumentExternalStorage(doc); err == nil {
			if documentID, ok := ext[fieldNameDocumentID].(int64); ok {
				slice.DocumentID = documentID
			}
		}

		return slice, nil
	},
}

func getCollectionName(knowledgeID int64) string {
	return fmt.Sprintf("opencoze_%d", knowledgeID)
}

func getIndexingFields(fields []*searchstore.Field) []string {
	var indexingFields []string
	for _, field := range fields {
		if field.Indexing {
			indexingFields = append(indexingFields, field.Name)
		}
	}
	return indexingFields
}

func getColName(colID int64) string {
	return fmt.Sprintf("col_%d", colID)
}
