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

package modelbuilder

import (
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/cloudwego/eino-ext/components/model/openai"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
)

// captureRoundTripper records the request it receives and returns a dummy 200.
type captureRoundTripper struct {
	captured *http.Request
}

func (c *captureRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	c.captured = req
	return &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(strings.NewReader("{}")),
		Header:     make(http.Header),
		Request:    req,
	}, nil
}

func newTestRequest(t *testing.T) *http.Request {
	t.Helper()
	req, err := http.NewRequest(http.MethodPost, "https://api.orcarouter.ai/v1/chat/completions", strings.NewReader(`{}`))
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	return req
}

func TestAttributionRoundTripper_InjectsHeadersWhenAbsent(t *testing.T) {
	cap := &captureRoundTripper{}
	rt := &attributionRoundTripper{next: cap}

	if _, err := rt.RoundTrip(newTestRequest(t)); err != nil {
		t.Fatalf("round trip: %v", err)
	}

	if got := cap.captured.Header.Get("HTTP-Referer"); got != orcaRouterReferer {
		t.Errorf("HTTP-Referer = %q, want %q", got, orcaRouterReferer)
	}
	if got := cap.captured.Header.Get("X-Title"); got != orcaRouterTitle {
		t.Errorf("X-Title = %q, want %q", got, orcaRouterTitle)
	}
}

func TestAttributionRoundTripper_DoesNotOverrideExisting(t *testing.T) {
	cap := &captureRoundTripper{}
	rt := &attributionRoundTripper{next: cap}

	req := newTestRequest(t)
	req.Header.Set("HTTP-Referer", "https://custom.example/")
	req.Header.Set("X-Title", "Custom Client")

	if _, err := rt.RoundTrip(req); err != nil {
		t.Fatalf("round trip: %v", err)
	}

	if got := cap.captured.Header.Get("HTTP-Referer"); got != "https://custom.example/" {
		t.Errorf("HTTP-Referer overridden: got %q", got)
	}
	if got := cap.captured.Header.Get("X-Title"); got != "Custom Client" {
		t.Errorf("X-Title overridden: got %q", got)
	}
}

func TestAttributionRoundTripper_DoesNotMutateOriginalRequest(t *testing.T) {
	cap := &captureRoundTripper{}
	rt := &attributionRoundTripper{next: cap}

	req := newTestRequest(t)
	if _, err := rt.RoundTrip(req); err != nil {
		t.Fatalf("round trip: %v", err)
	}

	// The caller's request must be left untouched; headers go on the clone.
	if req.Header.Get("HTTP-Referer") != "" || req.Header.Get("X-Title") != "" {
		t.Errorf("original request was mutated: %v", req.Header)
	}
}

func TestSuppressesSamplingParams(t *testing.T) {
	cases := []struct {
		model string
		want  bool
	}{
		// adaptive router — upstream unknown, must suppress
		{"orcarouter/auto", true},
		{"auto", true},
		// reasoning models that reject temperature
		{"anthropic/claude-opus-4.7", true},
		{"anthropic/claude-opus-4.6", true},
		{"openai/gpt-5", true},
		{"openai/gpt-5.5-pro", true},
		{"deepseek/deepseek-reasoner", true},
		// models that accept sampling params — must NOT suppress
		{"openai/gpt-4o", false},
		{"openai/gpt-4o-mini", false},
		{"anthropic/claude-sonnet-4.6", false},
		{"google/gemini-3-flash-preview", false},
		{"", false},
	}
	for _, c := range cases {
		if got := suppressesSamplingParams(c.model); got != c.want {
			t.Errorf("suppressesSamplingParams(%q) = %v, want %v", c.model, got, c.want)
		}
	}
}

func TestApplyNonSamplingParams_OmitsTemperature(t *testing.T) {
	conf := &openai.ChatModelConfig{}
	temp := float32(0.7)
	topP := float32(0.9)
	applyNonSamplingParams(conf, &LLMParams{
		Temperature:      &temp,
		TopP:             &topP,
		FrequencyPenalty: 0.5,
		PresencePenalty:  0.5,
		MaxTokens:        2048,
	})
	if conf.Temperature != nil {
		t.Errorf("temperature should be omitted, got %v", *conf.Temperature)
	}
	if conf.TopP != nil {
		t.Errorf("top_p should be omitted, got %v", *conf.TopP)
	}
	if conf.FrequencyPenalty != nil {
		t.Errorf("frequency_penalty should be omitted, got %v", *conf.FrequencyPenalty)
	}
	if conf.PresencePenalty != nil {
		t.Errorf("presence_penalty should be omitted, got %v", *conf.PresencePenalty)
	}
	// non-sampling params are still applied
	if conf.MaxCompletionTokens == nil || *conf.MaxCompletionTokens != 2048 {
		t.Errorf("max_completion_tokens should be 2048, got %v", conf.MaxCompletionTokens)
	}
}

func TestOrcaRouterBuilder_RegisteredAndWiresBaseConn(t *testing.T) {
	// OrcaRouter must be a supported protocol via the dispatch map.
	if !SupportProtocol(developer_api.ModelClass_OrcaRouter) {
		t.Fatal("ModelClass_OrcaRouter not registered in modelClass2NewModelBuilder")
	}

	cfg := &config.Model{
		Connection: &config.Connection{
			BaseConnInfo: &config.BaseConnectionInfo{
				BaseURL: "https://api.orcarouter.ai/v1",
				APIKey:  "sk-orca-test",
				Model:   "orcarouter/auto",
			},
		},
	}

	svc, err := NewModelBuilder(developer_api.ModelClass_OrcaRouter, cfg)
	if err != nil {
		t.Fatalf("NewModelBuilder: %v", err)
	}
	if _, ok := svc.(*orcaRouterModelBuilder); !ok {
		t.Fatalf("expected *orcaRouterModelBuilder, got %T", svc)
	}
}
