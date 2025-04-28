package llm_based

import (
	"context"

	"github.com/cloudwego/eino/schema"

	chatmodel2 "code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/impl/chatmodel"
)

type nl2sql struct {
	cm           chatmodel2.ChatModel
	nl2sqlPrompt string
}

// 这里先硬编码一些
func NewNL2Sql(config *chatmodel2.Config, nl2sqlPrompt string) *nl2sql {
	factory := chatmodel.NewDefaultFactory(nil)
	cfg := &chatmodel2.Config{
		BaseURL:          "https://search.bytedance.net/gpt/openapi/online/v2/crawl",
		APIKey:           "Kf03Hzesjg20yBr48qKEoPN41xQYs1rs",
		Timeout:          0,
		Model:            "gpt-4o-2024-05-13",
		Temperature:      nil,
		FrequencyPenalty: nil,
		PresencePenalty:  nil,
		MaxTokens:        nil,
		TopP:             nil,
		TopK:             nil,
		Stop:             nil,
		OpenAI: &chatmodel2.OpenAIConfig{
			ByAzure:        true,
			APIVersion:     "",
			ResponseFormat: nil,
		},
	}
	cm, err := factory.CreateChatModel(context.Background(), chatmodel2.ProtocolOpenAI, cfg)
	if err != nil {
		panic(err)
	}
	nl2sqlPrompt = `todo`
	return &nl2sql{
		cm:           cm,
		nl2sqlPrompt: nl2sqlPrompt,
	}
}

func (r *nl2sql) NL2Sql(ctx context.Context, query string, chatHistory []*schema.Message, tableSchema string) (sqlString string, err error) {
	// todo 待实现
	return "", nil
}
