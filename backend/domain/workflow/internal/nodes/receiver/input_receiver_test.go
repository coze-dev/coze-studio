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

package receiver

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

func Test_jsonParseRelaxed(t *testing.T) {
	tInfos := map[string]*vo.TypeInfo{
		"str_key": {
			Type: vo.DataTypeString,
		},
		"obj_key": {
			Type: vo.DataTypeObject,
			Properties: map[string]*vo.TypeInfo{
				"field1": {
					Type: vo.DataTypeString,
				},
			},
		},
	}

	data := `{"str_key": "val"}`

	result, err := jsonParseRelaxed(context.Background(), data, tInfos)
	assert.NoError(t, err)
	assert.Equal(t, map[string]any{"str_key": "val"}, result)
}
