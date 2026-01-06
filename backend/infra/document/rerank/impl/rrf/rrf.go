/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package rrf

import (
	"context"
	"fmt"
	"sort"

	"github.com/coze-dev/coze-studio/backend/infra/document/rerank"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
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
	if req.TopN != nil && ptr.From(req.TopN) != 0 && ptr.From(req.TopN) < topN {
		topN = ptr.From(req.TopN)
	}

	return &rerank.Response{SortedData: sorted[:topN]}, nil
}
