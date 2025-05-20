package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type fieldMappingFn func(doc *entity.Document, enableCompactTable bool) []*searchstore.Field

type slice2DocumentFn func(ctx context.Context, slice *entity.Slice, columns []*entity.TableColumn, enableCompactTable bool) (*schema.Document, error)

type document2SliceFn func(doc *schema.Document, knowledgeID, documentID, creatorID int64) (*entity.Slice, error)

var fMapping = map[entity.DocumentType]fieldMappingFn{
	entity.DocumentTypeText: func(doc *entity.Document, enableCompactTable bool) []*searchstore.Field {
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
				Name: "document_id",
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
	entity.DocumentTypeTable: func(doc *entity.Document, enableCompactTable bool) []*searchstore.Field {
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
				Name: "document_id",
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
}

var s2dMapping = map[entity.DocumentType]slice2DocumentFn{
	entity.DocumentTypeText: func(ctx context.Context, slice *entity.Slice, columns []*entity.TableColumn, enableCompactTable bool) (doc *schema.Document, err error) {
		doc = &schema.Document{
			ID:      strconv.FormatInt(slice.ID, 10),
			Content: slice.GetSliceContent(),
			MetaData: map[string]any{
				document.MetaDataKeyCreatorID: slice.CreatorID,
				document.MetaDataKeyExternalStorage: map[string]any{
					"document_id": slice.DocumentID,
				},
			},
		}

		return doc, nil
	},
	entity.DocumentTypeTable: func(ctx context.Context, slice *entity.Slice, columns []*entity.TableColumn, enableCompactTable bool) (doc *schema.Document, err error) {
		ext := map[string]any{
			"document_id": slice.DocumentID,
		}

		doc = &schema.Document{
			ID:      strconv.FormatInt(slice.ID, 10),
			Content: "",
			MetaData: map[string]any{
				document.MetaDataKeyCreatorID:       slice.CreatorID,
				document.MetaDataKeyExternalStorage: ext,
			},
		}

		if len(slice.RawContent) == 0 || slice.RawContent[0].Type != entity.SliceContentTypeTable || slice.RawContent[0].Table == nil {
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
				fm[val.ColumnName] = col
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
}

var d2sMapping = map[entity.DocumentType]document2SliceFn{
	entity.DocumentTypeText: func(doc *schema.Document, knowledgeID, documentID, creatorID int64) (*entity.Slice, error) {
		slice := &entity.Slice{
			Info:        common.Info{},
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

		slice.RawContent = append(slice.RawContent, &entity.SliceContent{
			Type: entity.SliceContentTypeText,
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
			if documentID, ok := ext["document_id"].(int64); ok {
				slice.DocumentID = documentID
			}
		}

		return slice, nil
	},
	entity.DocumentTypeTable: func(doc *schema.Document, knowledgeID, documentID, creatorID int64) (*entity.Slice, error) {
		// NOTICE: table 类型的原始数据需要去 rdb 里查
		slice := &entity.Slice{
			Info:        common.Info{},
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
			if documentID, ok := ext["document_id"].(int64); ok {
				slice.DocumentID = documentID
			}
		}

		if vals, err := document.GetDocumentColumnData(doc); err == nil {
			slice.RawContent = append(slice.RawContent, &entity.SliceContent{
				Type:  entity.SliceContentTypeTable,
				Table: &entity.SliceTable{Columns: vals},
			})
		}

		return slice, nil
	},
}
