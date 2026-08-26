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

package elasticsearch

import (
	"encoding/json"
	"math"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/infra/es"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestParseSearchResultZeroScore(t *testing.T) {
	// All hits have _score == 0 (e.g. constant-score / filter context).
	zero := 0.0
	resp := &es.Response{
		Hits: es.HitsMetadata{
			Hits: []es.Hit{
				{Id_: ptr.Of("a"), Score_: &zero, Source_: json.RawMessage(`{}`)},
				{Id_: ptr.Of("b"), Score_: &zero, Source_: json.RawMessage(`{}`)},
			},
		},
	}

	docs, err := (&esSearchStore{}).parseSearchResult(resp)
	require.NoError(t, err)
	require.Len(t, docs, 2)
	for _, d := range docs {
		require.False(t, math.IsNaN(d.Score()), "score must not be NaN when firstScore is 0")
		require.Zero(t, d.Score())
	}
}

func TestParseSearchResultNormalizesScore(t *testing.T) {
	s1, s2, s3 := 2.0, 4.0, 1.0
	resp := &es.Response{
		Hits: es.HitsMetadata{
			Hits: []es.Hit{
				{Id_: ptr.Of("a"), Score_: &s1, Source_: json.RawMessage(`{}`)},
				{Id_: ptr.Of("b"), Score_: &s2, Source_: json.RawMessage(`{}`)},
				{Id_: ptr.Of("c"), Score_: &s3, Source_: json.RawMessage(`{}`)},
			},
		},
	}

	docs, err := (&esSearchStore{}).parseSearchResult(resp)
	require.NoError(t, err)
	require.Len(t, docs, 3)
	require.Equal(t, 1.0, docs[0].Score()) // first hit normalized to 1
	require.Equal(t, 2.0, docs[1].Score()) // 4 / 2
	require.Equal(t, 0.5, docs[2].Score()) // 1 / 2
}
