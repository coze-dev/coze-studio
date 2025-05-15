package message

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	entity2 "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/repository"
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
		MessageRepo: repository.NewMessageRepo(mockDB, nil),
	}

	resp, err := NewService(components).List(ctx, &entity.ListRequest{
		ConversationID: 1,
		Limit:          1,
		UserID:         1,
	})
	assert.NoError(t, err)
	assert.Len(t, resp.Messages, 0)
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

	// redisCli := redis.New()
	// idGen, _ := idgen.New(redisCli)
	// mockDB, err := mysql.New()

	assert.NoError(t, err)

	components := &Components{
		MessageRepo: repository.NewMessageRepo(mockDB, idGen),
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
	service := NewService(components)
	insert := &entity.CreateRequest{
		Message: &entity.Message{
			ID:             7498710126354759680,
			ConversationID: 7496795464885338112,
			AgentID:        7366055842027922437,
			UserID:         6666666,
			RunID:          7498710102375923712,
			Content:        "你是谁？",
			MultiContent:   content,
			Role:           schema.Assistant,
			MessageType:    entity2.MessageTypeFunctionCall,
			SectionID:      7496795464897921024,
			ModelContent:   "{\"role\":\"tool\",\"content\":\"tool call\"}",
			ContentType:    entity2.ContentTypeMix,
		},
	}
	resp, err := service.Create(ctx, insert)
	assert.NoError(t, err)

	assert.Equal(t, int64(7366055842027922437), resp.Message.AgentID)
	assert.Equal(t, "你是谁？", resp.Message.Content)
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
		MessageRepo: repository.NewMessageRepo(mockDB, nil),
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
			ID:           2,
			Content:      "test edit message",
			MultiContent: content,
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
		MessageRepo: repository.NewMessageRepo(mockDB, nil),
	}

	resp, err := NewService(components).GetByRunIDs(ctx, &entity.GetByRunIDsRequest{
		ConversationID: 1,
		RunID:          []int64{124},
	})

	assert.NoError(t, err)

	assert.Len(t, resp.Messages, 2)
}
