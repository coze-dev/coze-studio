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

	"github.com/cloudwego/eino/schema"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
)

type CreateConversationRequest struct {
	AppID       int64
	UserID      int64
	ConnectorID int64
}

type CreateMessageRequest struct {
	ConversationID int64
	Role           string
	Content        string
	ContentType    string
	UserID         int64
	AppID          int64
	RunID          int64
}

type MessageListRequest struct {
	ConversationID int64
	Limit          int64
	BeforeID       *string
	AfterID        *string
	UserID         int64
	AppID          int64
	OrderBy        *string
}

type MessageListResponse struct {
	Messages []*Message
	FirstID  string
	LastID   string
	HasMore  bool
}

var conversationManagerImpl ConversationManager

func GetConversationManager() ConversationManager {
	return conversationManagerImpl
}

func SetConversationManager(c ConversationManager) {
	conversationManagerImpl = c
}

type ConversationHistoryRequest struct {
	ConversationID int64
	AppID          int64
	UserID         int64
	Rounds         int64
}

type Content struct {
	Type message.InputType `json:"type"`
	Text *string           `json:"text,omitempty"`
	Uri  *string           `json:"uri,omitempty"`
}

type Message struct {
	ID           int64
	Role         schema.RoleType `json:"role"` // user or assistant
	MultiContent []*Content      `json:"multi_content"`
	Text         *string         `json:"text,omitempty"`
	ContentType  string          `json:"content_type"`
}

type ConversationHistoryResponse struct {
	Messages []*Message
}

type GetLatestRunIDsRequest struct {
	ConversationID int64
	UserID         int64
	AppID          int64
	Rounds         int64
}
type ClearConversationHistoryReq struct {
	ConversationID int64
}

type DeleteMessageRequest struct {
	ConversationID int64
	MessageID      int64
}

type EditMessageRequest struct {
	ConversationID int64
	MessageID      int64
	Content        string
}

type GetMessagesByRunIDsRequest struct {
	ConversationID int64
	RunIDs         []int64
}

type GetMessagesByRunIDsResponse struct {
	Messages []*Message
}

//go:generate  mockgen -destination conversationmock/conversation_mock.go --package conversationmock -source conversation.go
type ConversationManager interface {
	CreateConversation(ctx context.Context, req *CreateConversationRequest) (int64, error)
	CreateMessage(ctx context.Context, req *CreateMessageRequest) (int64, error)
	MessageList(ctx context.Context, req *MessageListRequest) (*MessageListResponse, error)
	GetLatestRunIDs(ctx context.Context, req *GetLatestRunIDsRequest) ([]int64, error)
	GetMessagesByRunIDs(ctx context.Context, req *GetMessagesByRunIDsRequest) (*GetMessagesByRunIDsResponse, error)
	ClearConversationHistory(ctx context.Context, req *ClearConversationHistoryReq) error
	DeleteMessage(ctx context.Context, req *DeleteMessageRequest) error
	EditMessage(ctx context.Context, req *EditMessageRequest) error
}
