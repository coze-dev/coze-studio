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
	mock_storage "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/storage"
)

func TestParseDocx(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockStorage := mock_storage.NewMockStorage(ctrl)
	f, err := os.Open("./test_data/test_docx_1.docx")
	assert.NoError(t, err)

	mockStorage.EXPECT().PutObject(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()
	config := &contract.Config{
		FileExtension: contract.FileExtensionDocx,
		ParsingStrategy: &contract.ParsingStrategy{
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     20,
			ExtractImage:  true,
			ExtractTable:  true,
		},
		ChunkingStrategy: &contract.ChunkingStrategy{
			ChunkType:       contract.ChunkTypeCustom,
			ChunkSize:       25,
			Separator:       ",",
			Overlap:         5,
			TrimSpace:       true,
			TrimURLAndEmail: true,
		},
	}

	pfn := parseDocx(config, mockStorage, nil)
	docs, err := pfn(context.Background(), f, parser.WithExtraMeta(map[string]any{
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
