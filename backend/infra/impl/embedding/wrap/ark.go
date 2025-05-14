package wrap

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino-ext/components/embedding/ark"
	"github.com/cloudwego/eino/components/embedding"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/embedding"
)

func NewArkEmbedder(ctx context.Context, config *ark.EmbeddingConfig, dimensions int64) (contract.Embedder, error) {
	emb, err := ark.NewEmbedder(ctx, config)
	if err != nil {
		return nil, err
	}

	return &arkEmbedding{dims: dimensions, Embedder: emb}, nil
}

type arkEmbedding struct {
	dims int64
	embedding.Embedder
}

func (a arkEmbedding) EmbedStringsHybrid(ctx context.Context, texts []string, opts ...embedding.Option) ([][]float64, []map[int]float64, error) {
	return nil, nil, fmt.Errorf("[ark embedding] EmbedStringsHybrid not support")
}

func (a arkEmbedding) Dimensions() int64 {
	return a.dims
}

func (a arkEmbedding) SupportStatus() contract.SupportStatus {
	return contract.SupportDense
}
