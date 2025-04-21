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
