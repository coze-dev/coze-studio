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

package convert

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser"
)

func TestToParseConfig_DefaultsChunkingStrategyWhenNil(t *testing.T) {
	config := ToParseConfig(parser.FileExtensionMarkdown, nil, nil, false, nil)

	require.NotNil(t, config)
	require.NotNil(t, config.ChunkingStrategy)
	assert.Equal(t, parser.ChunkTypeDefault, config.ChunkingStrategy.ChunkType)
	assert.Equal(t, int64(consts.DefaultChunkSize), config.ChunkingStrategy.ChunkSize)
	assert.Equal(t, consts.DefaultSeparator, config.ChunkingStrategy.Separator)
	assert.Equal(t, int64(consts.DefaultOverlap), config.ChunkingStrategy.Overlap)
	assert.Equal(t, consts.DefaultTrimSpace, config.ChunkingStrategy.TrimSpace)
	assert.Equal(t, consts.DefaultTrimURLAndEmail, config.ChunkingStrategy.TrimURLAndEmail)
	assert.Equal(t, int64(0), config.ChunkingStrategy.MaxDepth)
	assert.False(t, config.ChunkingStrategy.SaveTitle)
}

func TestToParseConfig_PassesThroughChunkingStrategy(t *testing.T) {
	chunkingStrategy := &entity.ChunkingStrategy{
		ChunkType:       parser.ChunkTypeCustom,
		ChunkSize:       1024,
		Separator:       "---",
		Overlap:         128,
		TrimSpace:       true,
		TrimURLAndEmail: true,
		MaxDepth:        3,
		SaveTitle:       true,
	}

	config := ToParseConfig(parser.FileExtensionMarkdown, nil, chunkingStrategy, false, nil)

	require.NotNil(t, config)
	require.NotNil(t, config.ChunkingStrategy)
	assert.Equal(t, chunkingStrategy.ChunkType, config.ChunkingStrategy.ChunkType)
	assert.Equal(t, chunkingStrategy.ChunkSize, config.ChunkingStrategy.ChunkSize)
	assert.Equal(t, chunkingStrategy.Separator, config.ChunkingStrategy.Separator)
	assert.Equal(t, chunkingStrategy.Overlap, config.ChunkingStrategy.Overlap)
	assert.Equal(t, chunkingStrategy.TrimSpace, config.ChunkingStrategy.TrimSpace)
	assert.Equal(t, chunkingStrategy.TrimURLAndEmail, config.ChunkingStrategy.TrimURLAndEmail)
	assert.Equal(t, chunkingStrategy.MaxDepth, config.ChunkingStrategy.MaxDepth)
	assert.Equal(t, chunkingStrategy.SaveTitle, config.ChunkingStrategy.SaveTitle)
}
