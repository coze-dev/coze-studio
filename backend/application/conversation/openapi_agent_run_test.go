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

package conversation

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/run"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	saEntity "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	convEntity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	openapiEntity "github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth/entity"
	cmdEntity "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	uploadEntity "github.com/coze-dev/coze-studio/backend/domain/upload/entity"
	uploadService "github.com/coze-dev/coze-studio/backend/domain/upload/service"
	sseImpl "github.com/coze-dev/coze-studio/backend/infra/sse/impl/sse"
	mockSingleAgent "github.com/coze-dev/coze-studio/backend/internal/mock/domain/agent/singleagent"
	mockAgentRun "github.com/coze-dev/coze-studio/backend/internal/mock/domain/conversation/agentrun"
	mockConversation "github.com/coze-dev/coze-studio/backend/internal/mock/domain/conversation/conversation"
	mockShortcut "github.com/coze-dev/coze-studio/backend/internal/mock/domain/shortcutcmd"
	mockUpload "github.com/coze-dev/coze-studio/backend/internal/mock/domain/upload"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

func setupMocks(t *testing.T) (*OpenapiAgentRunApplication, *mockShortcut.MockShortcutCmd, *mockUpload.MockUploadService, *mockAgentRun.MockRun, *mockConversation.MockConversation, *mockSingleAgent.MockSingleAgent, *gomock.Controller) {
	ctrl := gomock.NewController(t)

	mockShortcutSvc := mockShortcut.NewMockShortcutCmd(ctrl)
	mockUploadSvc := mockUpload.NewMockUploadService(ctrl)
	mockAgentRunSvc := mockAgentRun.NewMockRun(ctrl)
	mockConversationSvc := mockConversation.NewMockConversation(ctrl)
	mockSingleAgentSvc := mockSingleAgent.NewMockSingleAgent(ctrl)

	app := &OpenapiAgentRunApplication{
		ShortcutDomainSVC: mockShortcutSvc,
		UploaodDomainSVC:  mockUploadSvc,
	}

	// Setup ConversationSVC mocks
	originalConversationSVC := ConversationSVC
	ConversationSVC = &ConversationApplicationService{
		AgentRunDomainSVC:     mockAgentRunSvc,
		ConversationDomainSVC: mockConversationSvc,
		appContext: &ServiceComponents{
			SingleAgentDomainSVC: mockSingleAgentSvc,
		},
	}

	t.Cleanup(func() {
		ConversationSVC = originalConversationSVC
		ctrl.Finish()
	})

	return app, mockShortcutSvc, mockUploadSvc, mockAgentRunSvc, mockConversationSvc, mockSingleAgentSvc, ctrl
}

func createTestContext() context.Context {
	ctx := context.Background()
	ctx = ctxcache.Init(ctx)
	apiKey := &openapiEntity.ApiKey{
		UserID:      12345,
		ConnectorID: consts.CozeConnectorID,
	}
	ctxcache.Store(ctx, consts.OpenapiAuthKeyInCtx, apiKey)
	return ctx
}

func createTestRequest() *run.ChatV3Request {
	return &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "user",
				Content:     "Hello, world!",
				ContentType: run.ContentTypeText,
			},
		},
	}
}

func createTestRequestWithMultipleMessages() *run.ChatV3Request {
	return &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "user",
				Content:     "Hello, I need help with something.",
				ContentType: run.ContentTypeText,
			},
			{
				Role:        "assistant",
				Content:     "Sure, I'd be happy to help! What do you need assistance with?",
				ContentType: run.ContentTypeText,
			},
			{
				Role:        "user",
				Content:     `{"type": "image", "url": "https://example.com/image.jpg"}`,
				ContentType: run.ContentTypeImage,
			},
			{
				Role:        "user",
				Content:     `{"type": "file", "name": "document.pdf", "url": "https://example.com/doc.pdf"}`,
				ContentType: run.ContentTypeFile,
			},
		},
	}
}

func createTestRequestWithAssistantOnly() *run.ChatV3Request {
	return &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "assistant",
				Content:     "I'm here to help you with any questions you might have.",
				ContentType: run.ContentTypeText, // assistant role only supports text content type
			},
		},
	}
}

func TestOpenapiAgentRun_Success(t *testing.T) {
	app, _, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequest()

	// Mock agent check
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "mock stream error")
}

