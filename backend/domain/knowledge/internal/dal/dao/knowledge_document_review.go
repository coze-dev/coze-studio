package dao

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
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
