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

package wrap

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/embedding"

	contract "github.com/coze-dev/coze-studio/backend/infra/contract/embedding"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type denseOnlyWrap struct {
	dims      int64
	batchSize int
	embedding.Embedder
}

func (d denseOnlyWrap) EmbedStrings(ctx context.Context, texts []string, opts ...embedding.Option) ([][]float64, error) {
	resp := make([][]float64, 0, len(texts))
	for _, part := range slices.Chunks(texts, d.batchSize) {
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
