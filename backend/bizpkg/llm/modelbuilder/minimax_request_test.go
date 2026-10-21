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
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
)

func TestMiniMaxTransportHistory(t *testing.T) {
	for _, stream := range []bool{false, true} {
		t.Run(map[bool]string{false: "generate", true: "stream"}[stream], func(t *testing.T) {
			t.Parallel()
			payload := `{"model":"saved-custom","stream":false,"tools":[{"type":"function","function":{"name":"lookup"}}],"messages":[{"role":"user","content":[{"type":"image_url","image_url":{"url":"data:image/png;base64,AA=="}},{"type":"video_url","video_url":{"url":"mm_file://video"}}]},{"role":"assistant","content":"<think>intact</think>","tool_calls":[{"id":"call_1","type":"function","function":{"name":"lookup","arguments":"{}"}}]},{"role":"tool","tool_call_id":"call_1","content":"result"}]}`
			if stream {
				payload = strings.Replace(payload, `"stream":false`, `"stream":true`, 1)
			}
			var expected map[string]any
			if err := json.Unmarshal([]byte(payload), &expected); err != nil {
				t.Fatal(err)
			}
			expected["messages"].([]any)[1].(map[string]any)["reasoning_content"] = "saved reasoning\nwith unicode: λ"
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
				var got map[string]any
				if err := json.NewDecoder(req.Body).Decode(&got); err != nil {
					t.Error(err)
				}
				if !reflect.DeepEqual(got, expected) {
					t.Errorf("request changed beyond reasoning restoration: %#v", got)
				}
				if stream {
					w.Header().Set("Content-Type", "text/event-stream")
					_, _ = io.WriteString(w, "data: [DONE]\n\n")
				} else {
					_, _ = io.WriteString(w, `{"ok":true}`)
				}
			}))
			defer server.Close()
			ctx := context.WithValue(context.Background(), miniMaxReasoningKey{}, []string{"", "saved reasoning\nwith unicode: λ", ""})
			req, err := http.NewRequestWithContext(ctx, http.MethodPost, server.URL, strings.NewReader(payload))
			if err != nil {
				t.Fatal(err)
			}
			client := &http.Client{Transport: miniMaxTransport{base: http.DefaultTransport}}
			resp, err := client.Do(req)
			if err != nil {
				t.Fatal(err)
			}
			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatal(err)
			}
			want := `{"ok":true}`
			if stream {
				want = "data: [DONE]\n\n"
			}
			if string(body) != want {
				t.Errorf("response changed: %s", body)
			}
		})
	}
}

func TestMiniMaxReasoningRejectsMismatchedHistory(t *testing.T) {
	for _, body := range []string{`invalid`, `{"messages":null}`, `{"messages":[]}`, `{"messages":[null]}`, `{"messages":[{"role":"user"}]}`} {
		if _, err := restoreMiniMaxReasoning([]byte(body), []string{"reasoning"}); err == nil {
			t.Errorf("expected malformed or mismatched messages to fail: %s", body)
		}
	}
}

func TestMiniMaxTransportWithoutReasoning(t *testing.T) {
	const payload = `{"model":"legacy","messages":[]}`
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		body, _ := io.ReadAll(req.Body)
		if string(body) != payload {
			t.Errorf("request without reasoning changed: %s", body)
		}
	}))
	defer server.Close()
	client := &http.Client{Transport: miniMaxTransport{base: http.DefaultTransport}}
	resp, err := client.Post(server.URL, "application/json", strings.NewReader(payload))
	if err != nil {
		t.Fatal(err)
	}
	_ = resp.Body.Close()
}
