package dao

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
	"gorm.io/gorm"
)

type KnowledgeDocumentReviewRepo interface {
	CreateInBatches(ctx context.Context, reviews []*model.KnowledgeDocumentReview) error
	MGetByIDs(ctx context.Context, reviewIDs []int64) ([]*model.KnowledgeDocumentReview, error)
	GetByID(ctx context.Context, reviewID int64) (*model.KnowledgeDocumentReview, error)
	UpdateReview(ctx context.Context, reviewID int64, mp map[string]interface{}) error
}
type knowledgeDocumentReviewDAO struct {
	db    *gorm.DB
	query *query.Query
}

func NewKnowledgeDocumentReviewDAO(db *gorm.DB) KnowledgeDocumentReviewRepo {
	return &knowledgeDocumentReviewDAO{db: db, query: query.Use(db)}
}

func (dao *knowledgeDocumentReviewDAO) CreateInBatches(ctx context.Context, reviews []*model.KnowledgeDocumentReview) error {
	return dao.query.KnowledgeDocumentReview.WithContext(ctx).Debug().CreateInBatches(reviews, len(reviews))
}

func (dao *knowledgeDocumentReviewDAO) MGetByIDs(ctx context.Context, reviewIDs []int64) ([]*model.KnowledgeDocumentReview, error) {
	return dao.query.KnowledgeDocumentReview.WithContext(ctx).Debug().Where(dao.query.KnowledgeDocumentReview.ID.In(reviewIDs...)).Find()
}

func (dao *knowledgeDocumentReviewDAO) GetByID(ctx context.Context, reviewID int64) (*model.KnowledgeDocumentReview, error) {
	return dao.query.KnowledgeDocumentReview.WithContext(ctx).Debug().Where(dao.query.KnowledgeDocumentReview.ID.Eq(reviewID)).First()
}
func (dao *knowledgeDocumentReviewDAO) UpdateReview(ctx context.Context, reviewID int64, mp map[string]interface{}) error {
	_, err := dao.query.KnowledgeDocumentReview.WithContext(ctx).Debug().Where(dao.query.KnowledgeDocumentReview.ID.Eq(reviewID)).Updates(mp)
	return err
}
