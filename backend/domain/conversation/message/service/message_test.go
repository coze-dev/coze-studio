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

package message

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/repository"
	mock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/internal/mock/infra/orm"
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
				UserID:         "1",
			},
			&model.Message{
				ID:             2,
				ConversationID: 1,
				UserID:         "1",
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)

	components := &Components{
		MessageRepo: repository.NewMessageRepo(mockDB, nil),
	}

	resp, err := NewService(components).List(ctx, &entity.ListMeta{
		ConversationID: 1,
		Limit:          1,
		UserID:         "1",
	})
	assert.NoError(t, err)
	assert.Len(t, resp.Messages, 0)
}

// Test_NewListMessage tests the NewListMessage function
func TestCreateMessage(t *testing.T) {
	ctx := context.Background()

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(_ context.Context) (int64, error) {
		newID := time.Now().UnixNano()
		return newID, nil
	}).AnyTimes()
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
	imageInput := &message.FileData{
		Url:  "https://xxxxx.xxxx/image",
		Name: "test_img",
		URI:  "",
	}
	fileInput := &message.FileData{
		Url:  "https://xxxxx.xxxx/file",
		Name: "test_file",
		URI:  "",
	}
	content := []*message.InputMetaData{
		{
			Type: message.InputTypeText,
			Text: "解析图片中的内容",
		},
		{
			Type: message.InputTypeImage,
			FileData: []*message.FileData{
				imageInput,
			},
		},
		{
			Type: message.InputTypeFile,
			FileData: []*message.FileData{
				fileInput,
			},
		},
	}
	service := NewService(components)
	insert := &entity.Message{
		ID:             7498710126354759680,
		ConversationID: 7496795464885338112,
		AgentID:        7366055842027922437,
		UserID:         "6666666",
		RunID:          7498710102375923712,
		Content:        "你是谁？",
		MultiContent:   content,
		Role:           schema.Assistant,
		MessageType:    message.MessageTypeFunctionCall,
		SectionID:      7496795464897921024,
		ModelContent:   "{\"role\":\"tool\",\"content\":\"tool call\"}",
		ContentType:    message.ContentTypeMix,
	}
	resp, err := service.Create(ctx, insert)
	assert.NoError(t, err)

	assert.Equal(t, int64(7366055842027922437), resp.AgentID)
	assert.Equal(t, "你是谁？", resp.Content)
}

