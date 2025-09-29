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

package service

import (
	"context"
	"errors"
	"os"
	"strings"
	"testing"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/repository"
	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/infra/document/nl2sql"
	"github.com/coze-dev/coze-studio/backend/infra/rdb"
	rdb_entity "github.com/coze-dev/coze-studio/backend/infra/rdb/entity"
	mock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/nl2sql_mock"
	mock_db "github.com/coze-dev/coze-studio/backend/internal/mock/infra/rdb"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
)

func TestAddSliceIdColumn(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "simple select",
			input:    "SELECT name, age FROM users",
			expected: "SELECT `name`,`age`,`_knowledge_slice_id` FROM `users`",
		},
		{
			name:     "select stmt wrong",
			input:    "SELECT FROM users",
			expected: "SELECT FROM users",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := addSliceIdColumn(tt.input)
			if actual != tt.expected {
				t.Errorf("AddSliceIdColumn() = %v, want %v", actual, tt.expected)
			}
		})
	}
}

func TestNL2sqlExec(t *testing.T) {
	svc := knowledgeSVC{}
	ctrl := gomock.NewController(t)
	db := mock_db.NewMockRDB(ctrl)
	nl2SQL := mock.NewMockNL2SQL(ctrl)
	nl2SQL.EXPECT().NL2SQL(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, messages []*schema.Message, tables []*document.TableSchema, opts ...nl2sql.Option) (sql string, err error) {
		return "select count(*) from users", nil
	})
	db.EXPECT().ExecuteSQL(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, req *rdb.ExecuteSQLRequest) (*rdb.ExecuteSQLResponse, error) {
		return &rdb.ExecuteSQLResponse{
			ResultSet: &rdb_entity.ResultSet{Rows: []map[string]interface{}{
				{
					"count(*)": 100,
				},
			}},
		}, nil
	})
	svc.nl2Sql = nl2SQL
	svc.rdb = db
	ctx := context.Background()
	docu := model.KnowledgeDocument{
		ID:            110,
		KnowledgeID:   111,
		Name:          "users",
		FileExtension: "xlsx",
		DocumentType:  1,
		CreatorID:     666,
		SpaceID:       666,
		Status:        1,
		TableInfo: &entity.TableInfo{
			VirtualTableName:  "users",
			PhysicalTableName: "table_111",
			TableDesc:         "user table",
			Columns: []*entity.TableColumn{
				{
					ID:          1,
					Name:        "_knowledge_slice_id",
					Type:        document.TableColumnTypeInteger,
					Description: "id",
					Indexing:    false,
					Sequence:    1,
				},
				{
					ID:          2,
					Name:        "name",
					Type:        document.TableColumnTypeString,
					Description: "name",
					Indexing:    true,
					Sequence:    2,
				},
			},
		},
	}
	retrieveCtx := &RetrieveContext{
		Ctx:          ctx,
		OriginQuery:  "select count(*) from users",
		KnowledgeIDs: sets.FromSlice[int64]([]int64{111}),
		Documents:    []*model.KnowledgeDocument{&docu},
		KnowledgeInfoMap: map[int64]*KnowledgeInfo{
			111: &KnowledgeInfo{
				KnowledgeName: "users",
				DocumentIDs:   []int64{110},
				DocumentType:  1,
				TableColumns: []*entity.TableColumn{
					{
						ID:          1,
						Name:        "_knowledge_slice_id",
						Type:        document.TableColumnTypeInteger,
						Description: "id",
						Indexing:    false,
						Sequence:    1,
					},
					{
						ID:          2,
						Name:        "name",
						Type:        document.TableColumnTypeString,
						Description: "name",
						Indexing:    true,
						Sequence:    2,
					},
				},
			},
		},
	}
	docs, err := svc.nl2SqlExec(ctx, &docu, retrieveCtx, nil)
	assert.Equal(t, nil, err)
	assert.Equal(t, 1, len(docs))
	assert.Equal(t, "sql:select count(*) from users;result:[{\"count(*)\":100}]", docs[0].Content)
	nl2SQL.EXPECT().NL2SQL(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, messages []*schema.Message, tables []*document.TableSchema, opts ...nl2sql.Option) (sql string, err error) {
		return "", errors.New("nl2sql error")
	})
	_, err = svc.nl2SqlExec(ctx, &docu, retrieveCtx, nil)
	assert.Equal(t, "nl2sql error", err.Error())
	db.EXPECT().ExecuteSQL(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, req *rdb.ExecuteSQLRequest) (*rdb.ExecuteSQLResponse, error) {
		return nil, errors.New("rdb error")
	})
	nl2SQL.EXPECT().NL2SQL(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, messages []*schema.Message, tables []*document.TableSchema, opts ...nl2sql.Option) (sql string, err error) {
		return "select count(*) from users", nil
	})
	_, err = svc.nl2SqlExec(ctx, &docu, retrieveCtx, nil)
	assert.Equal(t, "rdb error", err.Error())
	db.EXPECT().ExecuteSQL(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, req *rdb.ExecuteSQLRequest) (*rdb.ExecuteSQLResponse, error) {
		return &rdb.ExecuteSQLResponse{
			ResultSet: &rdb_entity.ResultSet{Rows: []map[string]interface{}{
				{
					"name":                         "666",
					"_knowledge_document_slice_id": int64(999),
				},
			}},
		}, nil
	})
	nl2SQL.EXPECT().NL2SQL(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, messages []*schema.Message, tables []*document.TableSchema, opts ...nl2sql.Option) (sql string, err error) {
		return "select name from users", nil
	})
	docs, err = svc.nl2SqlExec(ctx, &docu, retrieveCtx, nil)
	assert.Equal(t, nil, err)
	assert.Equal(t, 1, len(docs))
	assert.Equal(t, "999", docs[0].ID)

}

func TestPackResults(t *testing.T) {
	svc := knowledgeSVC{}
	ctx := context.Background()
	svc.packResults(ctx, []*schema.Document{})
	dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
	if os.Getenv("CI_JOB_NAME") != "" {
		dsn = strings.ReplaceAll(dsn, "127.0.0.1", "mysql")
	}
	gormDB, err := gorm.Open(mysql.Open(dsn))
	assert.Equal(t, nil, err)
	svc.knowledgeRepo = repository.NewKnowledgeDAO(gormDB)
	svc.documentRepo = repository.NewKnowledgeDocumentDAO(gormDB)
	svc.sliceRepo = repository.NewKnowledgeDocumentSliceDAO(gormDB)
	docs := []*schema.Document{
		{
			ID:      "",
			Content: "sql:select count(*) from users;result:[{\"count(*)\":100}]",
			MetaData: map[string]any{
				"knowledge_id":   int64(111),
				"document_id":    int64(110),
				"document_name":  "users",
				"knowledge_name": "users",
			},
		},
	}
	res, err := svc.packResults(ctx, docs)
	assert.Equal(t, nil, err)
	assert.Equal(t, 1, len(res))
	assert.Equal(t, "sql:select count(*) from users;result:[{\"count(*)\":100}]", ptr.From(res[0].Slice.RawContent[0].Text))
	docs = []*schema.Document{
		{
			ID:      "10000",
			Content: "",
			MetaData: map[string]any{
				"knowledge_id":   int64(111),
				"document_id":    int64(110),
				"document_name":  "users",
				"knowledge_name": "users",
			},
		},
	}
	res, err = svc.packResults(ctx, docs)
	assert.Equal(t, 0, len(res))
	assert.Equal(t, nil, err)
}
