package rrf

import (
	"context"
	"fmt"
	"sort"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
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
	sliceScores := make(map[int64]float64)
	// 保证多个来源的slice不会重复
	sliceMap := make(map[int64]*knowledge.RetrieveSlice)
	for _, resultList := range req.Data {
		for rank, result := range resultList {
			if result != nil && result.Slice != nil {
				score := 1.0 / (float64(rank) + float64(r.k))
				if score > sliceScores[result.Slice.ID] {
					sliceScores[result.Slice.ID] = score
					sliceMap[result.Slice.ID] = result
				}
			}
		}
	}
	var sortedSlices []*knowledge.RetrieveSlice
	for _, slice := range sliceMap {
		sortedSlices = append(sortedSlices, slice)
	}
	// 排序
	sort.Slice(sortedSlices, func(i, j int) bool {
		return sliceScores[sortedSlices[i].Slice.ID] > sliceScores[sortedSlices[j].Slice.ID]
	})
	topN := int64(len(sortedSlices))
	if req.TopN != nil && *req.TopN < topN {
		topN = *req.TopN
	}

	return &rerank.Response{Sorted: sortedSlices[:topN]}, nil
}

// func (r *rrfReranker) Rerank(ctx context.Context, req *rerank.Request) (*rerank.Response, error) {
// 	if req == nil || req.Data == nil || len(req.Data) == 0 {
// 		return nil, fmt.Errorf("invalid request: no data provided")
// 	}

// 	var scoredDataList []*knowledge.RetrieveSlice
// 	for _, ranking := range req.Data {
// 		for rank := range ranking {
// 			data := ranking[rank]
// 			score := 1 / float64(r.k+int64(rank))
// 			scoredDataList = append(scoredDataList, &rerank.ScoredData{
// 				Data:  data,
// 				Score: score,
// 			})
// 		}
// 	}

// 	sort.Slice(scoredDataList, func(i, j int) bool {
// 		return scoredDataList[i].Score > scoredDataList[j].Score
// 	})

// 	topN := int64(len(scoredDataList))
// 	if req.TopN != nil && *req.TopN < topN {
// 		topN = *req.TopN
// 	}

// 	return &rerank.Response{Sorted: scoredDataList[:topN]}, nil
// }
