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
	"errors"
	"strings"
	"testing"

	. "github.com/bytedance/mockey"
	. "github.com/smartystreets/goconvey/convey"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/internal/mock/infra/orm"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestKnowledgeDocument(t *testing.T) {
	suite.Run(t, &DocumentTestSuite{})
}

type DocumentTestSuite struct {
	suite.Suite

	ctx context.Context
	db  *gorm.DB
	dao *KnowledgeDocumentDAO
}

func (suite *DocumentTestSuite) SetupSuite() {
	suite.ctx = context.Background()
	mockDB := orm.NewMockDB()
	mockDB.AddTable(&model.KnowledgeDocument{})
	mockDB.AddTable(&model.KnowledgeDocumentSlice{})
	db, err := mockDB.DB()
	if err != nil {
		panic(err)
	}
	suite.db = db
	suite.dao = &KnowledgeDocumentDAO{
		DB:    db,
		Query: query.Use(db),
	}
}

func (suite *DocumentTestSuite) TearDownTest() {
	suite.clearDB()
}

func (suite *DocumentTestSuite) clearDB() {
	suite.db.WithContext(suite.ctx).Unscoped().Delete(&model.KnowledgeDocument{})
	suite.db.WithContext(suite.ctx).Unscoped().Delete(&model.KnowledgeDocumentSlice{})
}

func (suite *DocumentTestSuite) TestCRUD() {
	PatchConvey("test crud", suite.T(), func() {
		ctx := suite.ctx
		q := suite.dao.Query.KnowledgeDocument

		err := suite.dao.Create(ctx, &model.KnowledgeDocument{ID: 123, KnowledgeID: 456})
		So(err, ShouldBeNil)
		first, err := q.WithContext(ctx).Where(q.ID.Eq(123)).First()
		So(err, ShouldBeNil)
		So(first, ShouldNotBeNil)
		So(first.KnowledgeID, ShouldEqual, int64(456))

		err = suite.dao.Update(ctx, &model.KnowledgeDocument{ID: 123, KnowledgeID: 654})
		So(err, ShouldBeNil)
		first, err = q.WithContext(ctx).Where(q.ID.Eq(123)).First()
		So(err, ShouldBeNil)
		So(first, ShouldNotBeNil)
		So(first.KnowledgeID, ShouldEqual, int64(654))

		err = suite.dao.Delete(ctx, 123)
		So(err, ShouldBeNil)
		first, err = q.WithContext(ctx).Where(q.ID.Eq(123)).First()
		So(err, ShouldNotBeNil)
		So(errors.Is(err, gorm.ErrRecordNotFound), ShouldBeTrue)
		So(first, ShouldBeNil)
	})
}

func (suite *DocumentTestSuite) TestMGetByID() {
	PatchConvey("test MGetByID", suite.T(), func() {
		ctx := suite.ctx
		resp, err := suite.dao.MGetByID(ctx, nil)
		So(err, ShouldBeNil)
		So(resp, ShouldBeNil)

		suite.db.Create([]*model.KnowledgeDocument{
			{
				ID:          666,
				KnowledgeID: 123,
			}, {
				ID:          667,
				KnowledgeID: 123,
			},
		})
		resp, err = suite.dao.MGetByID(ctx, []int64{666, 667})
		So(err, ShouldBeNil)
		So(len(resp), ShouldEqual, 2)
	})
}

func (suite *DocumentTestSuite) TestUpdateDocumentSliceInfo() {
	PatchConvey("test UpdateDocumentSliceInfo", suite.T(), func() {
		ctx := suite.ctx
		suite.db.Create([]*model.KnowledgeDocumentSlice{
			{
				ID:          1,
				KnowledgeID: 123,
				DocumentID:  456,
				Content:     "hello",
			},
			{
				ID:          2,
				KnowledgeID: 123,
				DocumentID:  456,
				Content:     "world",
			},
		})

		suite.db.Create(&model.KnowledgeDocument{
			ID:          456,
			KnowledgeID: 123,
		})

		Mock(GetMethod(suite.db, "Raw")).To(func(sql string, values ...interface{}) (tx *gorm.DB) {
			tx = suite.db.WithContext(suite.ctx)
			tx.Statement.SQL = strings.Builder{}
			newSQL := strings.Replace(sql, "CHAR_LENGTH", "LENGTH", 1)
			if strings.Contains(newSQL, "@") {
				clause.NamedExpr{SQL: newSQL, Vars: values}.Build(tx.Statement)
			} else {
				clause.Expr{SQL: newSQL, Vars: values}.Build(tx.Statement)
			}
			return tx
		}).Build()

		err := suite.dao.UpdateDocumentSliceInfo(ctx, 456)
		So(err, ShouldBeNil)

		q := suite.dao.Query.KnowledgeDocument
		d, err := q.WithContext(ctx).Where(q.ID.Eq(456)).First()
		So(err, ShouldBeNil)
		So(d, ShouldNotBeNil)
		So(d.SliceCount, ShouldEqual, 2)
		So(d.Size, ShouldEqual, 10)
	})
}

func (suite *DocumentTestSuite) TestFindDocumentByCondition() {
	PatchConvey("test FindDocumentByCondition", suite.T(), func() {
		ctx := context.Background()
		mockDB := orm.NewMockDB()
		mockDB.AddTable(&model.KnowledgeDocument{})
		db, err := mockDB.DB()
		So(err, ShouldBeNil)

		dao := &KnowledgeDocumentDAO{
			DB:    db,
			Query: query.Use(db),
		}

		db.Create([]*model.KnowledgeDocument{
			{
				ID:          666,
				KnowledgeID: 123,
			}, {
				ID:          667,
				KnowledgeID: 123,
			},
		})

		PatchConvey("test paging", func() {
			resp, total, err := dao.FindDocumentByCondition(ctx, &entity.WhereDocumentOpt{
				IDs:          []int64{666, 667},
				KnowledgeIDs: []int64{123},
				Limit:        1,
				Offset:       ptr.Of(0),
			})
			So(err, ShouldBeNil)
			So(total, ShouldEqual, 2)
			So(len(resp), ShouldEqual, 1)
			So(resp[0].ID, ShouldEqual, int64(666))

			resp, total, err = dao.FindDocumentByCondition(ctx, &entity.WhereDocumentOpt{
				IDs:          []int64{666, 667},
				KnowledgeIDs: []int64{123},
				Limit:        1,
				Offset:       ptr.Of(1),
			})
			So(err, ShouldBeNil)
			So(total, ShouldEqual, 2)
			So(len(resp), ShouldEqual, 1)
			So(resp[0].ID, ShouldEqual, int64(667))

			resp, total, err = dao.FindDocumentByCondition(ctx, &entity.WhereDocumentOpt{
				IDs:          []int64{666, 667},
				KnowledgeIDs: []int64{123},
				Limit:        1,
				Offset:       ptr.Of(2),
			})
			So(err, ShouldBeNil)
			So(total, ShouldEqual, 2)
			So(len(resp), ShouldEqual, 0)
		})
	})
}
