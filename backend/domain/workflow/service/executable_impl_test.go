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

package service

import (
	"context"
	"errors"
	"testing"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	messagemock "github.com/coze-dev/coze-studio/backend/crossdomain/message/messagemock"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	mock_workflow "github.com/coze-dev/coze-studio/backend/internal/mock/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestImpl_handleHistory(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t, gomock.WithOverridableExpectations())
	defer ctrl.Finish()

	// Setup for cross-domain service mock
	mockMessage := messagemock.NewMockMessage(ctrl)
	crossmessage.SetDefaultSVC(mockMessage)

	tests := []struct {
		name                  string
		setupMock             func(service *mock_workflow.MockService, msgSvc *messagemock.MockMessage, repo *mock_workflow.MockRepository)
		config                *workflowModel.ExecuteConfig
		input                 map[string]any
		historyRounds         int64
		shouldFetch           bool
		expectErr             bool
		expectedHistory       []*crossmessage.WfMessage
		expectedSchemaHistory []*schema.Message
	}{
		{
			name:          "historyRounds is zero",
			historyRounds: 0,
			shouldFetch:   true,
			config:        &workflowModel.ExecuteConfig{},
			setupMock: func(service *mock_workflow.MockService, msgSvc *messagemock.MockMessage, repo *mock_workflow.MockRepository) {
			},
			expectErr: false,
		},
		{
			name:          "shouldFetch is false",
			historyRounds: 5,
			shouldFetch:   false,
			config: &workflowModel.ExecuteConfig{
				AppID:          ptr.Of(int64(1)),
				ConversationID: ptr.Of(int64(100)),
				SectionID:      ptr.Of(int64(101)),
			},
			setupMock: func(service *mock_workflow.MockService, msgSvc *messagemock.MockMessage, repo *mock_workflow.MockRepository) {
				msgSvc.EXPECT().GetLatestRunIDs(gomock.Any(), gomock.Any()).Return([]int64{1, 2}, nil).AnyTimes()
				msgSvc.EXPECT().GetMessagesByRunIDs(gomock.Any(), gomock.Any()).Return(&crossmessage.GetMessagesByRunIDsResponse{
					Messages: []*crossmessage.WfMessage{{ID: 1}},
					SchemaMessages: []*schema.Message{{
						Role:    schema.User,
						Content: "123",
					}},
				}, nil).AnyTimes()
			},
			expectErr:       false,
			expectedHistory: []*crossmessage.WfMessage{{ID: 1}},
			expectedSchemaHistory: []*schema.Message{{
				Role:    schema.User,
				Content: "123",
			}},
		},
		{
			name:          "fetch conversation by name - conversation exists",
			historyRounds: 3,
			shouldFetch:   true,
			config:        &workflowModel.ExecuteConfig{AppID: ptr.Of(int64(1))},
			input:         map[string]any{"CONVERSATION_NAME": "test-conv"},
			setupMock: func(service *mock_workflow.MockService, msgSvc *messagemock.MockMessage, repo *mock_workflow.MockRepository) {
				service.EXPECT().GetOrCreateConversation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), "test-conv").Return(int64(200), int64(201), nil).AnyTimes()
				msgSvc.EXPECT().GetLatestRunIDs(gomock.Any(), gomock.Any()).Return([]int64{3, 4}, nil).AnyTimes()
				msgSvc.EXPECT().GetMessagesByRunIDs(gomock.Any(), gomock.Any()).Return(&crossmessage.GetMessagesByRunIDsResponse{
					Messages: []*crossmessage.WfMessage{{ID: 2}},
					SchemaMessages: []*schema.Message{{
						Role:    schema.Assistant,
						Content: "123",
					}},
				}, nil).AnyTimes()
				repo.EXPECT().GetConversationTemplate(gomock.Any(), gomock.Any(), gomock.Any()).Return(&entity.ConversationTemplate{
					TemplateID: int64(202),
					SpaceID:    int64(203),
					AppID:      int64(204),
				}, true, nil).AnyTimes()
				repo.EXPECT().GetOrCreateStaticConversation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(int64(205), int64(206), true, nil).AnyTimes()
			},
			expectErr:       false,
			expectedHistory: []*crossmessage.WfMessage{{ID: 2}},
			expectedSchemaHistory: []*schema.Message{{
				Role:    schema.Assistant,
				Content: "123",
			}},
		},
		{
			name:          "fetch conversation by name - conversation not exists",
			historyRounds: 3,
			shouldFetch:   true,
			config:        &workflowModel.ExecuteConfig{AgentID: ptr.Of(int64(2))},
			input:         map[string]any{"CONVERSATION_NAME": "new-conv"},
			setupMock: func(service *mock_workflow.MockService, msgSvc *messagemock.MockMessage, repo *mock_workflow.MockRepository) {
				service.EXPECT().GetOrCreateConversation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), "new-conv").Return(int64(300), int64(301), nil).AnyTimes()
				msgSvc.EXPECT().GetLatestRunIDs(gomock.Any(), gomock.Any()).Return([]int64{5, 6}, nil).AnyTimes()
				msgSvc.EXPECT().GetMessagesByRunIDs(gomock.Any(), gomock.Any()).Return(&crossmessage.GetMessagesByRunIDsResponse{
					Messages: []*crossmessage.WfMessage{{ID: 3}},
				}, nil).AnyTimes()
				repo.EXPECT().GetConversationTemplate(gomock.Any(), gomock.Any(), gomock.Any()).Return(&entity.ConversationTemplate{
					TemplateID: int64(202),
					SpaceID:    int64(203),
					AppID:      int64(204),
				}, false, nil).AnyTimes()
				repo.EXPECT().GetOrCreateDynamicConversation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(int64(205), int64(206), true, nil).AnyTimes()
			},
			expectErr:       false,
			expectedHistory: []*crossmessage.WfMessage{{ID: 3}},
		},
		{
			name:          "input with wrong type for conversation name",
			historyRounds: 5,
			shouldFetch:   true,
			config:        &workflowModel.ExecuteConfig{AppID: ptr.Of(int64(1))},
			input:         map[string]any{"CONVERSATION_NAME": 12345},
			setupMock: func(service *mock_workflow.MockService, msgSvc *messagemock.MockMessage, repo *mock_workflow.MockRepository) {
			},
			expectErr: true,
		},
		{
			name:          "GetOrCreateConversation returns error",
			historyRounds: 5,
			shouldFetch:   true,
			config:        &workflowModel.ExecuteConfig{AppID: ptr.Of(int64(1))},
			input:         map[string]any{"CONVERSATION_NAME": "fail-conv"},
			setupMock: func(service *mock_workflow.MockService, msgSvc *messagemock.MockMessage, repo *mock_workflow.MockRepository) {
				service.EXPECT().GetOrCreateConversation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), "fail-conv").Return(int64(0), int64(0), errors.New("db error")).AnyTimes()
				repo.EXPECT().GetConversationTemplate(gomock.Any(), gomock.Any(), gomock.Any()).Return(&entity.ConversationTemplate{
					TemplateID: int64(202),
					SpaceID:    int64(203),
					AppID:      int64(204),
				}, false, nil).AnyTimes()
				repo.EXPECT().GetOrCreateDynamicConversation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Return(int64(205), int64(206), true, errors.New("db error")).AnyTimes()
			},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockService := mock_workflow.NewMockService(ctrl)
			mockRepo := mock_workflow.NewMockRepository(ctrl)
			testImpl := &impl{repo: mockRepo, conversationImpl: &conversationImpl{repo: mockRepo}}

			tt.setupMock(mockService, mockMessage, mockRepo)

			err := testImpl.handleHistory(ctx, tt.config, tt.input, tt.historyRounds, tt.shouldFetch)

			if tt.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				if tt.expectedHistory != nil {
					assert.Equal(t, tt.expectedHistory, tt.config.ConversationHistory)
				} else if tt.historyRounds == 0 {
					assert.Nil(t, tt.config.ConversationHistory)
				} else if tt.expectedSchemaHistory != nil {
					assert.Equal(t, tt.expectedSchemaHistory, tt.config.ConversationHistorySchemaMessages)
				}
			}
		})
	}
}

