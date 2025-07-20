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

package repository

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/dao"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/query"
)

func NewKnowledgeDAO(db *gorm.DB) KnowledgeRepo {
	return &dao.KnowledgeDAO{DB: db, Query: query.Use(db)}
}

func NewKnowledgeDocumentDAO(db *gorm.DB) KnowledgeDocumentRepo {
	return &dao.KnowledgeDocumentDAO{DB: db, Query: query.Use(db)}
}

func NewKnowledgeDocumentReviewDAO(db *gorm.DB) KnowledgeDocumentReviewRepo {
	return &dao.KnowledgeDocumentReviewDAO{DB: db, Query: query.Use(db)}
}

func NewKnowledgeDocumentSliceDAO(db *gorm.DB) KnowledgeDocumentSliceRepo {
	return &dao.KnowledgeDocumentSliceDAO{DB: db, Query: query.Use(db)}
}

//go:generate mockgen -destination ../internal/mock/dal/dao/knowledge.go --package dao -source knowledge.go
type KnowledgeRepo interface {
	Create(ctx context.Context, knowledge *model.Knowledge) error
	Upsert(ctx context.Context, knowledge *model.Knowledge) error
	Update(ctx context.Context, knowledge *model.Knowledge) error
	Delete(ctx context.Context, id int64) error
	GetByID(ctx context.Context, id int64) (*model.Knowledge, error)
	MGetByID(ctx context.Context, ids []int64) ([]*model.Knowledge, error)
	FilterEnableKnowledge(ctx context.Context, ids []int64) ([]*model.Knowledge, error)
	InitTx() (tx *gorm.DB, err error)
	UpdateWithTx(ctx context.Context, tx *gorm.DB, knowledgeID int64, updateMap map[string]interface{}) error
	FindKnowledgeByCondition(ctx context.Context, opts *entity.WhereKnowledgeOption) ([]*model.Knowledge, int64, error)
}

//go:generate mockgen -destination ../internal/mock/dal/dao/knowledge_document.go --package dao -source knowledge_document.go
type KnowledgeDocumentRepo interface {
	Create(ctx context.Context, document *model.KnowledgeDocument) error
	Update(ctx context.Context, document *model.KnowledgeDocument) error
	Delete(ctx context.Context, id int64) error
	MGetByID(ctx context.Context, ids []int64) ([]*model.KnowledgeDocument, error)
	GetByID(ctx context.Context, id int64) (*model.KnowledgeDocument, error)
	FindDocumentByCondition(ctx context.Context, opts *entity.WhereDocumentOpt) (
		[]*model.KnowledgeDocument, int64, error)
	DeleteDocuments(ctx context.Context, ids []int64) error
	SetStatus(ctx context.Context, documentID int64, status int32, reason string) error
	CreateWithTx(ctx context.Context, tx *gorm.DB, document []*model.KnowledgeDocument) error
	UpdateDocumentSliceInfo(ctx context.Context, documentID int64) error
}

type KnowledgeDocumentReviewRepo interface {
	CreateInBatches(ctx context.Context, reviews []*model.KnowledgeDocumentReview) error
	MGetByIDs(ctx context.Context, reviewIDs []int64) ([]*model.KnowledgeDocumentReview, error)
	GetByID(ctx context.Context, reviewID int64) (*model.KnowledgeDocumentReview, error)
	UpdateReview(ctx context.Context, reviewID int64, mp map[string]interface{}) error
}

//go:generate mockgen -destination ../../mock/dal/dao/knowledge_document_slice.go --package dao -source knowledge_document_slice.go
type KnowledgeDocumentSliceRepo interface {
	Create(ctx context.Context, slice *model.KnowledgeDocumentSlice) error
	Update(ctx context.Context, slice *model.KnowledgeDocumentSlice) error
	Delete(ctx context.Context, slice *model.KnowledgeDocumentSlice) error

	BatchCreate(ctx context.Context, slices []*model.KnowledgeDocumentSlice) error
	BatchSetStatus(ctx context.Context, ids []int64, status int32, reason string) error
	DeleteByDocument(ctx context.Context, documentID int64) error
	MGetSlices(ctx context.Context, sliceIDs []int64) ([]*model.KnowledgeDocumentSlice, error)

	FindSliceByCondition(ctx context.Context, opts *entity.WhereSliceOpt) (
		[]*model.KnowledgeDocumentSlice, int64, error)
	GetDocumentSliceIDs(ctx context.Context, docIDs []int64) (sliceIDs []int64, err error)
	GetSliceBySequence(ctx context.Context, documentID int64, sequence int64) (
		[]*model.KnowledgeDocumentSlice, error)
	IncrementHitCount(ctx context.Context, sliceIDs []int64) error
	GetSliceHitByKnowledgeID(ctx context.Context, knowledgeID int64) (int64, error)
	GetLastSequence(ctx context.Context, documentID int64) (float64, error)
}
