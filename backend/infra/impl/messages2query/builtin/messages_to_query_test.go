package builtin

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
)

func TestM2Q(t *testing.T) {
	ctx := context.Background()
	impl, err := NewMessagesToQuery(ctx, &mockChatModel{}, prompt.FromMessages(schema.Jinja2,
		schema.SystemMessage("system message 123"),
		schema.UserMessage("{{messages}}")))
	assert.NoError(t, err)

	t.Run("test empty messages", func(t *testing.T) {
		q, err := impl.MessagesToQuery(ctx, []*schema.Message{})
		assert.Error(t, err)
		assert.Equal(t, "", q)
	})

	t.Run("test success", func(t *testing.T) {
		q, err := impl.MessagesToQuery(ctx, []*schema.Message{
			schema.UserMessage("hello"),
		})
		assert.NoError(t, err)
		assert.Equal(t, "mock resp", q)
	})

}

type mockChatModel struct{}

func (m mockChatModel) Generate(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.Message, error) {
	return schema.AssistantMessage("mock resp", nil), nil
}

func (m mockChatModel) Stream(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	return nil, nil
}

func (m mockChatModel) BindTools(tools []*schema.ToolInfo) error {
	return nil
}
