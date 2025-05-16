package wrap

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/embedding"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/embedding"
)

type denseOnlyWrap struct {
	dims int64
	embedding.Embedder
}

func (d denseOnlyWrap) EmbedStringsHybrid(ctx context.Context, texts []string, opts ...embedding.Option) ([][]float64, []map[int]float64, error) {
	return nil, nil, fmt.Errorf("[denseOnlyWrap] EmbedStringsHybrid not support")
}

func (d denseOnlyWrap) Dimensions() int64 {
	return d.dims
}

func (d denseOnlyWrap) SupportStatus() contract.SupportStatus {
	return contract.SupportDense
}
