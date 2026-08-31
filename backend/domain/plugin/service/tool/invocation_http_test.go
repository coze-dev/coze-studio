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

package tool

import (
	"context"
	"net"
	"net/http"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/model"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func testHTTPInvocationArgs(serverURL string) *InvocationArgs {
	return &InvocationArgs{
		ServerURL: serverURL,
		Tool: &entity.ToolInfo{
			Method: ptr.Of("GET"),
			SubURL: ptr.Of("/"),
			Operation: &model.Openapi3Operation{
				Operation: &openapi3.Operation{},
			},
		},
	}
}

func TestBuildHTTPRequestRejectsInternalHosts(t *testing.T) {
	h := &httpCallImpl{}
	ctx := context.Background()

	cases := []struct {
		name      string
		serverURL string
	}{
		{name: "ipv4 loopback", serverURL: "http://127.0.0.1"},
		{name: "ipv4 loopback with port", serverURL: "http://127.0.0.1:8080"},
		{name: "ipv6 loopback", serverURL: "http://[::1]"},
		{name: "localhost", serverURL: "http://localhost"},
		{name: "rfc1918 10/8", serverURL: "http://10.0.0.1"},
		{name: "rfc1918 192.168/16", serverURL: "http://192.168.1.1"},
		{name: "rfc1918 172.16/12", serverURL: "http://172.16.0.1"},
		{name: "link-local metadata", serverURL: "http://169.254.169.254"},
		{name: "unspecified ipv4", serverURL: "http://0.0.0.0"},
		{name: "cgnat 100.64/10", serverURL: "http://100.64.0.1"},
		{name: "ipv4-mapped loopback", serverURL: "http://[::ffff:127.0.0.1]"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := h.buildHTTPRequest(ctx, testHTTPInvocationArgs(tc.serverURL))
			assert.Error(t, err, "expected internal host %s to be rejected", tc.serverURL)
		})
	}
}

func TestBuildHTTPRequestRejectsNonHTTPSchemes(t *testing.T) {
	h := &httpCallImpl{}
	ctx := context.Background()

	cases := []string{
		"file://tmp/x",
		"gopher://192.0.2.1",
		"ftp://192.0.2.1",
		"dict://192.0.2.1",
	}

	for _, serverURL := range cases {
		t.Run(serverURL, func(t *testing.T) {
			_, err := h.buildHTTPRequest(ctx, testHTTPInvocationArgs(serverURL))
			assert.Error(t, err, "expected scheme on %s to be rejected", serverURL)
		})
	}
}

func TestBuildHTTPRequestAllowsPublicHTTPHosts(t *testing.T) {
	h := &httpCallImpl{}
	ctx := context.Background()

	cases := []string{
		"http://192.0.2.1",
		"https://192.0.2.1",
		"http://192.0.2.1:443",
	}

	for _, serverURL := range cases {
		t.Run(serverURL, func(t *testing.T) {
			req, err := h.buildHTTPRequest(ctx, testHTTPInvocationArgs(serverURL))
			require.NoError(t, err)
			require.NotNil(t, req)
			assert.Equal(t, "192.0.2.1", req.URL.Hostname())
		})
	}
}

func TestDialToolRequestRejectsInternalAddr(t *testing.T) {
	ctx := context.Background()
	addrs := []string{
		"127.0.0.1:1",
		"[::1]:1",
		"10.0.0.1:80",
		"169.254.169.254:80",
		"192.168.0.1:443",
	}
	for _, addr := range addrs {
		t.Run(addr, func(t *testing.T) {
			conn, err := dialToolRequest(ctx, "tcp", addr)
			if conn != nil {
				_ = conn.Close()
			}
			assert.Error(t, err)
			assert.ErrorIs(t, err, errToolRequestHostNotAllowed)
		})
	}
}

func TestCheckToolRequestRedirectRejectsInternalHost(t *testing.T) {
	via, err := http.NewRequest(http.MethodGet, "http://192.0.2.1/", nil)
	require.NoError(t, err)

	req, err := http.NewRequest(http.MethodGet, "http://127.0.0.1/", nil)
	require.NoError(t, err)

	assert.Error(t, checkToolRequestRedirect(req, []*http.Request{via}))
}

func TestIsForbiddenToolRequestIP(t *testing.T) {
	assert.True(t, isForbiddenToolRequestIP(net.ParseIP("127.0.0.1")))
	assert.True(t, isForbiddenToolRequestIP(net.ParseIP("::1")))
	assert.True(t, isForbiddenToolRequestIP(net.ParseIP("10.1.2.3")))
	assert.True(t, isForbiddenToolRequestIP(net.ParseIP("169.254.169.254")))
	assert.True(t, isForbiddenToolRequestIP(net.ParseIP("100.64.0.1")))
	assert.True(t, isForbiddenToolRequestIP(net.ParseIP("::ffff:127.0.0.1")))
	assert.True(t, isForbiddenToolRequestIP(net.ParseIP("fc00::1")))
	assert.False(t, isForbiddenToolRequestIP(net.ParseIP("192.0.2.1")))
	assert.False(t, isForbiddenToolRequestIP(net.ParseIP("8.8.8.8")))
}
