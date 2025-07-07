package dao

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type KnowledgeDocumentUpdateConfigDAO struct {
	DB    *gorm.DB
	Query *query.Query
}

func (dao *KnowledgeDocumentUpdateConfigDAO) Create(ctx context.Context, config *model.KnowledgeDocumentUpdateConfig) error {
	return dao.Query.KnowledgeDocumentUpdateConfig.WithContext(ctx).Create(config)
}

func (dao *KnowledgeDocumentUpdateConfigDAO) BatchCreate(ctx context.Context, configs []*model.KnowledgeDocumentUpdateConfig) error {
	return dao.Query.KnowledgeDocumentUpdateConfig.WithContext(ctx).CreateInBatches(configs, len(configs))
}

func (dao *KnowledgeDocumentUpdateConfigDAO) GetByDocumentID(ctx context.Context, documentID int64) (*model.KnowledgeDocumentUpdateConfig, error) {
	q := dao.Query.KnowledgeDocumentUpdateConfig
	m, err := q.WithContext(ctx).Where(q.DocumentID.Eq(documentID)).First()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return m, nil
}

func (dao *KnowledgeDocumentUpdateConfigDAO) UpdateByDocumentID(ctx context.Context, documentID int64, mp map[string]any) error {
	q := dao.Query.KnowledgeDocumentUpdateConfig
	_, err := q.WithContext(ctx).Where(q.DocumentID.Eq(documentID)).Updates(mp)
	return err
}
func (dao *KnowledgeDocumentUpdateConfigDAO) Upsert(ctx context.Context, config *model.KnowledgeDocumentUpdateConfig) error {
	return dao.Query.KnowledgeDocumentUpdateConfig.Save(config)
}
func (dao *KnowledgeDocumentUpdateConfigDAO) DeleteByDocumentID(ctx context.Context, documentID int64) error {
	_, err := dao.Query.KnowledgeDocumentUpdateConfig.WithContext(ctx).Where(dao.Query.KnowledgeDocumentUpdateConfig.DocumentID.Eq(documentID)).Delete()
	return err
}

func (dao *KnowledgeDocumentUpdateConfigDAO) BatchGetDocumentIDsNeedUpdate(ctx context.Context, batchSize int) ([]int64, error) {
	q := dao.Query.KnowledgeDocumentUpdateConfig
	configs, err := q.WithContext(ctx).Select(q.DocumentID).Where(q.NextUpdateTime.Lt(time.Now().Truncate(24 * time.Hour).UnixMilli())).Limit(batchSize).Order(q.DocumentID.Asc()).Find()
	if err != nil {
		return nil, err
	}
	if len(configs) == 0 {
		return nil, nil
	}
	return slices.Transform(configs, func(config *model.KnowledgeDocumentUpdateConfig) int64 {
		return config.DocumentID
	}), nil
}
