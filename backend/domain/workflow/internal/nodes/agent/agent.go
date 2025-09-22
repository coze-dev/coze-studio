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

package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/cloudwego/eino/schema"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/agent/platforms"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

var getExeCtx = execute.GetExeCtx

type Agent struct {
	baseConfig *Config
}

func (a *Agent) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	logs.CtxInfof(ctx, "[agent.invoke] raw input=%+v", input)
	cfg := a.mergeConfig(ctx, input)
	logs.CtxInfof(ctx, "[agent.invoke] merged inputs=%+v", cfg.Inputs)
	if cfg.AgentURL == "" {
		return nil, fmt.Errorf("agent_url is required")
	}
	if cfg.Query == "" {
		return nil, fmt.Errorf("query is required")
	}

	adapter, err := a.makeAdapter(cfg.Platform, cfg.TimeoutMS, cfg.RetryCount)
	if err != nil {
		return nil, err
	}

	platformCfg := cfg.toPlatformConfig()
	if err := adapter.ValidateConfig(platformCfg); err != nil {
		return nil, err
	}

	resp, err := adapter.Call(ctx, platformCfg)
	if err != nil {
		return nil, err
	}

	output := map[string]any{
		"answer":   resp.Answer,
		"platform": cfg.Platform,
	}
	if len(resp.Metadata) > 0 {
		output["metadata"] = resp.Metadata
	}
	if resp.Error != "" {
		output["error"] = resp.Error
	}
	return output, nil
}

func (a *Agent) ToCallbackOutput(ctx context.Context, out map[string]any) (*nodes.StructuredCallbackOutput, error) {
	return &nodes.StructuredCallbackOutput{
		Output:    out,
		RawOutput: out,
		Extra:     nil,
		Error:     nil,
	}, nil
}

func (a *Agent) mergeConfig(ctx context.Context, input map[string]any) *Config {
	cfg := a.baseConfig.clone()
	if cfg.Platform == "" {
		cfg.Platform = "hiagent"
	}

	if v, ok := readString(input, "platform"); ok {
		cfg.Platform = strings.ToLower(v)
	}
	if v, ok := readString(input, "agent_url"); ok {
		cfg.AgentURL = v
	}
	if v, ok := readString(input, "agent_key"); ok {
		cfg.AgentKey = v
	}
	if v, ok := readString(input, "query"); ok {
		cfg.Query = v
	}
	if inputs, ok := input["inputs"].(map[string]any); ok {
		if cfg.Inputs == nil {
			cfg.Inputs = make(map[string]string, len(inputs))
		}
		for k, v := range inputs {
			cfg.Inputs[k] = fmt.Sprint(v)
		}
	}
	if v, ok := readNumeric(input, "timeout"); ok && v > 0 {
		cfg.TimeoutMS = v
	}
	if v, ok := readNumeric(input, "retry_count"); ok && v >= 0 {
		cfg.RetryCount = v
	}

	if rawInputs, ok := input["inputs"]; ok {
		mergeInputs(cfg, rawInputs)
	}

	if cfg.Query == "" {
		if q, ok := cfg.Inputs["query"]; ok {
			if trimmed := strings.TrimSpace(q); trimmed != "" {
				cfg.Query = trimmed
			}
		}
	}

	if cfg.Query == "" {
		if _, ok := cfg.AssociateStartNodeUserInputFields["query"]; ok {
			if exeCtx := getExeCtx(ctx); exeCtx != nil && exeCtx.ExeCfg.UserMessage != nil {
				if text := extractUserMessageText(exeCtx.ExeCfg.UserMessage); text != "" {
					cfg.Query = text
					if _, exists := cfg.Inputs["query"]; !exists || strings.TrimSpace(cfg.Inputs["query"]) == "" {
						if cfg.Inputs == nil {
							cfg.Inputs = make(map[string]string)
						}
						cfg.Inputs["query"] = text
					}
				}
			}
		}
	}

	if len(input) > 0 {
		for k, v := range input {
			if isReservedAgentInputKey(k) {
				continue
			}
			if cfg.Inputs == nil {
				cfg.Inputs = make(map[string]string)
			}
			cfg.Inputs[k] = stringifyInputValue(v)
		}
	}
	if cfg.TimeoutMS <= 0 {
		cfg.TimeoutMS = defaultTimeoutMS
	}
	if cfg.RetryCount < 0 {
		cfg.RetryCount = defaultRetry
	}
	return cfg
}

