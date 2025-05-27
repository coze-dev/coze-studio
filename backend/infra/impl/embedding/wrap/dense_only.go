package wrap

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/embedding"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/embedding"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type denseOnlyWrap struct {
	dims int64
	embedding.Embedder
}

func (d denseOnlyWrap) EmbedStrings(ctx context.Context, texts []string, opts ...embedding.Option) ([][]float64, error) {
	resp := make([][]float64, 0, len(texts))
	for _, part := range slices.Chunks(texts, 100) {
		partResult, err := d.Embedder.EmbedStrings(ctx, part, opts...)
		if err != nil {
			return nil, err
		}
		resp = append(resp, partResult...)
	}
	return resp, nil
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
