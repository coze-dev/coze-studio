package builtin

import (
	"context"
	"os"
	"testing"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/stretchr/testify/assert"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

func TestParsePDF(t *testing.T) {
	f, err := os.Open("./test_data/test_pdf.pdf")
	assert.NoError(t, err)

	config := &contract.Config{
		FileExtension: contract.FileExtensionPDF,
		ParsingStrategy: &contract.ParsingStrategy{
			ExtractImage:  true,
			ExtractTable:  true,
			ImageOCR:      true,
			SheetID:       nil,
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     0,
			IsAppend:      false,
			Columns:       nil,
		},
		ChunkingStrategy: &contract.ChunkingStrategy{
			ChunkType:       contract.ChunkTypeCustom,
			ChunkSize:       20,
			Separator:       "\n",
			Overlap:         2,
			TrimSpace:       true,
			TrimURLAndEmail: true,
			MaxDepth:        0,
		},
	}
	fn := parsePDF(config)
	docs, err := fn(context.Background(), f, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for _, doc := range docs {
		assertDoc(t, doc)
	}
}
