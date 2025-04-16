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

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rerank"
)

type Config struct {
	AK string
	SK string

	Region string // default cn-north-1
}

func NewReranker(config *Config) rerank.Reranker {
	if config.Region == "" {
		config.Region = "cn-north-1"
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
		RerankModel: defaultModel,
	}

	var flat []*knowledge.RetrieveSlice
	for _, channel := range req.Data {
		flat = append(flat, channel...)
	}

	for _, item := range flat {
		rReq.Datas = append(rReq.Datas, rerankData{
			Query:   req.Query,
			Content: item.Slice.PlainText,
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

	result := &rerank.Response{}
	if rResp.Data.TokenUsage != 0 {
		result.TokenUsage = &rResp.Data.TokenUsage
	}

	sorted := make([]*knowledge.RetrieveSlice, 0, len(rResp.Data.Scores))
	for i, score := range rResp.Data.Scores {
		sorted = append(sorted, &knowledge.RetrieveSlice{
			Slice: flat[i].Slice,
			Score: score,
		})
	}

	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Score > sorted[j].Score
	})

	right := len(sorted)
	if req.TopN != nil {
		right = min(right, int(*req.TopN))
	}

	result.Sorted = sorted[:right]
	return result, nil
}

func (r *reranker) prepareRequest(body []byte) *http.Request {
	u := url.URL{
		Scheme: "https",
		Host:   domain,
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
