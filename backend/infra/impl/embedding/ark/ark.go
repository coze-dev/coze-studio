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

package ark

import (
	"context"
	"errors"
	"fmt"
	"math"
	"net/http"

	"github.com/cloudwego/eino-ext/components/embedding/ark"
	"github.com/cloudwego/eino/components/embedding"
	"github.com/volcengine/volcengine-go-sdk/service/arkruntime/model"

	contract "github.com/coze-dev/coze-studio/backend/infra/contract/embedding"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func NewArkEmbedder(ctx context.Context, config *ark.EmbeddingConfig, dimensions int64, batchSize int) (contract.Embedder, error) {
	emb, err := ark.NewEmbedder(ctx, config)
	if err != nil {
		return nil, err
	}

	return &embWrap{dims: dimensions, batchSize: batchSize, Embedder: emb}, nil
}

type embWrap struct {
	dims      int64
	batchSize int
	embedding.Embedder
}

func (d embWrap) EmbedStrings(ctx context.Context, texts []string, opts ...embedding.Option) ([][]float64, error) {
	resp := make([][]float64, 0, len(texts))
	for _, part := range slices.Chunks(texts, d.batchSize) {
		partResult, err := d.Embedder.EmbedStrings(ctx, part, opts...)
		if err != nil {
			return nil, err
		}
		normed, err := d.slicedNormL2(partResult)
		if err != nil {
			var (
				apiErr = &model.APIError{}
				reqErr = &model.RequestError{}
			)
			if errors.As(err, &apiErr) {
				if apiErr.HTTPStatusCode >= http.StatusInternalServerError ||
					apiErr.HTTPStatusCode == http.StatusTooManyRequests {
					return nil, err
				}
			} else if errors.As(err, &reqErr) {
				if reqErr.HTTPStatusCode >= http.StatusInternalServerError {
					return nil, err
				}
			}
			return nil, errorx.WrapByCode(err, errno.ErrKnowledgeNonRetryableCode)
		}
		resp = append(resp, normed...)
	}
	return resp, nil
}

func (d embWrap) EmbedStringsHybrid(ctx context.Context, texts []string, opts ...embedding.Option) ([][]float64, []map[int]float64, error) {
	return nil, nil, fmt.Errorf("[arkEmbedder] EmbedStringsHybrid not support")
}

func (d embWrap) Dimensions() int64 {
	return d.dims
}

func (d embWrap) SupportStatus() contract.SupportStatus {
	return contract.SupportDense
}

func (d embWrap) slicedNormL2(vectors [][]float64) ([][]float64, error) {
	if len(vectors) == 0 {
		return vectors, nil
	}
	if curDims := len(vectors[0]); curDims < int(d.dims) {
		return nil, fmt.Errorf("[slicedNormL2] got dims=%d less than %d", curDims, d.dims)
	}

	result := make([][]float64, len(vectors))
	for i, vec := range vectors {
		sliced := vec[:d.dims]
		sumSq := 0.0
		for _, v := range sliced {
			sumSq += v * v
		}
		norm := math.Sqrt(sumSq)
		r := make([]float64, len(sliced))
		for j, v := range sliced {
			r[j] = v / norm
		}
		result[i] = r
	}
	return result, nil
}
