package platforms

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
)

type fakeHTTPClient struct {
	t     *testing.T
	calls []fakeCall
	idx   int
}

type fakeCall struct {
	expectedURL string
	handler     func(url string, headers map[string]string, body any)
	resp        []byte
	err         error
}

func (f *fakeHTTPClient) PostJSON(ctx context.Context, url string, headers map[string]string, body any) ([]byte, error) {
	if f.idx >= len(f.calls) {
		f.t.Fatalf("unexpected HTTP call %d to %s", f.idx+1, url)
	}
	call := f.calls[f.idx]
	if call.expectedURL != "" {
		require.Equal(f.t, call.expectedURL, url)
	}
	if call.handler != nil {
		call.handler(url, headers, body)
	}
	f.idx++
	if call.err != nil {
		return nil, call.err
	}
	return call.resp, nil
}

func (f *fakeHTTPClient) AssertDone() {
	require.Equal(f.t, len(f.calls), f.idx)
}

func TestHiagentAdapter_CallSuccess(t *testing.T) {
	client := &fakeHTTPClient{t: t}
	client.calls = []fakeCall{
		{
			expectedURL: "https://hiagent.example.com/api/proxy/api/v1/create_conversation",
			handler: func(_ string, headers map[string]string, body any) {
				require.Equal(t, "secret", headers["Apikey"])
				req, ok := body.(*hiagentCreateConversationRequest)
				require.True(t, ok)
				require.Equal(t, "alice", req.UserID)
				require.Equal(t, map[string]string{"topic": "export"}, req.Inputs)
			},
			resp: []byte(`{"Conversation":{"AppConversationID":"conv-app","ConversationID":"conv-id"},"code":0}`),
		},
		{
			expectedURL: "https://hiagent.example.com/api/proxy/api/v1/chat_query_v2",
			handler: func(_ string, _ map[string]string, body any) {
				req, ok := body.(*hiagentChatRequest)
				require.True(t, ok)
				require.Equal(t, "hello", req.Query)
				require.Equal(t, "conv-app", req.AppConversationID)
				require.Equal(t, "blocking", req.ResponseMode)
				require.Equal(t, "alice", req.UserID)
			},
			resp: []byte(`{"answer":"Hi!","tool_messages":["tool1"],"total_tokens":128,"task_id":"task-001","conversation_id":"conv-id"}`),
		},
	}

	adapter := NewHiagentAdapter(client)
	resp, err := adapter.Call(context.Background(), &Config{
		Platform: "hiagent",
		AgentURL: "https://hiagent.example.com/api/proxy/api/v1/chat_query_v2",
		AgentKey: "secret",
		Query:    "hello",
		Inputs: map[string]string{
			"UserID": "alice",
			"topic":  "export",
		},
	})

	require.NoError(t, err)
	require.NotNil(t, resp)
	require.Equal(t, "Hi!", resp.Answer)
	require.Equal(t, "hiagent", resp.Platform)
	require.NotNil(t, resp.Metadata)
	require.Equal(t, "conv-app", resp.Metadata["app_conversation_id"])
	require.Equal(t, "conv-id", resp.Metadata["conversation_id"])
	require.Equal(t, []string{"tool1"}, resp.Metadata["tool_messages"])
	require.Equal(t, 128, resp.Metadata["total_tokens"])
	require.Equal(t, "task-001", resp.Metadata["task_id"])
	require.Empty(t, resp.Error)

	client.AssertDone()
}