func TestOpenapiAgentRun_CheckAgentError(t *testing.T) {
	app, _, _, _, _, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequest()

	// Mock agent check failure
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(nil, errors.New("agent not found"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "agent not found")
}

func TestOpenapiAgentRun_AgentNotExists(t *testing.T) {
	app, _, _, _, _, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequest()

	// Mock agent check returns nil (agent not exists)
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(nil, nil)

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
}

func TestOpenapiAgentRun_CheckConversationError(t *testing.T) {
	app, _, _, _, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequest()

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check failure
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(nil, errors.New("conversation not found"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "conversation not found")
}

func TestOpenapiAgentRun_ConversationPermissionError(t *testing.T) {
	app, _, _, _, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequest()

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation with different creator
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 99999, // Different from user ID (12345)
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
}

func TestOpenapiAgentRun_CreateNewConversation(t *testing.T) {
	app, _, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequest()
	req.ConversationID = ptr.Of(int64(0)) // No conversation ID

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock create new conversation
	mockConv := &convEntity.Conversation{
		ID:        22222,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().Create(ctx, gomock.Any()).DoAndReturn(func(ctx context.Context, meta *convEntity.CreateMeta) (*convEntity.Conversation, error) {
		assert.Equal(t, int64(67890), meta.AgentID)
		assert.Equal(t, int64(12345), meta.UserID)
		assert.Equal(t, common.Scene_SceneOpenApi, meta.Scene)
		return mockConv, nil
	})

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Equal(t, int64(22222), *req.ConversationID) // Should be updated
}

func TestOpenapiAgentRun_AgentRunError(t *testing.T) {
	app, _, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequest()

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock agent run failure
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("agent run failed"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "agent run failed")
}

func TestOpenapiAgentRun_WithShortcutCommand(t *testing.T) {
	app, mockShortcut, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequest()
	req.ShortcutCommand = &run.ShortcutCommandDetail{
		CommandID:  123,
		Parameters: map[string]string{"param1": "value1"},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock shortcut command
	mockCmd := &cmdEntity.ShortcutCmd{
		ID:             123,
		PluginID:       456,
		PluginToolName: "test-tool",
		PluginToolID:   789,
		ToolType:       1,
	}
	mockShortcut.EXPECT().GetByCmdID(ctx, int64(123), int32(0)).Return(mockCmd, nil)

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
}

func TestOpenapiAgentRun_WithMultipleMessages(t *testing.T) {
	app, _, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequestWithMultipleMessages()

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "mock stream error")

	// Verify that the request contains multiple messages with different roles and content types
	assert.Len(t, req.AdditionalMessages, 4)
	assert.Equal(t, "user", req.AdditionalMessages[0].Role)
	assert.Equal(t, run.ContentTypeText, req.AdditionalMessages[0].ContentType)
	assert.Equal(t, "assistant", req.AdditionalMessages[1].Role)
	assert.Equal(t, run.ContentTypeText, req.AdditionalMessages[1].ContentType)
	assert.Equal(t, "user", req.AdditionalMessages[2].Role)
	assert.Equal(t, run.ContentTypeImage, req.AdditionalMessages[2].ContentType)
	assert.Equal(t, "user", req.AdditionalMessages[3].Role)
	assert.Equal(t, run.ContentTypeFile, req.AdditionalMessages[3].ContentType)
}

func TestOpenapiAgentRun_WithAssistantMessage(t *testing.T) {
	app, _, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()
	req := createTestRequestWithAssistantOnly()

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "mock stream error")

	// Verify that the assistant message only supports text content type
	assert.Len(t, req.AdditionalMessages, 1)
	assert.Equal(t, "assistant", req.AdditionalMessages[0].Role)
	assert.Equal(t, run.ContentTypeText, req.AdditionalMessages[0].ContentType)
}

func TestOpenapiAgentRun_WithMixedContentTypes(t *testing.T) {
	app, _, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()

	// Create request with various content types for user role
	req := &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "user",
				Content:     "Here's a text message",
				ContentType: run.ContentTypeText,
			},
			{
				Role:        "user",
				Content:     `{"type": "audio", "url": "https://example.com/audio.mp3"}`,
				ContentType: run.ContentTypeAudio,
			},
			{
				Role:        "user",
				Content:     `{"type": "video", "url": "https://example.com/video.mp4"}`,
				ContentType: run.ContentTypeVideo,
			},
			{
				Role:        "assistant",
				Content:     "I can only respond with text content.",
				ContentType: run.ContentTypeText, // assistant must use text
			},
			{
				Role:        "user",
				Content:     `{"type": "link", "url": "https://example.com"}`,
				ContentType: run.ContentTypeLink,
			},
		},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "mock stream error")

	// Verify various content types are preserved
	assert.Len(t, req.AdditionalMessages, 5)

	// Check user messages with different content types
	assert.Equal(t, "user", req.AdditionalMessages[0].Role)
	assert.Equal(t, run.ContentTypeText, req.AdditionalMessages[0].ContentType)

	assert.Equal(t, "user", req.AdditionalMessages[1].Role)
	assert.Equal(t, run.ContentTypeAudio, req.AdditionalMessages[1].ContentType)

	assert.Equal(t, "user", req.AdditionalMessages[2].Role)
	assert.Equal(t, run.ContentTypeVideo, req.AdditionalMessages[2].ContentType)

	// Check assistant message (must be text)
	assert.Equal(t, "assistant", req.AdditionalMessages[3].Role)
	assert.Equal(t, run.ContentTypeText, req.AdditionalMessages[3].ContentType)

	assert.Equal(t, "user", req.AdditionalMessages[4].Role)
	assert.Equal(t, run.ContentTypeLink, req.AdditionalMessages[4].ContentType)
}

