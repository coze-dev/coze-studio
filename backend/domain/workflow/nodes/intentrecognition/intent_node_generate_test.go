package intentrecognition

import (
	"context"
	"github.com/stretchr/testify/assert"
	"testing"

	"github.com/bytedance/mockey"
	model2 "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/infra/contract/model"
	implmodel "code.byted.org/flow/opencoze/backend/infra/impl/model"
)

type mockDefaultFactory struct {
}
type mockChatModel struct {
}

func (m *mockChatModel) Generate(ctx context.Context, input []*schema.Message, opts ...model2.Option) (*schema.Message, error) {
	msg := &schema.Message{
		Content: `{"classificationId":1,"reason":"The user mentioned feeling happy in their input."}`,
	}
	return msg, nil
}

func (m *mockChatModel) Stream(ctx context.Context, input []*schema.Message, opts ...model2.Option) (*schema.StreamReader[*schema.Message], error) {
	return nil, nil
}

func (m *mockChatModel) BindTools(tools []*schema.ToolInfo) error {
	return nil
}

func (d *mockDefaultFactory) CreateChatModel(ctx context.Context, protocol model.Protocol, config *model.Config) (model.ChatModel, error) {
	return &mockChatModel{}, nil
}

func TestNewIntentGenerateNode(t *testing.T) {
	defer mockey.Mock(implmodel.NewDefaultFactory).Return(&mockDefaultFactory{}, nil).Build().UnPatch()
	cfg := &Config{
		Intents:      []string{"高兴", "悲伤"},
		SystemPrompt: "{{query}}",
		ModelConfig:  &ModelConfig{},
	}
	n, err := NewIntentGenerateNode(context.Background(), cfg)
	assert.Nil(t, err)

	lb, err := n.GenerateLambada(context.Background())
	assert.Nil(t, err)

	o, err := lb(context.Background(), NodeInput{Query: "我考了100分,很高兴"})
	assert.Nil(t, err)
	assert.Equal(t, o.ClassificationID, int64(1))
}
