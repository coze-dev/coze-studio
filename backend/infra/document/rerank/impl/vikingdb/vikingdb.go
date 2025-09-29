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

package vikingdb

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"

	"github.com/volcengine/volc-sdk-golang/base"

	"github.com/coze-dev/coze-studio/backend/infra/document/rerank"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type Config struct {
	AK     string
	SK     string
	Domain string
	Model  string
	Region string // default cn-north-1
}

func NewReranker(config *Config) rerank.Reranker {
	if config.Region == "" {
		config.Region = "cn-north-1"
	}
	if config.Domain == "" {
		config.Domain = domain
	}
	if config.Model == "" {
		config.Model = defaultModel
	}
	return &reranker{config: config}
}

const (
	domain       = "api-knowledgebase.mlp.cn-beijing.volces.com"
	defaultModel = "base-multilingual-rerank"
)

type reranker struct {
	config *Config
}

type rerankReq struct {
	Datas       []rerankData `json:"datas"`
	RerankModel string       `json:"rerank_model"`
}

type rerankData struct {
	Query   string  `json:"query"`
	Content string  `json:"content"`
	Title   *string `json:"title,omitempty"`
}

type rerankResp struct {
	Code    int64  `json:"code"`
	Message string `json:"message"`
	Data    struct {
		Scores     []float64 `json:"scores"`
		TokenUsage int64     `json:"token_usage"`
	} `json:"data"`
}

func (r *reranker) Rerank(ctx context.Context, req *rerank.Request) (*rerank.Response, error) {
	rReq := &rerankReq{
		Datas:       make([]rerankData, 0, len(req.Data)),
		RerankModel: r.config.Model,
	}
	sorted := make([]*rerank.Data, 0)
	var flat []*rerank.Data
	visited := map[string]bool{}
	for _, channel := range req.Data {
		if len(channel) == 0 {
			continue
		}
		for _, item := range channel {
			if item == nil || item.Document == nil {
				continue
			}
			if item.Document.ID == "" {
				sorted = append(sorted, &rerank.Data{
					Document: item.Document,
					Score:    1,
				})
				continue
			}
			if visited[item.Document.ID] {
				continue
			}
			visited[item.Document.ID] = true
			flat = append(flat, item)
		}
	}

	for _, item := range flat {
		rReq.Datas = append(rReq.Datas, rerankData{
			Query:   req.Query,
			Content: item.Document.Content,
		})
	}

	body, err := json.Marshal(rReq)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(r.prepareRequest(body))
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	rResp := rerankResp{}
	if err = json.Unmarshal(respBody, &rResp); err != nil {
		return nil, err
	}
	if rResp.Code != 0 {
		return nil, fmt.Errorf("[Rerank] failed, code=%d, msg=%v", rResp.Code, rResp.Message)
	}

	for i, score := range rResp.Data.Scores {
		sorted = append(sorted, &rerank.Data{
			Document: flat[i].Document,
			Score:    score,
		})
	}

	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Score > sorted[j].Score
	})

	right := len(sorted)
	if req.TopN != nil {
		right = min(right, int(*req.TopN))
	}

	return &rerank.Response{
		SortedData: sorted[:right],
		TokenUsage: ptr.Of(rResp.Data.TokenUsage),
	}, nil
}

func (r *reranker) prepareRequest(body []byte) *http.Request {
	u := url.URL{
		Scheme: "https",
		Host:   r.config.Domain,
		Path:   "/api/knowledge/service/rerank",
	}
	req, _ := http.NewRequest(http.MethodPost, u.String(), bytes.NewReader(body))
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Host", domain)
	credential := base.Credentials{
		AccessKeyID:     r.config.AK,
		SecretAccessKey: r.config.SK,
		Service:         "air",
		Region:          r.config.Region,
	}
	req = credential.Sign(req)
	return req
}
