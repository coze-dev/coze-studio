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

package database

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
)

func TestModelMgr_ListModel(t *testing.T) {
	tests := []struct {
		name      string
		req       *modelmgr.ListModelRequest
		setupMock func(sqlmock.Sqlmock)
		wantErr   bool
		checkResp func(*testing.T, *modelmgr.ListModelResponse)
	}{
		{
			name: "list models with default status",
			req: &modelmgr.ListModelRequest{
				Limit: 10,
			},
			setupMock: func(mock sqlmock.Sqlmock) {
				rows := sqlmock.NewRows([]string{
					"id", "meta_id", "name", "description", "default_params", "scenario", "status",
					"created_at", "updated_at", "deleted_at",
					"id", "model_name", "protocol", "icon_uri", "icon_url", "capability",
					"conn_config", "status", "description", "created_at", "updated_at", "deleted_at",
				}).AddRow(
					1, 1, "GPT-4", `{"zh":"GPT-4模型"}`, `[]`, 1, 1,
					1234567890, 1234567890, nil,
					1, "GPT-4", "openai", "icon.png", "", `{"function_call":true}`,
					`{"api_key":"test"}`, 1, "", 1234567890, 1234567890, nil,
				)

				mock.ExpectQuery("SELECT me.*, mm.* FROM `model_entity`").
					WithArgs([]int{0, 1}, 11).
					WillReturnRows(rows)
			},
			wantErr: false,
			checkResp: func(t *testing.T, resp *modelmgr.ListModelResponse) {
				assert.Len(t, resp.ModelList, 1)
				assert.Equal(t, int64(1), resp.ModelList[0].ID)
				assert.Equal(t, "GPT-4", resp.ModelList[0].Name)
				assert.False(t, resp.HasMore)
			},
		},
		{
			name: "list models with fuzzy search",
			req: &modelmgr.ListModelRequest{
				FuzzyModelName: strPtr("GPT"),
				Limit:          5,
			},
			setupMock: func(mock sqlmock.Sqlmock) {
				rows := sqlmock.NewRows([]string{
					"id", "meta_id", "name", "description", "default_params", "scenario", "status",
					"created_at", "updated_at", "deleted_at",
					"id", "model_name", "protocol", "icon_uri", "icon_url", "capability",
					"conn_config", "status", "description", "created_at", "updated_at", "deleted_at",
				})

				mock.ExpectQuery("SELECT me.*, mm.* FROM `model_entity`").
					WithArgs([]int{0, 1}, "%GPT%", 6).
					WillReturnRows(rows)
			},
			wantErr: false,
			checkResp: func(t *testing.T, resp *modelmgr.ListModelResponse) {
				assert.Len(t, resp.ModelList, 0)
				assert.False(t, resp.HasMore)
			},
		},
		{
			name: "list models with pagination",
			req: &modelmgr.ListModelRequest{
				Limit:  2,
				Cursor: strPtr("5"),
			},
			setupMock: func(mock sqlmock.Sqlmock) {
				rows := sqlmock.NewRows([]string{
					"id", "meta_id", "name", "description", "default_params", "scenario", "status",
					"created_at", "updated_at", "deleted_at",
					"id", "model_name", "protocol", "icon_uri", "icon_url", "capability",
					"conn_config", "status", "description", "created_at", "updated_at", "deleted_at",
				}).AddRow(
					6, 6, "Model6", `{}`, `[]`, 1, 1,
					1234567890, 1234567890, nil,
					6, "Model6", "openai", "", "", `{}`,
					`{}`, 1, "", 1234567890, 1234567890, nil,
				).AddRow(
					7, 7, "Model7", `{}`, `[]`, 1, 1,
					1234567890, 1234567890, nil,
					7, "Model7", "openai", "", "", `{}`,
					`{}`, 1, "", 1234567890, 1234567890, nil,
				).AddRow(
					8, 8, "Model8", `{}`, `[]`, 1, 1,
					1234567890, 1234567890, nil,
					8, "Model8", "openai", "", "", `{}`,
					`{}`, 1, "", 1234567890, 1234567890, nil,
				)

				mock.ExpectQuery("SELECT me.*, mm.* FROM `model_entity`").
					WithArgs([]int{0, 1}, int64(5), 3).
					WillReturnRows(rows)
			},
			wantErr: false,
			checkResp: func(t *testing.T, resp *modelmgr.ListModelResponse) {
				assert.Len(t, resp.ModelList, 2)
				assert.True(t, resp.HasMore)
				assert.NotNil(t, resp.NextCursor)
				assert.Equal(t, "7", *resp.NextCursor)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db, mock, err := sqlmock.New()
			assert.NoError(t, err)
			defer db.Close()

			gormDB, err := gorm.Open(mysql.New(mysql.Config{
				Conn:                      db,
				SkipInitializeWithVersion: true,
			}), &gorm.Config{})
			assert.NoError(t, err)

			tt.setupMock(mock)

			mgr, err := NewModelMgr(gormDB, nil)
			assert.NoError(t, err)

			resp, err := mgr.ListModel(context.Background(), tt.req)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				tt.checkResp(t, resp)
			}

			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestModelMgr_MGetModelByID(t *testing.T) {
	tests := []struct {
		name      string
		req       *modelmgr.MGetModelRequest
		setupMock func(sqlmock.Sqlmock)
		wantErr   bool
		checkResp func(*testing.T, []*modelmgr.Model)
	}{
		{
			name: "get models by ids",
			req: &modelmgr.MGetModelRequest{
				IDs: []int64{1, 2, 3},
			},
			setupMock: func(mock sqlmock.Sqlmock) {
				rows := sqlmock.NewRows([]string{
					"id", "meta_id", "name", "description", "default_params", "scenario", "status",
					"created_at", "updated_at", "deleted_at",
					"id", "model_name", "protocol", "icon_uri", "icon_url", "capability",
					"conn_config", "status", "description", "created_at", "updated_at", "deleted_at",
				}).AddRow(
					1, 1, "Model1", `{}`, `[]`, 1, 1,
					1234567890, 1234567890, nil,
					1, "Model1", "openai", "", "", `{}`,
					`{}`, 1, "", 1234567890, 1234567890, nil,
				).AddRow(
					3, 3, "Model3", `{}`, `[]`, 1, 1,
					1234567890, 1234567890, nil,
					3, "Model3", "claude", "", "", `{}`,
					`{}`, 1, "", 1234567890, 1234567890, nil,
				)

				mock.ExpectQuery("SELECT me.*, mm.* FROM `model_entity`").
					WithArgs([]int64{1, 2, 3}).
					WillReturnRows(rows)
			},
			wantErr: false,
			checkResp: func(t *testing.T, models []*modelmgr.Model) {
				assert.Len(t, models, 2)
				// 验证返回顺序
				assert.Equal(t, int64(1), models[0].ID)
				assert.Equal(t, int64(3), models[1].ID)
			},
		},
		{
			name: "empty ids",
			req: &modelmgr.MGetModelRequest{
				IDs: []int64{},
			},
			setupMock: func(mock sqlmock.Sqlmock) {
				// 不期望任何查询
			},
			wantErr: false,
			checkResp: func(t *testing.T, models []*modelmgr.Model) {
				assert.Len(t, models, 0)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db, mock, err := sqlmock.New()
			assert.NoError(t, err)
			defer db.Close()

			gormDB, err := gorm.Open(mysql.New(mysql.Config{
				Conn:                      db,
				SkipInitializeWithVersion: true,
			}), &gorm.Config{})
			assert.NoError(t, err)

			tt.setupMock(mock)

			mgr, err := NewModelMgr(gormDB, nil)
			assert.NoError(t, err)

			models, err := mgr.MGetModelByID(context.Background(), tt.req)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				tt.checkResp(t, models)
			}

			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestModelMgr_convertToModel(t *testing.T) {
	mgr := &ModelMgr{}

	tests := []struct {
		name    string
		entity  *entity.ModelEntity
		meta    *entity.ModelMeta
		wantErr bool
		check   func(*testing.T, *modelmgr.Model)
	}{
		{
			name: "convert with all fields",
			entity: &entity.ModelEntity{
				ID:            1,
				MetaID:        1,
				Name:          "Test Model",
				Description:   strPtr(`{"zh":"测试模型","en":"Test Model"}`),
				DefaultParams: `[{"name":"temperature","type":"float","default_val":{"default_val":"0.7"}}]`,
			},
			meta: &entity.ModelMeta{
				ID:          1,
				ModelName:   "test-model",
				Protocol:    "openai",
				IconURI:     "icon.png",
				IconURL:     "https://example.com/icon.png",
				Capability:  strPtr(`{"function_call":true,"input_tokens":4096}`),
				ConnConfig:  strPtr(`{"api_key":"test-key","model":"gpt-4"}`),
				Status:      1,
				Description: "",
			},
			wantErr: false,
			check: func(t *testing.T, model *modelmgr.Model) {
				assert.Equal(t, int64(1), model.ID)
				assert.Equal(t, "Test Model", model.Name)
				assert.Equal(t, "icon.png", model.IconURI)
				assert.Equal(t, "https://example.com/icon.png", model.IconURL)
				assert.NotNil(t, model.Description)
				assert.Equal(t, "测试模型", model.Description.ZH)
				assert.Equal(t, "Test Model", model.Description.EN)
				assert.Len(t, model.DefaultParameters, 1)
				assert.True(t, model.Meta.Capability.FunctionCall)
				assert.Equal(t, "test-key", model.Meta.ConnConfig.APIKey)
			},
		},
		{
			name: "convert with plain text description",
			entity: &entity.ModelEntity{
				ID:            2,
				MetaID:        2,
				Name:          "Simple Model",
				Description:   strPtr("简单描述"),
				DefaultParams: `[]`,
			},
			meta: &entity.ModelMeta{
				ID:        2,
				ModelName: "simple-model",
				Protocol:  "claude",
				Status:    1,
			},
			wantErr: false,
			check: func(t *testing.T, model *modelmgr.Model) {
				assert.Equal(t, int64(2), model.ID)
				assert.NotNil(t, model.Description)
				assert.Equal(t, "简单描述", model.Description.ZH)
			},
		},
		{
			name: "convert with invalid json",
			entity: &entity.ModelEntity{
				ID:            3,
				MetaID:        3,
				Name:          "Invalid Model",
				DefaultParams: `invalid json`,
			},
			meta: &entity.ModelMeta{
				ID:        3,
				ModelName: "invalid-model",
				Protocol:  "openai",
				Status:    1,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			model, err := mgr.convertToModel(tt.entity, tt.meta)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				tt.check(t, model)
			}
		})
	}
}

// Helper functions
func strPtr(s string) *string {
	return &s
}
