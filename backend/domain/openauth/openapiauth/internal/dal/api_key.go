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

package dal

import (
	"context"
	"crypto/md5"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth/entity"
	"github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
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

func (a *ApiKeyDAO) Create(ctx context.Context, do *entity.CreateApiKey) (*entity.ApiKey, error) {

	poData, err := a.doToPo(ctx, do)
	if err != nil {
		return nil, err
	}
	originApiKey, md5Key := a.getAPIKey(poData.ID)
	poData.APIKey = md5Key
	err = a.dbQuery.APIKey.WithContext(ctx).Create(poData)
	if err != nil {
		return nil, err
	}
	doData := a.poToDo(poData)
	doData.ApiKey = originApiKey
	return doData, nil
}

func (a *ApiKeyDAO) doToPo(ctx context.Context, do *entity.CreateApiKey) (*model.APIKey, error) {
	id, err := a.IDGen.GenID(ctx)
	if err != nil {
		return nil, errors.New("gen id failed")
	}
	po := &model.APIKey{
		ID:        id,
		Name:      do.Name,
		ExpiredAt: do.Expire,
		UserID:    do.UserID,
		AkType:    int32(do.AkType),
		CreatedAt: time.Now().Unix(),
	}
	return po, nil
}
func (a *ApiKeyDAO) poToDo(po *model.APIKey) *entity.ApiKey {
	do := &entity.ApiKey{
		ID:        po.ID,
		Name:      po.Name,
		ExpiredAt: po.ExpiredAt,
		UserID:    po.UserID,
		CreatedAt: po.CreatedAt,
	}
	return do
}

func (a *ApiKeyDAO) getAPIKey(id int64) (string, string) {
	hash := sha256.Sum256([]byte(fmt.Sprintf("%d", id)))
	apiKey := "pat_" + hex.EncodeToString(hash[:])

	md5Hash := md5.Sum([]byte(apiKey))
	md5Key := hex.EncodeToString(md5Hash[:])
	return apiKey, md5Key
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
	return a.dbQuery.APIKey.WithContext(ctx).Where(a.dbQuery.APIKey.APIKey.Eq(key)).First()
}

func (a *ApiKeyDAO) List(ctx context.Context, userID int64, limit int, page int) ([]*model.APIKey, bool, error) {
	do := a.dbQuery.APIKey.WithContext(ctx).Where(a.dbQuery.APIKey.UserID.Eq(userID))
	do = do.Where(a.dbQuery.APIKey.AkType.Eq(int32(entity.AkTypeCustomer)))
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
