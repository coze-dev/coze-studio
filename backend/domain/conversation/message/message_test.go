package message

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/model"
	entity2 "code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
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

	//redisCli := redis.New()
	//idGen, _ := idgen.New(redisCli)
	//mockDB, err := mysql.New()

	assert.NoError(t, err)

	components := &Components{
		DB:    mockDB,
		IDGen: idGen,
	}
	imageInput := &entity2.FileData{
		Url:  "https://xxxxx.xxxx/image",
		Name: "test_img",
	}
	fileInput := &entity2.FileData{
		Url:  "https://xxxxx.xxxx/file",
		Name: "test_file",
	}
	content := []*entity2.InputMetaData{
		{
			Type: entity2.InputTypeText,
			Text: "解析图片中的内容",
		},
		{
			Type: entity2.InputTypeImage,
			FileData: []*entity2.FileData{
				imageInput,
			},
		},
		{
			Type: entity2.InputTypeFile,
			FileData: []*entity2.FileData{
				fileInput,
			},
		},
	}

	resp, err := NewService(components).Create(ctx, &entity.CreateRequest{
		Message: &entity.Message{
			ID:             2,
			ConversationID: 7494873769631023104,
			AgentID:        2,
			UserID:         6666666,
			RunID:          7494540806645088256,
			Content:        content,
			Role:           entity2.RoleTypeUser,
			MessageType:    entity2.MessageTypeQuestion,
			Ext:            map[string]string{"test": "test"},
		},
	})
	assert.NoError(t, err)

	assert.Equal(t, int64(2), resp.Message.AgentID)
	assert.Equal(t, "解析图片中的内容", resp.Message.Content[0].Text)
}

func TestEditMessage(t *testing.T) {
	ctx := context.Background()
	mockDBGen := orm.NewMockDB()

	mockDBGen.AddTable(&model.Message{}).
		AddRows(
			&model.Message{
				ID:             1,
				ConversationID: 1,
				UserID:         1,
				RunID:          123,
			},
			&model.Message{
				ID:             2,
				ConversationID: 1,
				UserID:         1,
				RunID:          124,
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)

	components := &Components{
		DB:    mockDB,
		IDGen: nil,
	}

	imageInput := &entity2.FileData{
		Url:  "https://xxxxx.xxxx/image",
		Name: "test_img",
	}
	fileInput := &entity2.FileData{
		Url:  "https://xxxxx.xxxx/file",
		Name: "test_file",
	}
	content := []*entity2.InputMetaData{
		{
			Type: entity2.InputTypeText,
			Text: "解析图片中的内容",
		},
		{
			Type: entity2.InputTypeImage,
			FileData: []*entity2.FileData{
				imageInput,
			},
		},
		{
			Type: entity2.InputTypeFile,
			FileData: []*entity2.FileData{
				fileInput,
			},
		},
	}

	resp, err := NewService(components).Edit(ctx, &entity.EditRequest{
		Message: &entity.Message{
			ID:      2,
			Content: content,
		},
	})
	_ = resp

	msOne, err := NewService(components).GetByRunIDs(ctx, &entity.GetByRunIDsRequest{
		ConversationID: 1,
		RunID:          []int64{124},
	})
	assert.NoError(t, err)

	assert.Equal(t, int64(124), msOne.Messages[0].RunID)

}

func TestGetByRunIDs(t *testing.T) {
	ctx := context.Background()

	mockDBGen := orm.NewMockDB()

	mockDBGen.AddTable(&model.Message{}).
		AddRows(
			&model.Message{
				ID:             1,
				ConversationID: 1,
				UserID:         1,
				RunID:          123,
				Content:        "test content123",
			},
			&model.Message{
				ID:             2,
				ConversationID: 1,
				UserID:         1,
				Content:        "test content124",
				RunID:          124,
			},
			&model.Message{
				ID:             3,
				ConversationID: 1,
				UserID:         1,
				Content:        "test content124",
				RunID:          124,
			},
		)
	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)
	components := &Components{
		DB:    mockDB,
		IDGen: nil,
	}

	resp, err := NewService(components).GetByRunIDs(ctx, &entity.GetByRunIDsRequest{
		ConversationID: 1,
		RunID:          []int64{124},
	})

	assert.NoError(t, err)

	assert.Len(t, resp.Messages, 2)
}
