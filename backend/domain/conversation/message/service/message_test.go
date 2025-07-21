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
	"testing"
	"time"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/repository"
	mock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/internal/mock/infra/contract/orm"
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

	mockDBGen.AddTable(&model.Message{}).
		AddRows(
			&model.Message{
				ID:             1,
				ConversationID: 1,
				UserID:         "1",
				RunID:          123,
			},
			&model.Message{
				ID:             2,
				ConversationID: 1,
				UserID:         "1",
				RunID:          124,
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

	resp, err := NewService(components).Edit(ctx, &entity.Message{
		ID:           2,
		Content:      "test edit message",
		MultiContent: content,
	})
	_ = resp

	msOne, err := NewService(components).GetByRunIDs(ctx, 1, []int64{124})
	assert.NoError(t, err)

	assert.Equal(t, int64(124), msOne[0].RunID)
}

func TestGetByRunIDs(t *testing.T) {
	ctx := context.Background()

	mockDBGen := orm.NewMockDB()

	mockDBGen.AddTable(&model.Message{}).
		AddRows(
			&model.Message{
				ID:             1,
				ConversationID: 1,
				UserID:         "1",
				RunID:          123,
				Content:        "test content123",
			},
			&model.Message{
				ID:             2,
				ConversationID: 1,
				UserID:         "1",
				Content:        "test content124",
				RunID:          124,
			},
			&model.Message{
				ID:             3,
				ConversationID: 1,
				UserID:         "1",
				Content:        "test content124",
				RunID:          124,
			},
		)
	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)
	components := &Components{
		MessageRepo: repository.NewMessageRepo(mockDB, nil),
	}

	resp, err := NewService(components).GetByRunIDs(ctx, 1, []int64{124})

	assert.NoError(t, err)

	assert.Len(t, resp, 2)
}
