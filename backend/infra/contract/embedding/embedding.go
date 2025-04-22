package embedding

import (
	"context"

	"github.com/cloudwego/eino/components/embedding"
)

type Embedder interface {
	embedding.Embedder
	EmbedStringsHybrid(ctx context.Context, text []string, opts ...embedding.Option) ([][]float64, []map[int]float64, error) // hybrid embedding
	Dimensions() int64
	SupportStatus() SupportStatus
}

type SupportStatus int

const (
	SupportDense          SupportStatus = 1
	SupportDenseAndSparse SupportStatus = 3
)
