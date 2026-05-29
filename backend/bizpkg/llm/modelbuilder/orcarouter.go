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
	"context"
	"net/http"
	"strings"

	"github.com/cloudwego/eino-ext/components/model/openai"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

// OrcaRouter is an OpenAI-compatible meta-router. It speaks the OpenAI wire
// protocol, so the request/response handling is identical to the OpenAI
// builder; the only OrcaRouter-specific behavior is the attribution headers
// added to every request, which let the OrcaRouter backend attribute traffic
// to Coze Studio. These headers are optional for OpenAI-compatible gateways
// and are ignored by upstreams that do not understand them.
const (
	orcaRouterReferer = "https://github.com/coze-dev/coze-studio"
	orcaRouterTitle   = "Coze Studio"
	// orcaRouterDefaultBaseURL is the canonical OrcaRouter API base; used when
	// the connection config does not supply one, so that the orcarouter
	// protocol cannot accidentally fall back to the upstream openai default.
	orcaRouterDefaultBaseURL = "https://api.orcarouter.ai/v1"
)

type orcaRouterModelBuilder struct {
	cfg *config.Model
}

func newOrcaRouterModelBuilder(cfg *config.Model) Service {
	return &orcaRouterModelBuilder{
		cfg: cfg,
	}
}

// attributionRoundTripper adds OrcaRouter attribution headers to every request
// without overriding any header that the inner transport already set.
type attributionRoundTripper struct {
	next http.RoundTripper
}

func (t *attributionRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	// Clone to avoid mutating the caller's request (http.RoundTripper contract).
	r := req.Clone(req.Context())
	if r.Header.Get("HTTP-Referer") == "" {
		r.Header.Set("HTTP-Referer", orcaRouterReferer)
	}
	if r.Header.Get("X-Title") == "" {
		r.Header.Set("X-Title", orcaRouterTitle)
	}
	return t.next.RoundTrip(r)
}

// suppressesSamplingParams reports whether sampling parameters (temperature,
// top_p, presence/frequency penalty) must be withheld for the given model.
//
// Two cases require this:
//   - The adaptive router "orcarouter/auto": the upstream model is chosen per
//     request and is unknowable client-side, so any sampling param risks being
//     rejected by whatever model the router lands on (reasoning models reject
//     temperature/top_k, grok rejects penalties, etc.).
//   - A model that is itself a reasoning model: these reject temperature
//     outright (HTTP 400 "temperature is deprecated for this model").
//
// This is a client-side guard. The general, durable fix belongs in the
// OrcaRouter backend (normalize/strip params per chosen upstream, like
// OpenRouter does); once that ships, this guard can be removed. The reasoning
// patterns mirror the override list maintained in the OrcaRouter integration
// notes (§16) and are matched loosely so dated/sub-variants are covered.
func suppressesSamplingParams(model string) bool {
	m := strings.ToLower(strings.TrimSpace(model))
	switch {
	case m == "auto" || strings.HasSuffix(m, "/auto"):
		return true // adaptive router — upstream unknown at request time
	case strings.Contains(m, "claude-opus-4"): // Anthropic reasoning flagships (4.x)
		return true
	case strings.Contains(m, "gpt-5"): // OpenAI gpt-5 family (incl. mini/nano/pro)
		return true
	case strings.Contains(m, "deepseek-reasoner") || strings.Contains(m, "deepseek-r1"):
		return true
	default:
		return false
	}
}

// applyNonSamplingParams sets only the parameters that every upstream accepts
// (max tokens, response format). It deliberately omits temperature / top_p /
// penalties for adaptive or reasoning models — see suppressesSamplingParams.
func applyNonSamplingParams(conf *openai.ChatModelConfig, params *LLMParams) {
	if params == nil {
		return
	}
	if params.MaxTokens != 0 {
		conf.MaxCompletionTokens = ptr.Of(params.MaxTokens)
	}
	if params.ResponseFormat == bot_common.ModelResponseFormat_JSON {
		conf.ResponseFormat = &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeJSONObject,
		}
	} else {
		conf.ResponseFormat = &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeText,
		}
	}
}

func (o *orcaRouterModelBuilder) Build(ctx context.Context, params *LLMParams) (ToolCallingChatModel, error) {
	base := o.cfg.Connection.BaseConnInfo

	// Reuse the OpenAI builder's config construction so request handling stays
	// in lockstep with the openai protocol; we only layer attribution on top.
	ob := &openaiModelBuilder{cfg: o.cfg}
	conf := ob.getDefaultConfig()
	conf.APIKey = base.APIKey
	conf.Model = base.Model

	if base.BaseURL != "" {
		conf.BaseURL = base.BaseURL
	} else {
		conf.BaseURL = orcaRouterDefaultBaseURL
	}

	// Pinned models that accept sampling params get the full openai treatment;
	// the adaptive router and reasoning models get only the safe params.
	if suppressesSamplingParams(base.Model) {
		applyNonSamplingParams(conf, params)
	} else {
		ob.applyParamsToOpenaiConfig(conf, params)
	}

	conf.HTTPClient = &http.Client{
		Transport: &attributionRoundTripper{next: http.DefaultTransport},
	}

	return openai.NewChatModel(ctx, conf)
}
