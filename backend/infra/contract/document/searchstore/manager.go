package searchstore

import (
	"context"
)

type Manager interface {
	Create(ctx context.Context, req *CreateRequest) error

	Drop(ctx context.Context, req *DropRequest) error

	GetType() SearchStoreType

	GetSearchStore(ctx context.Context, collectionName string) (SearchStore, error)
}

type CreateRequest struct {
	CollectionName string
	Fields         []*Field
	CollectionMeta map[string]string
}

type DropRequest struct {
	CollectionName string
}

type GetSearchStoreRequest struct {
	CollectionName string
}

type Field struct {
	Name        FieldName
	Type        FieldType
	Description string

	Nullable  bool
	IsPrimary bool

	Indexing bool
}

type SearchStoreType string

const (
	TypeVectorStore SearchStoreType = "vector"
	TypeTextStore   SearchStoreType = "text"
)

type FieldName = string

// 内置 field name
const (
	FieldID          FieldName = "id"           // int64
	FieldCreatorID   FieldName = "creator_id"   // int64
	FieldTextContent FieldName = "text_content" // string
)

type FieldType int64

const (
	FieldTypeUnknown      FieldType = 0
	FieldTypeInt64        FieldType = 1
	FieldTypeText         FieldType = 2
	FieldTypeDenseVector  FieldType = 3
	FieldTypeSparseVector FieldType = 4
)
