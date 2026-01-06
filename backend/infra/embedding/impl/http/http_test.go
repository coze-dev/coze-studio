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
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHTTPEmbedding(t *testing.T) {
	if os.Getenv("TEST_HTTP_EMBEDDING") != "true" {
		return
	}

	ctx := context.Background()
	emb, err := NewEmbedding("http://127.0.0.1:6543", 1024, 10)
	assert.NoError(t, err)
	texts := []string{
		"hello",
		"Eiffel Tower: Located in Paris, France, it is one of the most famous landmarks in the world.",
	}

	dense, err := emb.EmbedStrings(ctx, texts)
	assert.NoError(t, err)
	fmt.Println(dense)

	dense, sparse, err := emb.EmbedStringsHybrid(ctx, texts)
	assert.NoError(t, err)
	fmt.Println(dense, sparse)
}
