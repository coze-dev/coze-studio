package dal

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/cockroachdb/errors"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/internal/model"
	"code.byted.org/flow/opencoze/backend/domain/permission/openapiauth/internal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type ApiKeyDAO struct {
	IDGen   idgen.IDGenerator
	dbQuery *query.Query
}

func NewApiKeyDAO(idGen idgen.IDGenerator, db *gorm.DB) *ApiKeyDAO {
	return &ApiKeyDAO{
		IDGen:   idGen,
		dbQuery: query.Use(db),
	}
}

func (a *ApiKeyDAO) Create(ctx context.Context, data *model.APIKey) (*model.APIKey, error) {

	id, err := a.IDGen.GenID(ctx)
	if err != nil {
		return nil, errors.New("gen id failed")
	}
	data.ID = id

	hash := sha256.Sum256([]byte(fmt.Sprintf("%d", id)))
	data.Key = hex.EncodeToString(hash[:])

	err = a.dbQuery.APIKey.WithContext(ctx).Create(data)
	if err != nil {
		return nil, err
	}
	return data, nil
}
func (a *ApiKeyDAO) Delete(ctx context.Context, id int64, userID int64) error {
	_, err := a.dbQuery.APIKey.WithContext(ctx).Where(a.dbQuery.APIKey.ID.Eq(id)).Where(a.dbQuery.APIKey.UserID.Eq(userID)).Delete()
	return err
}

func (a *ApiKeyDAO) Get(ctx context.Context, id int64) (*model.APIKey, error) {
	apikey, err := a.dbQuery.APIKey.WithContext(ctx).Debug().Where(a.dbQuery.APIKey.ID.Eq(id)).First()

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return apikey, nil
}
func (a *ApiKeyDAO) FindByKey(ctx context.Context, key string) (*model.APIKey, error) {
	return a.dbQuery.APIKey.WithContext(ctx).Where(a.dbQuery.APIKey.Key.Eq(key)).First()
}

func (a *ApiKeyDAO) List(ctx context.Context, userID int64, limit int, page int) ([]*model.APIKey, bool, error) {
	do := a.dbQuery.APIKey.WithContext(ctx).Where(a.dbQuery.APIKey.UserID.Eq(userID))

	do = do.Offset((page - 1) * limit).Limit(limit + 1)

	list, err := do.Order(a.dbQuery.APIKey.CreatedAt.Desc()).Find()
	if err != nil {
		return nil, false, err
	}
	if len(list) > limit {
		return list[:limit], true, nil
	}

	return list, false, nil
}

func (a *ApiKeyDAO) Update(ctx context.Context, id int64, userID int64, columnData map[string]any) error {

	_, err := a.dbQuery.APIKey.WithContext(ctx).Where(a.dbQuery.APIKey.ID.Eq(id)).Where(a.dbQuery.APIKey.UserID.Eq(userID)).UpdateColumns(columnData)

	if err != nil {
		return err
	}
	return nil
}
