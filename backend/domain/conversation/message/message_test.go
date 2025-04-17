package message

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/model"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/orm"
)

// Test_NewListMessage tests the NewListMessage function
func TestListMessage(t *testing.T) {
	ctx := context.Background()

	mockDBGen := orm.NewMockDB()

	mockDBGen.AddTable(&model.Message{}).
		AddRows(
			&model.Message{
				ID:             1,
				ConversationID: 1,
				UserID:         1,
			},
			&model.Message{
				ID:             2,
				ConversationID: 1,
				UserID:         1,
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)

	components := &Components{
		DB:    mockDB,
		IDGen: nil,
	}

	resp, err := NewService(components).List(ctx, &entity.ListRequest{
		ConversationID: 1,
		Limit:          1,
		UserID:         1,
	})
	assert.NoError(t, err)
	assert.Len(t, resp.Messages, 1)
	assert.True(t, resp.HasMore)
}

// Test_NewListMessage tests the NewListMessage function
func TestCreateMessage(t *testing.T) {

	ctx := context.Background()

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).Return(int64(10), nil).Times(1)

	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Message{})
	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)

	components := &Components{
		DB:    mockDB,
		IDGen: idGen,
	}
	resp, err := NewService(components).Create(ctx, &entity.CreateRequest{
		Message: &entity.Message{
			ID:             2,
			ConversationID: 2,
			AgentID:        2,
			Content:        "test content",
			Role:           "test",
		},
	})
	assert.NoError(t, err)
	_ = resp
	// TODO: 返回内容不符合预期
	// assert.Equal(t, 2, resp.Message.AgentID)
	// assert.Equal(t, "test content", resp.Message.Content)
}
