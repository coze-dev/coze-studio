package rrf

import (
	"context"
	"fmt"
	"sort"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/rerank"
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
	id2Score := make(map[string]float64)
	id2Data := make(map[string]*rerank.Data)
	for _, resultList := range req.Data {
		for rank := range resultList {
			result := resultList[rank]
			if result != nil && result.Document != nil {
				score := 1.0 / (float64(rank) + float64(r.k))
				if score > id2Score[result.Document.ID] {
					id2Score[result.Document.ID] = score
					id2Data[result.Document.ID] = result
				}
			}
		}
	}
	var sorted []*rerank.Data
	for _, data := range id2Data {
		sorted = append(sorted, data)
	}
	sort.Slice(sorted, func(i, j int) bool {
		return id2Score[sorted[i].Document.ID] > id2Score[sorted[j].Document.ID]
	})
	topN := int64(len(sorted))
	if req.TopN != nil && *req.TopN != 0 && *req.TopN < topN {
		topN = *req.TopN
	}

	return &rerank.Response{SortedData: sorted[:topN]}, nil
}
