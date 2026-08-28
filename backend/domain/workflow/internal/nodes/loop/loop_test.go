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

package loop

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type mockInner struct {
	compose.Runnable[map[string]any, map[string]any]
}

// An output source with a literal value has Ref == nil; Build must not panic.
func TestBuildLiteralOutputSource(t *testing.T) {
	c := &Config{}
	ns := &schema.NodeSchema{
		Key: "loop_1",
		OutputSources: []*vo.FieldInfo{
			{
				Path: []string{"output"},
				Source: vo.FieldSource{
					Val: "literal",
				},
			},
		},
	}

	node, err := c.Build(context.Background(), ns, schema.WithInnerWorkflow(&mockInner{}))
	require.NoError(t, err)
	require.NotNil(t, node)
}
