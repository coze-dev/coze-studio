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

package nodes

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

func TestExtractJSONString(t *testing.T) {
	s := "\n```json{\"k\":1}```\t"
	s1 := ExtractJSONString(s)
	var v map[string]any
	err := sonic.UnmarshalString(s1, &v)
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{"k": int64(1)}, v)
}
