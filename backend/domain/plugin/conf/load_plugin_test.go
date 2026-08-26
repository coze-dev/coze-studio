/*
 * Copyright 2026 coze-dev Authors
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

package conf

import (
	"context"
	"path/filepath"
	"reflect"
	"runtime"
	"testing"
)

func TestLoadPluginProductMetaIncludesXquik(t *testing.T) {
	previousPlugins := pluginProducts
	previousTools := toolProducts
	t.Cleanup(func() {
		pluginProducts = previousPlugins
		toolProducts = previousTools
	})

	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("resolve test file path")
	}
	basePath := filepath.Clean(filepath.Join(filepath.Dir(filename), "../../../conf/plugin"))
	if err := loadPluginProductMeta(context.Background(), basePath); err != nil {
		t.Fatalf("load plugin product metadata: %v", err)
	}

	plugin, ok := GetPluginProduct(24)
	if !ok {
		t.Fatal("Xquik plugin was not loaded")
	}
	if got, want := *plugin.Info.ServerURL, "https://xquik.com/api/v1"; got != want {
		t.Fatalf("server URL = %q, want %q", got, want)
	}
	if got, want := plugin.ToolIDs, []int64{240001, 240002, 240003}; !reflect.DeepEqual(got, want) {
		t.Fatalf("tool IDs = %v, want %v", got, want)
	}
	if got, want := len(plugin.Info.OpenapiDoc.Paths), 3; got != want {
		t.Fatalf("OpenAPI path count = %d, want %d", got, want)
	}

	auth := plugin.Info.Manifest.Auth.AuthOfAPIToken
	if auth == nil {
		t.Fatal("Xquik API-key auth was not parsed")
	}
	if got, want := auth.Key, "x-api-key"; got != want {
		t.Fatalf("auth key = %q, want %q", got, want)
	}
	if got, want := string(auth.Location), "Header"; got != want {
		t.Fatalf("auth location = %q, want %q", got, want)
	}
	if auth.ServiceToken != "" {
		t.Fatal("committed Xquik credential must be empty")
	}

	wantTools := map[int64]struct {
		method string
		path   string
	}{
		240001: {method: "get", path: "/x/tweets/search"},
		240002: {method: "get", path: "/x/tweets/{id}"},
		240003: {method: "get", path: "/x/users/{id}"},
	}
	for id, want := range wantTools {
		tool, ok := GetToolProduct(id)
		if !ok {
			t.Fatalf("tool %d was not loaded", id)
		}
		if got := *tool.Info.Method; got != want.method {
			t.Errorf("tool %d method = %q, want %q", id, got, want.method)
		}
		if got := *tool.Info.SubURL; got != want.path {
			t.Errorf("tool %d path = %q, want %q", id, got, want.path)
		}
	}
}
