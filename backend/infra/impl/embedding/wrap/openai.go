package wrap

import (
	"context"

	"github.com/cloudwego/eino-ext/components/embedding/openai"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/embedding"
)

func NewOpenAIEmbedder(ctx context.Context, config *openai.EmbeddingConfig, dimensions int64) (contract.Embedder, error) {
	emb, err := openai.NewEmbedder(ctx, config)
	if err != nil {
		return nil, err
	}
	return &denseOnlyWrap{dims: dimensions, Embedder: emb}, nil
}