func (a *Agent) makeAdapter(platform string, timeoutMS, retry int) (platforms.Adapter, error) {
	httpClient := NewHTTPClient(time.Duration(timeoutMS)*time.Millisecond, retry)

	switch strings.ToLower(platform) {
	case "", "hiagent":
		return platforms.NewHiagentAdapter(httpClient), nil
	case "dify":
		return platforms.NewUnsupportedAdapter("dify"), nil
	case "coze":
		return platforms.NewUnsupportedAdapter("coze"), nil
	default:
		return nil, fmt.Errorf("unsupported agent platform: %s", platform)
	}
}

func readString(input map[string]any, key string) (string, bool) {
	if input == nil {
		return "", false
	}
	if v, ok := input[key]; ok {
		switch val := v.(type) {
		case string:
			if val == "" {
				return "", false
			}
			return val, true
		case fmt.Stringer:
			str := val.String()
			if str == "" {
				return "", false
			}
			return str, true
		}
	}
	return "", false
}

func readNumeric(input map[string]any, key string) (int, bool) {
	if input == nil {
		return 0, false
	}
	v, ok := input[key]
	if !ok {
		return 0, false
	}
	switch val := v.(type) {
	case int:
		return val, true
	case int32:
		return int(val), true
	case int64:
		return int(val), true
	case float32:
		return int(val), true
	case float64:
		return int(val), true
	case json.Number:
		if i64, err := val.Int64(); err == nil {
			return int(i64), true
		}
		if f64, err := val.Float64(); err == nil {
			return int(f64), true
		}
		return 0, false
	case string:
		if val == "" {
			return 0, false
		}
		var parsed int
		_, err := fmt.Sscanf(val, "%d", &parsed)
		if err != nil {
			return 0, false
		}
		return parsed, true
	default:
		return 0, false
	}
}

func mergeInputs(cfg *Config, raw any) {
	logs.Infof("[agent.mergeInputs] raw=%+v", raw)
	var source map[string]any
	switch val := raw.(type) {
	case map[string]any:
		source = val
	case string:
		if strings.TrimSpace(val) == "" {
			return
		}
		if err := json.Unmarshal([]byte(val), &source); err != nil {
			return
		}
	case json.RawMessage:
		if len(val) == 0 {
			return
		}
		if err := json.Unmarshal(val, &source); err != nil {
			return
		}
	default:
		return
	}

	if len(source) == 0 {
		return
	}
	if cfg.Inputs == nil {
		cfg.Inputs = make(map[string]string, len(source))
	}
	logs.CtxInfof(context.Background(), "[agent.mergeInputs] raw source=%+v", source)
	for k, v := range source {
		if strings.EqualFold(k, "dynamicInputs") || strings.EqualFold(k, "dynamic_inputs") {
			mergeDynamicInputs(cfg.Inputs, v)
			continue
		}
		cfg.Inputs[k] = stringifyInputValue(v)
	}
}

func mergeDynamicInputs(dst map[string]string, raw any) {
	if dst == nil {
		return
	}
	switch val := raw.(type) {
	case map[string]any:
		if name, ok := extractDynamicInputName(val); ok {
			if content, ok := extractDynamicInputValue(val); ok {
				dst[name] = content
			}
			return
		}
		for k, v := range val {
			key := strings.TrimSpace(k)
			if key == "" {
				continue
			}
			if content, ok := extractDynamicInputValue(v); ok {
				dst[key] = content
				continue
			}
			mergeDynamicInputs(dst, v)
		}
	case []any:
		for _, item := range val {
			mergeDynamicInputs(dst, item)
		}
	}
}

