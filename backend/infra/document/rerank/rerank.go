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

package rerank

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type Reranker interface {
	Rerank(ctx context.Context, req *Request) (*Response, error)
}

type Request struct {
	Query string
	Data  [][]*Data
	TopN  *int64
}

type Response struct {
	SortedData []*Data // High score
	TokenUsage *int64
}

type Data struct {
	Document *schema.Document
	Score    float64
}
