package rrf

import (
	"context"
	"fmt"
	"sort"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank"
)

func NewRRFReranker(k int64) rerank.Reranker {
	if k == 0 {
		k = 60
	}
	return &rrfReranker{k}
}

type rrfReranker struct {
	k int64
}

func (r *rrfReranker) Rerank(ctx context.Context, req *rerank.Request) (*rerank.Response, error) {
	if req == nil || req.Data == nil || len(req.Data) == 0 {
		return nil, fmt.Errorf("invalid request: no data provided")
	}

	var scoredDataList []*rerank.ScoredData
	for _, ranking := range req.Data {
		for rank := range ranking {
			data := ranking[rank]
			score := 1 / float64(r.k+int64(rank))
			scoredDataList = append(scoredDataList, &rerank.ScoredData{
				Data:  data,
				Score: score,
			})
		}
	}

	sort.Slice(scoredDataList, func(i, j int) bool {
		return scoredDataList[i].Score > scoredDataList[j].Score
	})

	topN := int64(len(scoredDataList))
	if req.TopN != nil && *req.TopN < topN {
		topN = *req.TopN
	}

	return &rerank.Response{Sorted: scoredDataList[:topN]}, nil
}