func extractDynamicInputName(v map[string]any) (string, bool) {
	if rawName, ok := v["name"]; ok {
		name := strings.TrimSpace(fmt.Sprint(rawName))
		if name != "" {
			return name, true
		}
	}
	return "", false
}

func extractDynamicInputValue(v any) (string, bool) {
	if text, ok := extractStringFromComposite(v); ok {
		return text, true
	}
	if m, ok := v.(map[string]any); ok {
		keys := []string{"value", "resolved", "content", "default", "input"}
		for _, key := range keys {
			inner, exists := m[key]
			if !exists {
				continue
			}
			if text, ok := extractStringFromComposite(inner); ok {
				return text, true
			}
		}
	}
	return "", false
}

func isReservedAgentInputKey(key string) bool {
	switch strings.ToLower(key) {
	case "platform", "agent_url", "agent_key", "query", "timeout", "retry_count", "inputs", "dynamicinputs", "dynamic_inputs", "inputparameters", "input_parameters":
		return true
	default:
		return false
	}
}

func stringifyInputValue(v any) string {
	switch val := v.(type) {
	case string:
		return val
	case fmt.Stringer:
		return val.String()
	case json.Number:
		return val.String()
	case int:
		return fmt.Sprint(val)
	case int32:
		return fmt.Sprint(val)
	case int64:
		return fmt.Sprint(val)
	case float32:
		return fmt.Sprint(val)
	case float64:
		return fmt.Sprint(val)
	case bool:
		return fmt.Sprint(val)
	case map[string]any, []any:
		if extracted, ok := extractStringFromComposite(val); ok {
			return extracted
		}
		if data, err := json.Marshal(val); err == nil {
			return string(data)
		}
		return fmt.Sprint(val)
	case nil:
		return ""
	default:
		return fmt.Sprint(val)
	}
}

func extractStringFromComposite(v any) (string, bool) {
	switch val := v.(type) {
	case string:
		trimmed := strings.TrimSpace(val)
		if trimmed == "" {
			return "", false
		}
		return trimmed, true
	case map[string]any:
		keys := []string{"content", "resolved", "value", "raw", "default"}
		for _, key := range keys {
			inner, ok := val[key]
			if !ok {
				continue
			}
			if text, ok := extractStringFromComposite(inner); ok {
				return text, true
			}
		}
		return "", false
	case []any:
		for _, item := range val {
			if text, ok := extractStringFromComposite(item); ok {
				return text, true
			}
		}
		return "", false
	default:
		return "", false
	}
}

func extractUserMessageText(msg *schema.Message) string {
	if msg == nil {
		return ""
	}
	if content := strings.TrimSpace(msg.Content); content != "" {
		return content
	}
	if len(msg.MultiContent) == 0 {
		return ""
	}
	var builder strings.Builder
	for _, part := range msg.MultiContent {
		if part.Type != schema.ChatMessagePartTypeText {
			continue
		}
		text := strings.TrimSpace(part.Text)
		if text == "" {
			continue
		}
		if builder.Len() > 0 {
			builder.WriteString("\n")
		}
		builder.WriteString(text)
	}
	return strings.TrimSpace(builder.String())
}

func (c *Config) toPlatformConfig() *platforms.Config {
	inputs := make(map[string]string, len(c.Inputs))
	for k, v := range c.Inputs {
		inputs[k] = v
	}
	return &platforms.Config{
		Platform: c.Platform,
		AgentURL: c.AgentURL,
		AgentKey: c.AgentKey,
		Query:    c.Query,
		Inputs:   inputs,
	}
}

var _ nodes.InvokableNode = (*Agent)(nil)
var _ nodes.CallbackOutputConverted = (*Agent)(nil)
