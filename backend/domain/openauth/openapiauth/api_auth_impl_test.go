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

package openapiauth

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth/entity"
	"github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth/internal/dal/model"
	mock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/internal/mock/infra/orm"
)

func TestApiAuthImpl_Create(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).Return(int64(10000000001), nil).Times(1)
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.APIKey{})
	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)
	components := &Components{
		IDGen: idGen,
		DB:    mockDB,
	}

	apiAuth := NewService(components)
	apiKey, err := apiAuth.Create(ctx, &entity.CreateApiKey{
		Name:   "test",
		Expire: time.Now().Add(time.Hour).UnixMilli(),
		UserID: 666666,
	})
	t.Logf("apiKey: %v", *apiKey)
	assert.NoError(t, err)
	assert.NotNil(t, apiKey)
	assert.Equal(t, "test", apiKey.Name)
	assert.NotEmpty(t, apiKey.ApiKey)

}

func TestApiAuthImpl_Get(t *testing.T) {
	ctx := context.Background()
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.APIKey{})
	mockDBGen.AddTable(&model.APIKey{}).
		AddRows(
			&model.APIKey{
				ID:        10000000001,
				Name:      "test",
				APIKey:    "a5f58bea9028d49143bff3ee436b2fb663291c0c6ab242f3c9dc6bf6df9f7b74",
				Status:    0,
				UserID:    666666,
				ExpiredAt: time.Now().Add(time.Hour).UnixMilli(),
				CreatedAt: time.Now().UnixMilli(),
				UpdatedAt: time.Now().UnixMilli(),
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)
	components := &Components{
		DB: mockDB,
	}
	apiAuth := NewService(components)
	apiKey, err := apiAuth.Get(ctx, &entity.GetApiKey{
		ID: 10000000001,
	})

	assert.NoError(t, err)
	assert.NotNil(t, apiKey)
	t.Logf("apiKey: %v", *apiKey)

	assert.Equal(t, "test", apiKey.Name)
}

func TestApiAuthImpl_Delete(t *testing.T) {
	ctx := context.Background()
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.APIKey{})
	mockDBGen.AddTable(&model.APIKey{}).
		AddRows(
			&model.APIKey{
				ID:        10000000001,
				Name:      "test",
				APIKey:    "df9f7b74",
				Status:    0,
				UserID:    666666,
				ExpiredAt: time.Now().Add(time.Hour).UnixMilli(),
				CreatedAt: time.Now().UnixMilli(),
				UpdatedAt: time.Now().UnixMilli(),
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)
	components := &Components{
		DB: mockDB,
	}
	apiAuth := NewService(components)
	err = apiAuth.Delete(ctx, &entity.DeleteApiKey{
		ID: 10000000001,
	})
	assert.NoError(t, err)
}

func TestApiAuthImpl_List(t *testing.T) {
	ctx := context.Background()
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.APIKey{})
	mockDBGen.AddTable(&model.APIKey{}).
		AddRows(
			&model.APIKey{
				ID:        10000000001,
				Name:      "test",
				APIKey:    "df9f7b74",
				Status:    0,
				UserID:    666666,
				ExpiredAt: time.Now().Add(time.Hour).UnixMilli(),
				CreatedAt: time.Now().UnixMilli(),
				UpdatedAt: time.Now().UnixMilli(),
			},
			&model.APIKey{
				ID:        10000000002,
				Name:      "test2",
				APIKey:    "adfadfad",
				Status:    0,
				UserID:    666666,
				ExpiredAt: time.Now().Add(time.Hour).UnixMilli(),
				CreatedAt: time.Now().Add(time.Hour).UnixMilli(),
				UpdatedAt: time.Now().UnixMilli(),
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)
	components := &Components{
		DB: mockDB,
	}
	apiAuth := NewService(components)
	apiKeys, err := apiAuth.List(ctx, &entity.ListApiKey{
		UserID: 666666,
		Limit:  1,
		Page:   1,
	})
	assert.NoError(t, err)
	assert.NotNil(t, apiKeys)
	t.Logf("apiKeys: %v", apiKeys)
	assert.Equal(t, true, apiKeys.HasMore)
	assert.Equal(t, 1, len(apiKeys.ApiKeys))

}

func TestApiAuthImpl_CheckPermission(t *testing.T) {
	ctx := context.Background()
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.APIKey{})
	mockDBGen.AddTable(&model.APIKey{}).
		AddRows(
			&model.APIKey{
				ID:        10000000001,
				Name:      "test",
				APIKey:    "df9f7b74",
				Status:    0,
				UserID:    666666,
				ExpiredAt: time.Now().Add(time.Hour).UnixMilli(),
				CreatedAt: time.Now().UnixMilli(),
				UpdatedAt: time.Now().UnixMilli(),
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)
	components := &Components{
		DB: mockDB,
	}
	apiAuth := NewService(components)
	apiKey, err := apiAuth.CheckPermission(ctx, &entity.CheckPermission{
		ApiKey: "df9f7b74",
		UserID: 666666,
	})
	assert.NoError(t, err)
	assert.Equal(t, "test", apiKey.Name)

}
