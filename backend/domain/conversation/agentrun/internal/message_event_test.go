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
package internal

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/mock/gomock"

	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/crossdomain/message/messagemock"
	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
)

func TestHandlerToolResponsePersistsEveryToolMessage(t *testing.T) {
	ctrl := gomock.NewController(t)
	messageSVC := messagemock.NewMockMessage(ctrl)
	previousMessageSVC := crossmessage.DefaultSVC()
	crossmessage.SetDefaultSVC(messageSVC)
	defer crossmessage.SetDefaultSVC(previousMessageSVC)

	createdMessages := make([]*message.Message, 0, 2)
	messageSVC.EXPECT().Create(gomock.Any(), gomock.Any()).DoAndReturn(
		func(_ context.Context, msg *message.Message) (*message.Message, error) {
			if msg.ID == 0 {
				msg.ID = int64(100 + len(createdMessages))
			}
			createdMessages = append(createdMessages, msg)
			return msg, nil
		},
	).Times(2)

	streamReader, streamWriter := schema.Pipe[*entity.AgentRunResponse](2)
	defer streamReader.Close()
	defer streamWriter.Close()

	runtime := &AgentRuntime{
		RunRecord: &entity.RunRecordMeta{ID: 10},
		RunMeta: &entity.AgentRunMeta{
			ConversationID: 20,
			SectionID:      30,
			AgentID:        40,
			UserID:         "test-user",
		},
		StartTime: time.Now(),
	}
	handler := &MessageEventHandler{messageEvent: NewMessageEvent(), sw: streamWriter}
	firstToolMessage := &schema.Message{
		Role:       schema.Tool,
		Content:    "first result",
		ToolCallID: "call_1",
		ToolName:   "first_tool",
	}
	secondToolMessage := &schema.Message{
		Role:       schema.Tool,
		Content:    "second result",
		ToolCallID: "call_2",
		ToolName:   "second_tool",
	}
	chunk := &entity.AgentRespEvent{
		ToolsMessage: []*schema.Message{nil, firstToolMessage, secondToolMessage},
	}
	preToolResponseMsg := &message.Message{ID: 50, CreatedAt: 60, UpdatedAt: 70}

	err := handler.handlerTooResponse(context.Background(), chunk, runtime, preToolResponseMsg, "mid answer")
	require.NoError(t, err)
	require.Len(t, createdMessages, 2)

	assert.Equal(t, int64(50), createdMessages[0].ID)
	assert.Equal(t, int64(60), createdMessages[0].CreatedAt)
	assert.Equal(t, int64(70), createdMessages[0].UpdatedAt)
	assert.Equal(t, "mid answer\nfirst result", createdMessages[0].Content)
	assert.NotEqual(t, int64(50), createdMessages[1].ID)
	assert.Equal(t, "second result", createdMessages[1].Content)

	for i, expected := range []*schema.Message{firstToolMessage, secondToolMessage} {
		var stored schema.Message
		require.NoError(t, json.Unmarshal([]byte(createdMessages[i].ModelContent), &stored))
		assert.Equal(t, expected.ToolCallID, stored.ToolCallID)
		assert.Equal(t, expected.ToolName, stored.ToolName)
	}

	assert.Equal(t, []*schema.Message{nil, firstToolMessage, secondToolMessage}, chunk.ToolsMessage)
	for range 2 {
		event, recvErr := streamReader.Recv()
		require.NoError(t, recvErr)
		assert.Equal(t, entity.RunEventMessageCompleted, event.Event)
	}
}
