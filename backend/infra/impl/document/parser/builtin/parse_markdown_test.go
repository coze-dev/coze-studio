package builtin

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	ms "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/storage"
)

func TestParseMarkdown(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	mockStorage := ms.NewMockStorage(ctrl)
	mockStorage.EXPECT().PutObject(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()

	pfn := parseMarkdown(&contract.Config{
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
