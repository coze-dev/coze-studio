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

package embedding

import (
	"context"

	"github.com/cloudwego/eino/components/embedding"
)

type Embedder interface {
	embedding.Embedder
	EmbedStringsHybrid(ctx context.Context, texts []string, opts ...embedding.Option) ([][]float64, []map[int]float64, error) // hybrid embedding
	Dimensions() int64
	SupportStatus() SupportStatus
}

type SupportStatus int

const (
	SupportDense          SupportStatus = 1
	SupportDenseAndSparse SupportStatus = 3
)