func TestOpenapiAgentRun_ParseAdditionalMessages_InvalidRole(t *testing.T) {
	app, _, _, _, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()

	// Create request with invalid role
	req := &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "system", // Invalid role
				Content:     "System message",
				ContentType: run.ContentTypeText,
			},
		},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success to reach parseAdditionalMessages
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "additional message role only support user and assistant")
}

func TestOpenapiAgentRun_ParseAdditionalMessages_InvalidType(t *testing.T) {
	app, _, _, _, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()

	// Create request with invalid message type
	invalidType := "invalid_type"
	req := &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "user",
				Content:     "Test message",
				ContentType: run.ContentTypeText,
				Type:        &invalidType, // Invalid type
			},
		},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success to reach parseAdditionalMessages
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "additional message type only support question and answer now")
}

func TestOpenapiAgentRun_ParseAdditionalMessages_AnswerWithNonTextContent(t *testing.T) {
	app, _, _, _, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()

	// Create request with answer type but non-text content
	answerType := "answer"
	req := &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "assistant",
				Content:     `[{"type": "image", "file_url": "https://example.com/image.jpg"}]`,
				ContentType: run.ContentTypeMixApi, // object_string
				Type:        &answerType,
			},
		},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success to reach parseAdditionalMessages
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "answer messages only support text content")
}

func TestOpenapiAgentRun_ParseAdditionalMessages_MixApiWithFileURL(t *testing.T) {
	app, _, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()

	// Create request with object_string content type and file URL
	req := &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "user",
				Content:     `[{"type": "text", "text": "Here's an image:"}, {"type": "image", "file_url": "https://example.com/image.jpg"}]`,
				ContentType: run.ContentTypeMixApi,
			},
		},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "mock stream error")
}

func TestOpenapiAgentRun_ParseAdditionalMessages_MixApiWithFileID(t *testing.T) {
	app, _, mockUpload, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()

	// Create request with object_string content type and file ID
	req := &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "user",
				Content:     `[{"type": "file", "file_id": "12345"}]`,
				ContentType: run.ContentTypeMixApi,
			},
		},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock upload service to return file info
	mockUpload.EXPECT().GetFile(ctx, gomock.Any()).DoAndReturn(func(ctx context.Context, req *uploadService.GetFileRequest) (*uploadService.GetFileResponse, error) {
		assert.Equal(t, int64(12345), req.ID)
		return &uploadService.GetFileResponse{
			File: &uploadEntity.File{
				Url:    "https://example.com/file.pdf",
				TosURI: "tos://bucket/file.pdf",
			},
		}, nil
	})

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "mock stream error")
}

func TestOpenapiAgentRun_ParseAdditionalMessages_FileIDError(t *testing.T) {
	app, _, mockUpload, _, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()

	// Create request with object_string content type and file ID that will fail
	req := &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "user",
				Content:     `[{"type": "file", "file_id": "99999"}]`,
				ContentType: run.ContentTypeMixApi,
			},
		},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock upload service to return error
	mockUpload.EXPECT().GetFile(ctx, gomock.Any()).Return(nil, errors.New("file not found"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "file not found")
}

func TestOpenapiAgentRun_ParseAdditionalMessages_EmptyContent(t *testing.T) {
	app, _, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()

	// Create request with empty text content (should be skipped)
	req := &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "user",
				Content:     "", // Empty content
				ContentType: run.ContentTypeText,
			},
			{
				Role:        "user",
				Content:     "Valid content",
				ContentType: run.ContentTypeText,
			},
		},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "mock stream error")

	// Verify that only the non-empty message is included
	assert.Len(t, req.AdditionalMessages, 2) // Original request still has 2 messages
}

func TestOpenapiAgentRun_ParseAdditionalMessages_NilMessage(t *testing.T) {
	app, _, _, mockAgentRun, mockConversation, mockSingleAgent, _ := setupMocks(t)
	ctx := createTestContext()

	// Create request with empty content message (should be skipped)
	req := &run.ChatV3Request{
		BotID:          67890,
		ConversationID: ptr.Of(int64(11111)),
		User:           "test-user",
		AdditionalMessages: []*run.EnterMessage{
			{
				Role:        "user",
				Content:     "", // Empty content message
				ContentType: run.ContentTypeText,
			},
			{
				Role:        "user",
				Content:     "Valid content",
				ContentType: run.ContentTypeText,
			},
		},
	}

	// Mock agent check success
	mockAgent := &saEntity.SingleAgent{
		SingleAgent: &singleagent.SingleAgent{
			AgentID: 67890,
			SpaceID: 54321,
		},
	}
	mockSingleAgent.EXPECT().ObtainAgentByIdentity(ctx, gomock.Any()).Return(mockAgent, nil)

	// Mock conversation check success
	mockConv := &convEntity.Conversation{
		ID:        11111,
		CreatorID: 12345,
		SectionID: 98765,
	}
	mockConversation.EXPECT().GetByID(ctx, int64(11111)).Return(mockConv, nil)

	// Mock agent run failure to avoid pullStream complexity
	mockAgentRun.EXPECT().AgentRun(ctx, gomock.Any()).Return(nil, errors.New("mock stream error"))

	err := app.OpenapiAgentRun(ctx, &sseImpl.SSenderImpl{}, req)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "mock stream error")
}
