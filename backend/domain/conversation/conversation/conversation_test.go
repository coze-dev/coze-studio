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

	//mockDB, _ := mysql.New()
	//redisCli := redis.New()
	//idGen, err := idgen.New(redisCli)

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).Return(int64(10), nil).Times(2)

	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Conversation{})
	mockDB, err := mockDBGen.DB()

	components := &Components{
		DB:    mockDB,
		IDGen: idGen,
	}

	createData, err := NewService(components).Create(ctx, &entity.CreateRequest{
		AgentID:     100000,
		UserID:      222222,
		ConnectorID: 100001,
		Scene:       common.ScenePlayground,
		Ext:         "debug ext9999",
	})
	assert.NotNil(t, createData)

	t.Logf("create conversation result: %v; err:%v", createData.Conversation, err)
	assert.Nil(t, err)
	assert.Equal(t, "debug ext9999", createData.Conversation.Ext)
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

	cd, err := NewService(components).GetByID(ctx, &entity.GetByIDRequest{
		ID: 7494574457319587840,
	})
	assert.NoError(t, err)

	t.Logf("conversation result: %v; err:%v", cd.Conversation, err)

	assert.Equal(t, "debug ext1111", cd.Conversation.Ext)
}
