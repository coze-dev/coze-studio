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

package textprocessor

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewTextProcessorNodeGenerator(t *testing.T) {
	ctx := context.Background()
	t.Run("split", func(t *testing.T) {
		cfg := &Config{
			Type:       SplitText,
			Separators: []string{",", "|", "."},
		}
		p, err := NewTextProcessor(ctx, cfg)
		assert.NoError(t, err)

		result, err := p.Invoke(ctx, map[string]any{
			"String": "a,b|c.d,e|f|g",
		})

		assert.NoError(t, err)
		assert.Equal(t, result["output"], []any{"a", "b", "c", "d", "e", "f", "g"})
	})

	t.Run("concat", func(t *testing.T) {
		in := map[string]any{
			"a": []any{"1", map[string]any{
				"1": 1,
			}, 3},
			"b": map[string]any{
				"b1": []string{"1", "2", "3"},
				"b2": []any{"1", 2, "3"},
			},
			"c": map[string]any{
				"c1": "1",
			},
		}

		cfg := &Config{
			Type:       ConcatText,
			ConcatChar: `\t`,
			Tpl:        "fx{{a}}=={{b.b1}}=={{b.b2[1]}}=={{c}}",
		}
		p, err := NewTextProcessor(context.Background(), cfg)

		result, err := p.Invoke(ctx, in)
		assert.NoError(t, err)
		assert.Equal(t, result["output"], `fx1\t{"1":1}\t3==1\t2\t3==2=={"c1":"1"}`)
	})
}
