package wrap

import (
	"context"

	"github.com/cloudwego/eino-ext/components/embedding/ark"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/embedding"
)

func NewArkEmbedder(ctx context.Context, config *ark.EmbeddingConfig, dimensions int64) (contract.Embedder, error) {
	emb, err := ark.NewEmbedder(ctx, config)
	if err != nil {
		return nil, err
	}

	return &denseOnlyWrap{dims: dimensions, Embedder: emb}, nil
}
