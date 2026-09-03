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

package builtin

import (
	"context"
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
	ms "github.com/coze-dev/coze-studio/backend/internal/mock/infra/storage"
)

func TestParseMarkdown(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	mockStorage := ms.NewMockStorage(ctrl)
	mockStorage.EXPECT().PutObject(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()

	pfn := ParseMarkdown(&contract.Config{
		FileExtension: contract.FileExtensionMarkdown,
		ParsingStrategy: &contract.ParsingStrategy{
			ExtractImage: true,
			ExtractTable: true,
			ImageOCR:     true,
		},
		ChunkingStrategy: &contract.ChunkingStrategy{
			ChunkType:       contract.ChunkTypeCustom,
			ChunkSize:       800,
			Separator:       "\n",
			Overlap:         10,
			TrimSpace:       true,
			TrimURLAndEmail: true,
		},
	}, mockStorage, nil)

	f, err := os.Open("test_data/test_markdown.md")
	assert.NoError(t, err)
	docs, err := pfn(ctx, f, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for _, doc := range docs {
		assertDoc(t, doc)
	}
}

func assertDoc(t *testing.T, doc *schema.Document) {
	assert.NotZero(t, doc.Content)
	fmt.Println(doc.Content)
	assert.NotNil(t, doc.MetaData)
	assert.Equal(t, int64(123), doc.MetaData["document_id"].(int64))
	assert.Equal(t, int64(456), doc.MetaData["knowledge_id"].(int64))
}

func TestParseMarkdown_NilConfig(t *testing.T) {
	ctx := context.Background()
	pfn := ParseMarkdown(nil, nil, nil)
	_, err := pfn(ctx, strings.NewReader("hello"))
	assert.Error(t, err)
}

func TestParseMarkdown_NilStrategies(t *testing.T) {
	ctx := context.Background()
	// 防御性兜底：ChunkingStrategy/ParsingStrategy 为 nil 时不应 panic，应正常产出切片。
	pfn := ParseMarkdown(&contract.Config{
		FileExtension: contract.FileExtensionMarkdown,
	}, nil, nil)
	docs, err := pfn(ctx, strings.NewReader("hello world\nsecond line 星璇大桥"))
	assert.NoError(t, err)
	assert.NotEmpty(t, docs)
	assert.NotZero(t, docs[0].Content)
}
