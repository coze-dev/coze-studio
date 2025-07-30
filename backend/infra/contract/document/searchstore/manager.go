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

// Built-in field name
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
