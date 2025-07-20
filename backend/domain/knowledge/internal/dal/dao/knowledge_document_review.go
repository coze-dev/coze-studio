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

package dao

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/query"
)

type KnowledgeDocumentReviewDAO struct {
	DB    *gorm.DB
	Query *query.Query
}

func (dao *KnowledgeDocumentReviewDAO) CreateInBatches(ctx context.Context, reviews []*model.KnowledgeDocumentReview) error {
	return dao.Query.KnowledgeDocumentReview.WithContext(ctx).Debug().CreateInBatches(reviews, len(reviews))
}

func (dao *KnowledgeDocumentReviewDAO) MGetByIDs(ctx context.Context, reviewIDs []int64) ([]*model.KnowledgeDocumentReview, error) {
	return dao.Query.KnowledgeDocumentReview.WithContext(ctx).Debug().Where(dao.Query.KnowledgeDocumentReview.ID.In(reviewIDs...)).Find()
}

func (dao *KnowledgeDocumentReviewDAO) GetByID(ctx context.Context, reviewID int64) (*model.KnowledgeDocumentReview, error) {
	return dao.Query.KnowledgeDocumentReview.WithContext(ctx).Debug().Where(dao.Query.KnowledgeDocumentReview.ID.Eq(reviewID)).First()
}
func (dao *KnowledgeDocumentReviewDAO) UpdateReview(ctx context.Context, reviewID int64, mp map[string]interface{}) error {
	_, err := dao.Query.KnowledgeDocumentReview.WithContext(ctx).Debug().Where(dao.Query.KnowledgeDocumentReview.ID.Eq(reviewID)).Updates(mp)
	return err
}
