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

package impl

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
)

func TestResolveRightValueLikeWildcard(t *testing.T) {
	value, vals, err := resolveRightValue(model.Operation_LIKE, "alice")
	require.NoError(t, err)
	require.Equal(t, "?", value)
	require.Len(t, vals, 1)
	require.Equal(t, "%alice%", *vals[0].Value, "LIKE parameter must be %value% so the wildcard matches")
}

func TestResolveRightValueNotLikeWildcard(t *testing.T) {
	value, vals, err := resolveRightValue(model.Operation_NOT_LIKE, "tmp")
	require.NoError(t, err)
	require.Equal(t, "?", value)
	require.Len(t, vals, 1)
	require.Equal(t, "%tmp%", *vals[0].Value)
}

func TestResolveRightValueEquality(t *testing.T) {
	value, vals, err := resolveRightValue(model.Operation_EQUAL, "alice")
	require.NoError(t, err)
	require.Equal(t, "?", value)
	require.Len(t, vals, 1)
	require.Equal(t, "alice", *vals[0].Value, "non-LIKE operators must keep the raw value")
}
