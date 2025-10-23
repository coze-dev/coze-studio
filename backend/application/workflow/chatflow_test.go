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

package workflow

import (
	"context"
	"errors"
	"strconv"
	"testing"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	crossagentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun"
	"github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/agentrunmock"
	messageentity "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	crossupload "github.com/coze-dev/coze-studio/backend/crossdomain/upload"
	"github.com/coze-dev/coze-studio/backend/crossdomain/upload/uploadmock"
	agententity "github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	uploadentity "github.com/coze-dev/coze-studio/backend/domain/upload/entity"
	"github.com/coze-dev/coze-studio/backend/domain/upload/service"
)

func TestApplicationService_makeChatFlowUserInput(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUpload := uploadmock.NewMockUploader(ctrl)
	crossupload.SetDefaultSVC(mockUpload)

	tests := []struct {
		name      string
		message   *workflow.EnterMessage
		setupMock func()
		expected  string
		expectErr bool
	}{
		{
			name: "content type text",
			message: &workflow.EnterMessage{
				ContentType: "text",
				Content:     "hello",
			},
			setupMock: func() {},
			expected:  "hello",
			expectErr: false,
		},
		{
			name: "content type object_string with text",
			message: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "text", "text": "hello world"}]`,
			},
			setupMock: func() {},
			expected:  "hello world",
			expectErr: false,
		},
		{
			name: "content type object_string with file",
			message: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "file", "file_id": "123"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(&service.GetFileResponse{
					File: &uploadentity.File{Url: "https://example.com/file"},
				}, nil)
			},
			expected:  "https://example.com/file",
			expectErr: false,
		},
		{
			name: "content type object_string with text and file",
			message: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "text", "text": "see this file"}, {"type": "file", "file_id": "123"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(&service.GetFileResponse{
					File: &uploadentity.File{Url: "https://example.com/file"},
				}, nil)
			},
			expected:  "see this file,https://example.com/file",
			expectErr: false,
		},
		{
			name: "get file error",
			message: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "file", "file_id": "123"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(nil, errors.New("get file error"))
			},
			expectErr: true,
		},
		{
			name: "file not found",
			message: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "file", "file_id": "123"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(&service.GetFileResponse{
					File: nil,
				}, nil)
			},
			expectErr: true,
		},
		{
			name: "invalid content type",
			message: &workflow.EnterMessage{
				ContentType: "invalid",
			},
			setupMock: func() {},
			expectErr: true,
		},
		{
			name: "invalid json",
			message: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `invalid-json`,
			},
			setupMock: func() {},
			expectErr: true,
		},
	}

	w := &ApplicationService{}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()
			result, err := w.makeChatFlowUserInput(ctx, tt.message)
			if tt.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func Test_toConversationMessage(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUpload := uploadmock.NewMockUploader(ctrl)
	crossupload.SetDefaultSVC(mockUpload)

	bizID, cid, userID, roundID, sectionID := int64(2), int64(1), int64(4), int64(3), int64(5)

	tests := []struct {
		name        string
		msg         *workflow.EnterMessage
		messageType messageentity.MessageType
		setupMock   func()
		expected    *messageentity.Message
		expectErr   bool
	}{
		{
			name: "content type text",
			msg: &workflow.EnterMessage{
				ContentType: "text",
				Content:     "hello",
			},
			messageType: messageentity.MessageTypeQuestion,
			setupMock:   func() {},
			expected: &messageentity.Message{
				Role:           schema.User,
				ConversationID: cid,
				AgentID:        bizID,
				RunID:          roundID,
				Content:        "hello",
				ContentType:    messageentity.ContentTypeText,
				MessageType:    messageentity.MessageTypeQuestion,
				UserID:         strconv.FormatInt(userID, 10),
				SectionID:      sectionID,
			},
			expectErr: false,
		},
		{
			name: "content type object_string with text",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "text", "text": "hello"}]`,
			},
			messageType: messageentity.MessageTypeQuestion,
			setupMock:   func() {},
			expected: &messageentity.Message{
				Role:           schema.User,
				MessageType:    messageentity.MessageTypeQuestion,
				ConversationID: cid,
				AgentID:        bizID,
				UserID:         strconv.FormatInt(userID, 10),
				RunID:          roundID,
				ContentType:    messageentity.ContentTypeMix,
				DisplayContent: `[{"type": "text", "text": "hello"}]`,
				MultiContent: []*messageentity.InputMetaData{
					{Type: messageentity.InputTypeText, Text: "hello"},
				},
				SectionID: sectionID,
			},
			expectErr: false,
		},
		{
			name: "content type object_string with file",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "file", "file_id": "123"}]`,
			},
			messageType: messageentity.MessageTypeQuestion,
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(&service.GetFileResponse{
					File: &uploadentity.File{Url: "https://example.com/file", TosURI: "tos://uri", Name: "file.txt"},
				}, nil)
			},
			expected: &messageentity.Message{
				Role:           schema.User,
				MessageType:    messageentity.MessageTypeQuestion,
				ConversationID: cid,
				AgentID:        bizID,
				UserID:         strconv.FormatInt(userID, 10),
				RunID:          roundID,
				ContentType:    messageentity.ContentTypeMix,
				DisplayContent: `[{"type": "file", "file_id": "123"}]`,
				MultiContent: []*messageentity.InputMetaData{
					{
						Type: "file",
						FileData: []*messageentity.FileData{
							{Url: "https://example.com/file", URI: "tos://uri", Name: "file.txt"},
						},
					},
				},
				SectionID: sectionID,
			},
			expectErr: false,
		},
		{
			name: "get file error",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "file", "file_id": "123"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(nil, errors.New("get file error"))
			},
			expectErr: true,
		},
		{
			name: "file not found",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "file", "file_id": "123"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(&service.GetFileResponse{}, nil)
			},
			expectErr: true,
		},
		{
			name: "invalid content type",
			msg: &workflow.EnterMessage{
				ContentType: "invalid",
			},
			setupMock: func() {},
			expectErr: true,
		},
		{
			name: "invalid json",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     "invalid-json",
			},
			setupMock: func() {},
			expectErr: true,
		},
		{
			name: "invalid input type",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "invalid"}]`,
			},
			setupMock: func() {},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()
			result, err := toConversationMessage(ctx, bizID, cid, userID, roundID, sectionID, tt.messageType, tt.msg)
			if tt.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func Test_toSchemaMessage(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUpload := uploadmock.NewMockUploader(ctrl)
	crossupload.SetDefaultSVC(mockUpload)

	tests := []struct {
		name      string
		msg       *workflow.EnterMessage
		setupMock func()
		expected  *schema.Message
		expectErr bool
	}{
		{
			name: "content type text",
			msg: &workflow.EnterMessage{
				ContentType: "text",
				Content:     "hello",
			},
			setupMock: func() {},
			expected: &schema.Message{
				Role:    schema.User,
				Content: "hello",
			},
			expectErr: false,
		},
		{
			name: "content type object_string with text",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "text", "text": "hello"}]`,
			},
			setupMock: func() {},
			expected: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{Type: schema.ChatMessagePartTypeText, Text: "hello"},
				},
			},
			expectErr: false,
		},
		{
			name: "content type object_string with image",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "image", "file_id": "123"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(&service.GetFileResponse{
					File: &uploadentity.File{Url: "https://example.com/image.png"},
				}, nil)
			},
			expected: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type:     schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{URL: "https://example.com/image.png"},
					},
				},
			},
			expectErr: false,
		},
		{
			name: "content type object_string with various file types",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "file", "file_id": "1"}, {"type": "audio", "file_id": "2"}, {"type": "video", "file_id": "3"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 1}).Return(&service.GetFileResponse{File: &uploadentity.File{Url: "https://example.com/file"}}, nil)
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 2}).Return(&service.GetFileResponse{File: &uploadentity.File{Url: "https://example.com/audio"}}, nil)
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 3}).Return(&service.GetFileResponse{File: &uploadentity.File{Url: "https://example.com/video"}}, nil)
			},
			expected: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{Type: schema.ChatMessagePartTypeFileURL, FileURL: &schema.ChatMessageFileURL{URL: "https://example.com/file"}},
					{Type: schema.ChatMessagePartTypeAudioURL, AudioURL: &schema.ChatMessageAudioURL{URL: "https://example.com/audio"}},
					{Type: schema.ChatMessagePartTypeVideoURL, VideoURL: &schema.ChatMessageVideoURL{URL: "https://example.com/video"}},
				},
			},
			expectErr: false,
		},
		{
			name: "get file error",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "file", "file_id": "123"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(nil, errors.New("get file error"))
			},
			expectErr: true,
		},
		{
			name: "file not found",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "file", "file_id": "123"}]`,
			},
			setupMock: func() {
				mockUpload.EXPECT().GetFile(gomock.Any(), &service.GetFileRequest{ID: 123}).Return(&service.GetFileResponse{}, nil)
			},
			expectErr: true,
		},
		{
			name: "invalid content type",
			msg: &workflow.EnterMessage{
				ContentType: "invalid",
			},
			setupMock: func() {},
			expectErr: true,
		},
		{
			name: "invalid json",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     "invalid-json",
			},
			setupMock: func() {},
			expectErr: true,
		},
		{
			name: "invalid input type",
			msg: &workflow.EnterMessage{
				ContentType: "object_string",
				Content:     `[{"type": "invalid"}]`,
			},
			setupMock: func() {},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()
			result, err := toSchemaMessage(ctx, tt.msg)
			if tt.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func Test_makeChatFlowHistoryMessages(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockAgentRun := agentrunmock.NewMockAgentRun(ctrl)
	crossagentrun.SetDefaultSVC(mockAgentRun)
	mockUpload := uploadmock.NewMockUploader(ctrl)
	crossupload.SetDefaultSVC(mockUpload)

	bizID, conversationID, userID, sectionID, connectorID := int64(2), int64(1), int64(3), int64(4), int64(5)

	tests := []struct {
		name      string
		messages  []*workflow.EnterMessage
		setupMock func()
		expected  []*messageentity.Message
		expectErr bool
	}{
		{
			name:      "empty messages",
			messages:  []*workflow.EnterMessage{},
			setupMock: func() {},
			expected:  []*messageentity.Message{},
			expectErr: false,
		},
		{
			name: "one user message",
			messages: []*workflow.EnterMessage{
				{Role: "user", ContentType: "text", Content: "hello"},
			},
			setupMock: func() {
				mockAgentRun.EXPECT().Create(gomock.Any(), gomock.Any()).Return(&agententity.RunRecordMeta{ID: 100}, nil).Times(1)
			},
			expected: []*messageentity.Message{
				{
					Role:           schema.User,
					ConversationID: conversationID,
					AgentID:        bizID,
					RunID:          100,
					Content:        "hello",
					ContentType:    messageentity.ContentTypeText,
					MessageType:    messageentity.MessageTypeQuestion,
					UserID:         strconv.FormatInt(userID, 10),
					SectionID:      sectionID,
				},
			},
			expectErr: false,
		},
		{
			name: "user and assistant message",
			messages: []*workflow.EnterMessage{
				{Role: "user", ContentType: "text", Content: "hello"},
				{Role: "assistant", ContentType: "text", Content: "hi"},
			},
			setupMock: func() {
				mockAgentRun.EXPECT().Create(gomock.Any(), gomock.Any()).Return(&agententity.RunRecordMeta{ID: 100}, nil).Times(1)
			},
			expected: []*messageentity.Message{
				{
					Role:           schema.User,
					ConversationID: conversationID,
					AgentID:        bizID,
					RunID:          100,
					Content:        "hello",
					ContentType:    messageentity.ContentTypeText,
					MessageType:    messageentity.MessageTypeQuestion,
					UserID:         strconv.FormatInt(userID, 10),
					SectionID:      sectionID,
				},
				{
					Role:           schema.User,
					ConversationID: conversationID,
					AgentID:        bizID,
					RunID:          100,
					Content:        "hi",
					ContentType:    messageentity.ContentTypeText,
					MessageType:    messageentity.MessageTypeAnswer,
					UserID:         strconv.FormatInt(userID, 10),
					SectionID:      sectionID,
				},
			},
			expectErr: false,
		},
		{
			name: "only assistant message",
			messages: []*workflow.EnterMessage{
				{Role: "assistant", ContentType: "text", Content: "hi"},
			},
			setupMock: func() {},
			expected:  []*messageentity.Message{},
			expectErr: false,
		},
		{
			name: "create run record error",
			messages: []*workflow.EnterMessage{
				{Role: "user", ContentType: "text", Content: "hello"},
			},
			setupMock: func() {
				mockAgentRun.EXPECT().Create(gomock.Any(), gomock.Any()).Return(nil, errors.New("db error"))
			},
			expectErr: true,
		},
		{
			name: "invalid role",
			messages: []*workflow.EnterMessage{
				{Role: "system", ContentType: "text", Content: "hello"},
			},
			setupMock: func() {},
			expectErr: true,
		},
		{
			name: "toConversationMessage error",
			messages: []*workflow.EnterMessage{
				{Role: "user", ContentType: "invalid", Content: "hello"},
			},
			setupMock: func() {
				mockAgentRun.EXPECT().Create(gomock.Any(), gomock.Any()).Return(&agententity.RunRecordMeta{ID: 100}, nil)
			},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()
			result, err := makeChatFlowHistoryMessages(ctx, bizID, conversationID, userID, sectionID, connectorID, tt.messages)
			if tt.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}
