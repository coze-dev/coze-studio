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

package http

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	opt "github.com/cloudwego/eino/components/embedding"

	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"

	"github.com/coze-dev/coze-studio/backend/infra/contract/embedding"
)

const pathEmbed = "/embedding"

type embedReq struct {
	Texts      []string `json:"texts"`
	NeedSparse bool     `json:"need_sparse"`
}

type embedResp struct {
	Dense  [][]float64       `json:"dense"`
	Sparse []map[int]float64 `json:"sparse"`
}

func NewEmbedding(addr string, dims int64, batchSize int) (embedding.Embedder, error) {
	cli := &http.Client{Timeout: time.Second * 30}
	return &embedder{
		cli:       cli,
		addr:      addr,
		dim:       dims,
		batchSize: batchSize,
	}, nil
}

type embedder struct {
	cli       *http.Client
	addr      string
	dim       int64
	batchSize int
}

func (e *embedder) EmbedStrings(ctx context.Context, texts []string, opts ...opt.Option) ([][]float64, error) {
	dense := make([][]float64, 0, len(texts))
	for _, part := range slices.Chunks(texts, e.batchSize) {
		rb, err := json.Marshal(&embedReq{
			Texts:      part,
			NeedSparse: false,
		})
		if err != nil {
			return nil, err
		}
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, e.addr+pathEmbed, bytes.NewReader(rb))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json; charset=utf-8")
		resp, err := e.do(req)
		if err != nil {
			return nil, err
		}
		dense = append(dense, resp.Dense...)
	}
	return dense, nil
}

func (e *embedder) EmbedStringsHybrid(ctx context.Context, texts []string, opts ...opt.Option) ([][]float64, []map[int]float64, error) {
	dense := make([][]float64, 0, len(texts))
	sparse := make([]map[int]float64, 0, len(texts))
	for _, part := range slices.Chunks(texts, e.batchSize) {
		rb, err := json.Marshal(&embedReq{
			Texts:      part,
			NeedSparse: true,
		})
		if err != nil {
			return nil, nil, err
		}
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, e.addr+pathEmbed, bytes.NewReader(rb))
		if err != nil {
			return nil, nil, err
		}
		req.Header.Set("Content-Type", "application/json; charset=utf-8")
		resp, err := e.do(req)
		if err != nil {
			return nil, nil, err
		}
		dense = append(dense, resp.Dense...)
		sparse = append(sparse, resp.Sparse...)
	}
	return dense, sparse, nil
}

func (e *embedder) do(req *http.Request) (*embedResp, error) {
	resp, err := e.cli.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	r := &embedResp{}
	if err = json.Unmarshal(b, r); err != nil {
		return nil, err
	}
	return r, nil
}

func (e *embedder) Dimensions() int64 {
	return e.dim
}

func (e *embedder) SupportStatus() embedding.SupportStatus {
	return embedding.SupportDenseAndSparse
}