func TestHiagentAdapter_SkipConversationWhenConversationIDProvided(t *testing.T) {
	client := &fakeHTTPClient{t: t}
	client.calls = []fakeCall{
		{
			expectedURL: "https://hiagent.example.com/api/proxy/api/v1/chat_query_v2",
			handler: func(_ string, _ map[string]string, body any) {
				req, ok := body.(*hiagentChatRequest)
				require.True(t, ok)
				require.Equal(t, "reuse", req.AppConversationID)
				require.Equal(t, "alice", req.UserID)
			},
			resp: []byte(`{"answer":"Reuse","conversation_id":"reuse-conv"}`),
		},
	}

	adapter := NewHiagentAdapter(client)
	resp, err := adapter.Call(context.Background(), &Config{
		Platform: "hiagent",
		AgentURL: "https://hiagent.example.com/api/proxy/api/v1/chat_query_v2",
		Query:    "hello",
		Inputs: map[string]string{
			"UserID":            "alice",
			"AppConversationID": "reuse",
		},
	})

	require.NoError(t, err)
	require.Equal(t, "Reuse", resp.Answer)
	require.Equal(t, "reuse", resp.Metadata["app_conversation_id"])
	require.Equal(t, "reuse-conv", resp.Metadata["conversation_id"])
	client.AssertDone()
}

func TestHiagentAdapter_DefaultUserIDWhenMissing(t *testing.T) {
	client := &fakeHTTPClient{t: t}
	client.calls = []fakeCall{
		{
			expectedURL: "https://hiagent.example.com/api/proxy/api/v1/create_conversation",
			handler: func(_ string, _ map[string]string, body any) {
				req, ok := body.(*hiagentCreateConversationRequest)
				require.True(t, ok)
				require.Equal(t, "dev", req.UserID)
			},
			resp: []byte(`{"Conversation":{"AppConversationID":"conv-app"}}`),
		},
		{
			expectedURL: "https://hiagent.example.com/api/proxy/api/v1/chat_query_v2",
			handler: func(_ string, _ map[string]string, body any) {
				req, ok := body.(*hiagentChatRequest)
				require.True(t, ok)
				require.Equal(t, "dev", req.UserID)
			},
			resp: []byte(`{"answer":"Hi"}`),
		},
	}

	adapter := NewHiagentAdapter(client)
	resp, err := adapter.Call(context.Background(), &Config{
		Platform: "hiagent",
		AgentURL: "https://hiagent.example.com/api/proxy/api/v1/chat_query_v2",
		Query:    "hello",
	})

	require.NoError(t, err)
	require.Equal(t, "Hi", resp.Answer)
	client.AssertDone()
}

func TestHiagentAdapter_ConversationError(t *testing.T) {
	client := &fakeHTTPClient{t: t}
	client.calls = []fakeCall{
		{
			expectedURL: "https://hiagent.example.com/api/proxy/api/v1/create_conversation",
			resp:        []byte(`{"code":403,"msg":"invalid key"}`),
		},
	}

	adapter := NewHiagentAdapter(client)
	_, err := adapter.Call(context.Background(), &Config{
		Platform: "hiagent",
		AgentURL: "https://hiagent.example.com/api/proxy/api/v1/chat_query_v2",
		AgentKey: "bad",
		Query:    "hello",
		Inputs: map[string]string{
			"UserID": "alice",
		},
	})

	require.Error(t, err)
	client.AssertDone()
}

func TestHiagentAdapter_ChatError(t *testing.T) {
	client := &fakeHTTPClient{t: t}
	client.calls = []fakeCall{
		{
			expectedURL: "https://hiagent.example.com/api/proxy/api/v1/create_conversation",
			resp:        []byte(`{"Conversation":{"AppConversationID":"conv-app"}}`),
		},
		{
			expectedURL: "https://hiagent.example.com/api/proxy/api/v1/chat_query_v2",
			resp:        []byte(`{"code":500,"msg":"failed","answer":""}`),
		},
	}

	adapter := NewHiagentAdapter(client)
	resp, err := adapter.Call(context.Background(), &Config{
		Platform: "hiagent",
		AgentURL: "https://hiagent.example.com/api/proxy/api/v1/chat_query_v2",
		Query:    "hello",
		Inputs: map[string]string{
			"UserID": "alice",
		},
	})

	require.NoError(t, err)
	require.NotNil(t, resp)
	require.Equal(t, "failed", resp.Error)
	require.Equal(t, 500, resp.Metadata["code"])
	client.AssertDone()
}
