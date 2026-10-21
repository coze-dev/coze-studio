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
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type miniMaxReasoningKey struct{}

// miniMaxTransport restores reasoning omitted by the pinned SDK's message encoder.
// History is request-scoped so concurrent Generate and Stream calls cannot mix it.
type miniMaxTransport struct {
	base http.RoundTripper
}

func (t miniMaxTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	history, _ := req.Context().Value(miniMaxReasoningKey{}).([]string)
	if len(history) == 0 {
		return t.base.RoundTrip(req)
	}
	body, err := io.ReadAll(req.Body)
	if err != nil {
		_ = req.Body.Close()
		return nil, err
	}
	_ = req.Body.Close()
	body, err = restoreMiniMaxReasoning(body, history)
	if err != nil {
		return nil, err
	}
	cloned := req.Clone(req.Context())
	cloned.Body = io.NopCloser(bytes.NewReader(body))
	cloned.ContentLength = int64(len(body))
	cloned.GetBody = func() (io.ReadCloser, error) {
		return io.NopCloser(bytes.NewReader(body)), nil
	}
	return t.base.RoundTrip(cloned)
}

func restoreMiniMaxReasoning(body []byte, history []string) ([]byte, error) {
	var request map[string]json.RawMessage
	if err := json.Unmarshal(body, &request); err != nil {
		return nil, fmt.Errorf("decode MiniMax request: %w", err)
	}
	var messages []map[string]json.RawMessage
	if err := json.Unmarshal(request["messages"], &messages); err != nil {
		return nil, fmt.Errorf("decode MiniMax messages: %w", err)
	}
	if len(messages) != len(history) {
		return nil, fmt.Errorf("MiniMax reasoning history does not match request messages")
	}
	for i, reasoning := range history {
		if reasoning != "" {
			var role string
			if err := json.Unmarshal(messages[i]["role"], &role); err != nil || role != "assistant" {
				return nil, fmt.Errorf("MiniMax reasoning history requires an assistant message at index %d", i)
			}
			messages[i]["reasoning_content"], _ = json.Marshal(reasoning)
		}
	}
	request["messages"], _ = json.Marshal(messages)
	return json.Marshal(request)
}