func TestImpl_prefetchChatHistory(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t, gomock.WithOverridableExpectations())
	defer ctrl.Finish()

	mockMessage := messagemock.NewMockMessage(ctrl)
	crossmessage.SetDefaultSVC(mockMessage)

	tests := []struct {
		name          string
		setupMock     func(msgSvc *messagemock.MockMessage)
		config        workflowModel.ExecuteConfig
		historyRounds int64
		expectErr     bool
	}{
		{
			name: "SectionID is nil",
			config: workflowModel.ExecuteConfig{
				ConversationID: ptr.Of(int64(100)),
				AppID:          ptr.Of(int64(1)),
			},
			historyRounds: 5,
			setupMock:     func(msgSvc *messagemock.MockMessage) {},
			expectErr:     false,
		},
		{
			name: "ConversationID is nil",
			config: workflowModel.ExecuteConfig{
				SectionID: ptr.Of(int64(101)),
				AppID:     ptr.Of(int64(1)),
			},
			historyRounds: 5,
			setupMock:     func(msgSvc *messagemock.MockMessage) {},
			expectErr:     false,
		},
		{
			name: "AppID and AgentID are both nil",
			config: workflowModel.ExecuteConfig{
				ConversationID: ptr.Of(int64(100)),
				SectionID:      ptr.Of(int64(101)),
			},
			historyRounds: 5,
			setupMock:     func(msgSvc *messagemock.MockMessage) {},
			expectErr:     false,
		},
		{
			name: "GetLatestRunIDs returns error",
			config: workflowModel.ExecuteConfig{
				AppID:          ptr.Of(int64(1)),
				ConversationID: ptr.Of(int64(100)),
				SectionID:      ptr.Of(int64(101)),
			},
			historyRounds: 5,
			setupMock: func(msgSvc *messagemock.MockMessage) {
				msgSvc.EXPECT().GetLatestRunIDs(gomock.Any(), gomock.Any()).Return(nil, errors.New("db error"))
			},
			expectErr: true,
		},
		{
			name: "GetMessagesByRunIDs returns error",
			config: workflowModel.ExecuteConfig{
				AppID:          ptr.Of(int64(1)),
				ConversationID: ptr.Of(int64(100)),
				SectionID:      ptr.Of(int64(101)),
			},
			historyRounds: 5,
			setupMock: func(msgSvc *messagemock.MockMessage) {
				msgSvc.EXPECT().GetLatestRunIDs(gomock.Any(), gomock.Any()).Return([]int64{1, 2, 3}, nil)
				msgSvc.EXPECT().GetMessagesByRunIDs(gomock.Any(), gomock.Any()).Return(nil, errors.New("db error"))
			},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			testImpl := &impl{}
			tt.setupMock(mockMessage)

			_, _, err := testImpl.prefetchChatHistory(ctx, tt.config, tt.historyRounds)

			if tt.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
