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

import "context"

type ClearMessageRequest struct {
	Name string
}
type ClearMessageResponse struct {
	IsSuccess bool
}
type CreateConversationRequest struct {
	Name string
}

type CreateConversationResponse struct {
	Result map[string]any
}

type ListMessageRequest struct {
	ConversationName string
	Limit            *int
	BeforeID         *string
	AfterID          *string
}
type Message struct {
	ID          string `json:"id"`
	Role        string `json:"role"`
	ContentType string `json:"contentType"`
	Content     string `json:"content"`
}

type ListMessageResponse struct {
	Messages []*Message
	FirstID  string
	LastID   string
	HasMore  bool
}

var ConversationManagerImpl ConversationManager

type ConversationManager interface {
	ClearMessage(context.Context, *ClearMessageRequest) (*ClearMessageResponse, error)
	CreateConversation(ctx context.Context, c *CreateConversationRequest) (*CreateConversationResponse, error)
	MessageList(ctx context.Context, req *ListMessageRequest) (*ListMessageResponse, error)
}