func TestEditMessage(t *testing.T) {
	ctx := context.Background()
	mockDBGen := orm.NewMockDB()
	extData := map[string]string{
		"test": "test",
	}
	ext, _ := json.Marshal(extData)
	mockDBGen.AddTable(&model.Message{}).
		AddRows(
			&model.Message{
				ID:             1,
				ConversationID: 1,
				UserID:         "1",
				Role:           string(schema.User),
				RunID:          123,
			},
			&model.Message{
				ID:             2,
				ConversationID: 1,
				UserID:         "1",
				Role:           string(schema.User),
				RunID:          124,
				Ext:            string(ext),
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)

	components := &Components{
		MessageRepo: repository.NewMessageRepo(mockDB, nil),
	}

	imageInput := &message.FileData{
		Url:  "https://xxxxx.xxxx/image",
		Name: "test_img",
	}
	fileInput := &message.FileData{
		Url:  "https://xxxxx.xxxx/file",
		Name: "test_file",
	}
	_ = []*message.InputMetaData{
		{
			Type: message.InputTypeText,
			Text: "解析图片中的内容",
		},
		{
			Type: message.InputTypeImage,
			FileData: []*message.FileData{
				imageInput,
			},
		},
		{
			Type: message.InputTypeFile,
			FileData: []*message.FileData{
				fileInput,
			},
		},
	}

	resp, err := NewService(components).Edit(ctx, &entity.Message{
		ID:      2,
		Content: "test edit message",
		Ext:     map[string]string{"newext": "true"},

		// MultiContent: content,
	})
	_ = resp

	msg, err := NewService(components).GetByID(ctx, 2)
	assert.NoError(t, err)

	assert.Equal(t, int64(2), msg.ID)
	assert.Equal(t, "test edit message", msg.Content)
	var modelContent *schema.Message
	err = json.Unmarshal([]byte(msg.ModelContent), &modelContent)
	assert.NoError(t, err)

	assert.Equal(t, "test edit message", modelContent.Content)

	assert.Equal(t, "true", msg.Ext["newext"])
}

//func TestGetByRunIDs(t *testing.T) {
//	ctx := context.Background()
//
//	mockDBGen := orm.NewMockDB()
//
//	mockDBGen.AddTable(&model.Message{}).
//		AddRows(
//			&model.Message{
//				ID:             1,
//				ConversationID: 1,
//				UserID:         "1",
//				RunID:          123,
//				Content:        "test content123",
//			},
//			&model.Message{
//				ID:             2,
//				ConversationID: 1,
//				UserID:         "1",
//				Content:        "test content124",
//				RunID:          124,
//			},
//			&model.Message{
//				ID:             3,
//				ConversationID: 1,
//				UserID:         "1",
//				Content:        "test content124",
//				RunID:          124,
//			},
//		)
//	mockDB, err := mockDBGen.DB()
//	assert.NoError(t, err)
//	components := &Components{
//		MessageRepo: repository.NewMessageRepo(mockDB, nil),
//	}
//
//	resp, err := NewService(components).GetByRunIDs(ctx, 1, []int64{124})
//
//	assert.NoError(t, err)
//
//	assert.Len(t, resp, 2)
//}

func TestListWithoutPair(t *testing.T) {
	ctx := context.Background()
	t.Run("success_with_messages", func(t *testing.T) {
		mockDBGen := orm.NewMockDB()

		mockDBGen.AddTable(&model.Message{}).
			AddRows(
				&model.Message{
					ID:             1,
					ConversationID: 100,
					UserID:         "user123",
					RunID:          200,
					Content:        "Hello",
					MessageType:    string(message.MessageTypeAnswer),
					Status:         1, // MessageStatusAvailable
					CreatedAt:      time.Now().UnixMilli(),
				},
				&model.Message{
					ID:             2,
					ConversationID: 100,
					UserID:         "user123",
					RunID:          201,
					Content:        "World",
					MessageType:    string(message.MessageTypeAnswer),
					Status:         1, // MessageStatusAvailable
					CreatedAt:      time.Now().UnixMilli(),
				},
			)

		mockDB, err := mockDBGen.DB()
		assert.NoError(t, err)

		components := &Components{
			MessageRepo: repository.NewMessageRepo(mockDB, nil),
		}

		req := &entity.ListMeta{
			ConversationID: 100,
			UserID:         "user123",
			Limit:          10,
			Direction:      entity.ScrollPageDirectionNext,
		}

		resp, err := NewService(components).ListWithoutPair(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, entity.ScrollPageDirectionNext, resp.Direction)
		assert.False(t, resp.HasMore)
		assert.Len(t, resp.Messages, 2)
		assert.Equal(t, "Hello", resp.Messages[0].Content)
		assert.Equal(t, "World", resp.Messages[1].Content)
	})

	t.Run("empty_result", func(t *testing.T) {
		mockDBGen := orm.NewMockDB()
		mockDBGen.AddTable(&model.Message{})

		mockDB, err := mockDBGen.DB()
		assert.NoError(t, err)

		components := &Components{
			MessageRepo: repository.NewMessageRepo(mockDB, nil),
		}

		req := &entity.ListMeta{
			ConversationID: 999,
			UserID:         "user123",
			Limit:          10,
			Direction:      entity.ScrollPageDirectionNext,
		}

		resp, err := NewService(components).ListWithoutPair(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, entity.ScrollPageDirectionNext, resp.Direction)
		assert.False(t, resp.HasMore)
		assert.Len(t, resp.Messages, 0)
	})

	t.Run("pagination_has_more", func(t *testing.T) {
		mockDBGen := orm.NewMockDB()

		mockDBGen.AddTable(&model.Message{}).
			AddRows(
				&model.Message{
					ID:             1,
					ConversationID: 100,
					UserID:         "user123",
					RunID:          200,
					Content:        "Message 1",
					MessageType:    string(message.MessageTypeAnswer),
					Status:         1,
					CreatedAt:      time.Now().UnixMilli() - 3000,
				},
				&model.Message{
					ID:             2,
					ConversationID: 100,
					UserID:         "user123",
					RunID:          201,
					Content:        "Message 2",
					MessageType:    string(message.MessageTypeAnswer),
					Status:         1,
					CreatedAt:      time.Now().UnixMilli() - 2000,
				},
				&model.Message{
					ID:             3,
					ConversationID: 100,
					UserID:         "user123",
					RunID:          202,
					Content:        "Message 3",
					MessageType:    string(message.MessageTypeAnswer),
					Status:         1,
					CreatedAt:      time.Now().UnixMilli() - 1000,
				},
			)

		mockDB, err := mockDBGen.DB()
		assert.NoError(t, err)

		components := &Components{
			MessageRepo: repository.NewMessageRepo(mockDB, nil),
		}

		req := &entity.ListMeta{
			ConversationID: 100,
			UserID:         "user123",
			Limit:          2,
			Direction:      entity.ScrollPageDirectionNext,
		}

		resp, err := NewService(components).ListWithoutPair(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, entity.ScrollPageDirectionNext, resp.Direction)
		assert.True(t, resp.HasMore)
		assert.Len(t, resp.Messages, 2)
	})

	t.Run("direction_prev", func(t *testing.T) {
		mockDBGen := orm.NewMockDB()

		mockDBGen.AddTable(&model.Message{}).
			AddRows(
				&model.Message{
					ID:             1,
					ConversationID: 100,
					UserID:         "user123",
					RunID:          200,
					Content:        "Test message",
					MessageType:    string(message.MessageTypeAnswer),
					Status:         1,
					CreatedAt:      time.Now().UnixMilli(),
				},
			)

		mockDB, err := mockDBGen.DB()
		assert.NoError(t, err)

		components := &Components{
			MessageRepo: repository.NewMessageRepo(mockDB, nil),
		}

		req := &entity.ListMeta{
			ConversationID: 100,
			UserID:         "user123",
			Limit:          10,
			Direction:      entity.ScrollPageDirectionPrev,
		}

		resp, err := NewService(components).ListWithoutPair(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Equal(t, entity.ScrollPageDirectionPrev, resp.Direction)
		assert.False(t, resp.HasMore)
		assert.Len(t, resp.Messages, 1)
	})

	t.Run("with_message_type_filter", func(t *testing.T) {
		mockDBGen := orm.NewMockDB()

		mockDBGen.AddTable(&model.Message{}).
			AddRows(
				&model.Message{
					ID:             1,
					ConversationID: 100,
					UserID:         "user123",
					RunID:          200,
					Content:        "Answer message",
					MessageType:    string(message.MessageTypeAnswer),
					Status:         1,
					CreatedAt:      time.Now().UnixMilli(),
				},
				&model.Message{
					ID:             2,
					ConversationID: 100,
					UserID:         "user123",
					RunID:          201,
					Content:        "Question message",
					MessageType:    string(message.MessageTypeQuestion),
					Status:         1,
					CreatedAt:      time.Now().UnixMilli(),
				},
			)

		mockDB, err := mockDBGen.DB()
		assert.NoError(t, err)

		components := &Components{
			MessageRepo: repository.NewMessageRepo(mockDB, nil),
		}

		req := &entity.ListMeta{
			ConversationID: 100,
			UserID:         "user123",
			Limit:          10,
			Direction:      entity.ScrollPageDirectionNext,
			MessageType:    []*message.MessageType{&[]message.MessageType{message.MessageTypeAnswer}[0]},
		}

		resp, err := NewService(components).ListWithoutPair(ctx, req)
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.Len(t, resp.Messages, 1)
		assert.Equal(t, "Answer message", resp.Messages[0].Content)
	})
}

func TestBatchCreate(t *testing.T) {
	ctx := context.Background()
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Message{})
	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)

	components := &Components{
		MessageRepo: repository.NewMessageRepo(mockDB, nil),
	}

	t.Run("success_single_message", func(t *testing.T) {
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		// 准备测试数据
		inputMsgs := []*entity.Message{
			{
				ID:             1,
				ConversationID: 100,
				RunID:          200,
				AgentID:        300,
				UserID:         "user123",
				Content:        "Hello World",
				Role:           schema.User,
				ContentType:    message.ContentTypeText,
				MessageType:    message.MessageTypeQuestion,
				Status:         message.MessageStatusAvailable,
			},
			{
				ID:             2,
				ConversationID: 100,
				RunID:          200,
				AgentID:        300,
				UserID:         "user123",
				Content:        "Hello World",
				Role:           schema.Assistant,
				ContentType:    message.ContentTypeText,
				MessageType:    message.MessageTypeQuestion,
				Status:         message.MessageStatusAvailable,
			},
		}

		result, err := NewService(components).BatchCreate(ctx, inputMsgs)

		assert.NoError(t, err)
		assert.Len(t, result, 2)
		assert.Equal(t, inputMsgs[1].ID, result[1].ID)
	})
}
