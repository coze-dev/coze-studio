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

package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/stretchr/testify/require"
)

// TestDimensionsConcurrent ensures the lazy dimension cache is safe under
// concurrent first-time access (no data race, single embed call).
func TestDimensionsConcurrent(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Return a 1024-dim dense vector for the "test" probe.
		_ = json.NewEncoder(w).Encode(map[string]any{
			"dense": [][]float64{make([]float64, 1024)},
		})
	}))
	defer ts.Close()

	emb := &embedder{
		cli:       ts.Client(),
		addr:      ts.URL,
		batchSize: 1,
	}

	const n = 32
	var wg sync.WaitGroup
	wg.Add(n)
	for i := 0; i < n; i++ {
		go func() {
			defer wg.Done()
			require.Equal(t, int64(1024), emb.Dimensions())
		}()
	}
	wg.Wait()
}
