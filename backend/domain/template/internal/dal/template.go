package dal

import (
	"context"
	"fmt"
	"sync"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/template/entity"
	"code.byted.org/flow/opencoze/backend/domain/template/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/template/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

var (
	once              sync.Once
	singletonTemplate *TemplateImpl
)

type TemplateImpl struct {
	IDGen idgen.IDGenerator
	query *query.Query
}

func NewTemplateDAO(db *gorm.DB, idGen idgen.IDGenerator) *TemplateImpl {
	once.Do(func() {
		singletonTemplate = &TemplateImpl{
			IDGen: idGen,
			query: query.Use(db),
		}
	})

	return singletonTemplate
}

// Create implements TemplateRepository.Create
func (t *TemplateImpl) Create(ctx context.Context, template *model.Template) (int64, error) {
	if template.ID == 0 {
		id, err := t.IDGen.GenID(ctx)
		if err != nil {
			return 0, err
		}
		template.ID = id
	}

	err := t.query.Template.WithContext(ctx).Create(template)
	if err != nil {
		return 0, err
	}

	return template.ID, nil
}

// List lists templates with filters
func (t *TemplateImpl) List(ctx context.Context, filter *entity.TemplateFilter, page *entity.Pagination, orderByField string) ([]*model.Template, int64, error) {
	res := t.query.Template

	q := res.WithContext(ctx)

	// Add filter conditions
	if filter != nil {
		if filter.AgentID != nil {
			q = q.Where(res.AgentID.Eq(*filter.AgentID))
		}

		if filter.SpaceID != nil {
			q = q.Where(res.SpaceID.Eq(*filter.SpaceID))
		}

		if filter.ProductEntityType != nil {
			q = q.Where(res.ProductEntityType.Eq(*filter.ProductEntityType))
		}
	}

	// Get total count
	count, err := q.Count()
	if err != nil {
		return nil, 0, fmt.Errorf("count templates failed: %v", err)
	}

	// Apply pagination
	limit := int64(50) // default limit
	if page != nil && page.Limit > 0 {
		limit = int64(page.Limit)
	}

	offset := 0
	if page != nil && page.Offset > 0 {
		offset = page.Offset
	}

	if len(orderByField) > 0 {
		switch orderByField {
		case "created_at":
			q = q.Order(res.CreatedAt.Desc())
		case "heat":
			q = q.Order(res.Heat.Desc())
		default:
			q = q.Order(res.CreatedAt.Desc())
		}
	} else {
		q = q.Order(res.CreatedAt.Desc())
	}

	// Execute query with pagination
	records, err := q.Limit(int(limit)).Offset(offset).Find()
	if err != nil {
		return nil, 0, fmt.Errorf("list templates failed: %v", err)
	}

	return records, count, nil
}
