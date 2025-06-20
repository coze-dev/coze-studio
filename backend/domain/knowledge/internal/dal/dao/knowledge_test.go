package dao

import (
	"context"
	"testing"

	. "github.com/bytedance/mockey"
	. "github.com/smartystreets/goconvey/convey"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/orm"
)

func TestKnowledgeSuite(t *testing.T) {
	suite.Run(t, new(KnowledgeSuite))
}

type KnowledgeSuite struct {
	suite.Suite

	ctx context.Context
	db  *gorm.DB
	dao *KnowledgeDAO
}

func (suite *KnowledgeSuite) SetupSuite() {
	suite.ctx = context.Background()
	mockDB := orm.NewMockDB()
	mockDB.AddTable(&model.Knowledge{})
	db, err := mockDB.DB()
	if err != nil {
		panic(err)
	}
	suite.db = db
	suite.dao = &KnowledgeDAO{
		DB:    db,
		Query: query.Use(db),
	}
}

func (suite *KnowledgeSuite) TearDownTest() {
	suite.db.WithContext(suite.ctx).Unscoped().Delete(&model.Knowledge{})
}

func (suite *KnowledgeSuite) TestCRUD() {
	PatchConvey("test crud", suite.T(), func() {
		ctx := suite.ctx
		q := suite.dao.Query.Knowledge

		err := suite.dao.Create(ctx, &model.Knowledge{
			ID:   123,
			Name: "test",
		})
		So(err, ShouldBeNil)
		k, err := q.WithContext(ctx).Where(q.ID.Eq(123)).First()
		So(err, ShouldBeNil)
		So(k.Name, ShouldEqual, "test")

		err = suite.dao.Upsert(ctx, &model.Knowledge{
			ID:   123,
			Name: "testtest",
		})
		So(err, ShouldBeNil)
		k, err = q.WithContext(ctx).Where(q.ID.Eq(123)).First()
		So(err, ShouldBeNil)
		So(k.Name, ShouldEqual, "testtest")
	})
}
