package conversation

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/common"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/internal/model"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/orm"
)

// Test_NewListMessage tests the NewListMessage function
func TestCreateConversation(t *testing.T) {
	ctx := context.Background()

	// mockDB, _ := mysql.New()
	// redisCli := redis.New()
	// idGen, err := idgen.New(redisCli)

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenMultiIDs(gomock.Any(), 2).Return([]int64{
		1, 2,
	}, nil).AnyTimes()

	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Conversation{})
	mockDB, err := mockDBGen.DB()

	components := &Components{
		DB:    mockDB,
		IDGen: idGen,
	}

	createData, err := NewService(components).Create(ctx, &entity.CreateMeta{
		AgentID:     100000,
		UserID:      222222,
		ConnectorID: 100001,
		Scene:       common.ScenePlayground,
		Ext:         "debug ext9999",
	})
	assert.NotNil(t, createData)

	t.Logf("create conversation result: %v; err:%v", createData, err)
	assert.Nil(t, err)
	assert.Equal(t, "debug ext9999", createData.Ext)
}

func TestGetById(t *testing.T) {
	ctx := context.Background()

	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Conversation{})

	mockDBGen.AddTable(&model.Conversation{}).
		AddRows(
			&model.Conversation{
				ID:          7494574457319587840,
				AgentID:     8888,
				SectionID:   100001,
				ConnectorID: 100001,
				CreatorID:   1111,
				Ext:         "debug ext1111",
			},
		)

	mockDB, err := mockDBGen.DB()

	components := &Components{
		DB:    mockDB,
		IDGen: nil,
	}

	cd, err := NewService(components).GetByID(ctx, 7494574457319587840)
	assert.NoError(t, err)

	t.Logf("conversation result: %v; err:%v", cd, err)

	assert.Equal(t, "debug ext1111", cd.Ext)
}

func TestNewConversationCtx(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).Return(int64(123456), nil).Times(1)
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Conversation{})
	mockDBGen.AddTable(&model.Conversation{}).
		AddRows(
			&model.Conversation{
				ID:          7494574457319587840,
				AgentID:     8888,
				SectionID:   100001,
				ConnectorID: 100001,
				CreatorID:   1111,
			},
		)
	mockDB, err := mockDBGen.DB()

	assert.Nil(t, err)
	res, err := NewService(&Components{
		DB:    mockDB,
		IDGen: idGen,
	}).NewConversationCtx(ctx, &entity.NewConversationCtxRequest{
		ID: 7494574457319587840,
	})

	t.Logf("conversation result: %v; err:%v", res, err)
	assert.Equal(t, int64(123456), res.SectionID)
}

func TestConversationImpl_Delete(t *testing.T) {

	ctx := context.Background()
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Conversation{})
	mockDBGen.AddTable(&model.Conversation{}).
		AddRows(
			&model.Conversation{
				ID:          7494574457319587840,
				AgentID:     9999,
				SectionID:   100001,
				ConnectorID: 100001,
				CreatorID:   1111,
				Status:      int32(entity.ConversationStatusNormal),
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.Nil(t, err)
	err = NewService(&Components{
		DB: mockDB,
	}).Delete(ctx, &entity.DeleteRequest{
		ID: 7494574457319587840,
	})
	t.Logf("delete err:%v", err)
	assert.Nil(t, err)

	currentConversation, err := NewService(&Components{
		DB: mockDB,
	}).GetByID(ctx, 7494574457319587840)

	assert.NotNil(t, currentConversation)

	t.Logf("conversation result: %v; err:%v", currentConversation, err)
	assert.Nil(t, err)

	assert.Equal(t, entity.ConversationStatusDeleted, currentConversation.Status)
}
