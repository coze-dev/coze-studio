package builtin

import (
	"bytes"
	"context"
	"testing"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

func TestParseJSON(t *testing.T) {
	b := []byte(`[
    {
        "department": "心血管科",
        "title": "高血压患者能吃党参吗？",
        "question": "我有高血压这两天女婿来的时候给我拿了些党参泡水喝，您好高血压可以吃党参吗？",
        "answer": "高血压病人可以口服党参的。党参有降血脂，降血压的作用，可以彻底消除血液中的垃圾，从而对冠心病以及心血管疾病的患者都有一定的稳定预防工作作用，因此平时口服党参能远离三高的危害。另外党参除了益气养血，降低中枢神经作用，调整消化系统功能，健脾补肺的功能。感谢您的进行咨询，期望我的解释对你有所帮助。"
    },
    {
        "department": "消化科",
        "title": "哪家医院能治胃反流",
        "question": "烧心，打隔，咳嗽低烧，以有4年多",
        "answer": "建议你用奥美拉唑同时，加用吗丁啉或莫沙必利或援生力维，另外还可以加用达喜片"
    }
]`)

	reader := bytes.NewReader(b)

	config := &contract.Config{
		FileExtension: contract.FileExtensionJSON,
		ParsingStrategy: &contract.ParsingStrategy{
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     2,
		},
		ChunkingStrategy: nil,
	}
	pfn := parseJSON(config)
	docs, err := pfn(context.Background(), reader, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for _, doc := range docs {
		assertSheet(t, doc)
	}
}

func TestParseJSONWithSchema(t *testing.T) {
	b := []byte(`[
    {
        "department": "心血管科",
        "title": "高血压患者能吃党参吗？",
        "question": "我有高血压这两天女婿来的时候给我拿了些党参泡水喝，您好高血压可以吃党参吗？",
        "answer": "高血压病人可以口服党参的。党参有降血脂，降血压的作用，可以彻底消除血液中的垃圾，从而对冠心病以及心血管疾病的患者都有一定的稳定预防工作作用，因此平时口服党参能远离三高的危害。另外党参除了益气养血，降低中枢神经作用，调整消化系统功能，健脾补肺的功能。感谢您的进行咨询，期望我的解释对你有所帮助。"
    },
    {
        "department": "消化科",
        "title": "哪家医院能治胃反流",
        "question": "烧心，打隔，咳嗽低烧，以有4年多",
        "answer": "建议你用奥美拉唑同时，加用吗丁啉或莫沙必利或援生力维，另外还可以加用达喜片"
    }
]`)

	reader := bytes.NewReader(b)
	config := &contract.Config{
		FileExtension: contract.FileExtensionJSON,
		ParsingStrategy: &contract.ParsingStrategy{
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     2,
			Columns: []*document.Column{
				{
					ID:       101,
					Name:     "department",
					Type:     document.TableColumnTypeString,
					Nullable: false,
					Sequence: 0,
				},
				{
					ID:       102,
					Name:     "title",
					Type:     document.TableColumnTypeString,
					Nullable: false,
					Sequence: 1,
				},
				{
					ID:       103,
					Name:     "question",
					Type:     document.TableColumnTypeString,
					Nullable: false,
					Sequence: 2,
				},
				{
					ID:       104,
					Name:     "answer",
					Type:     document.TableColumnTypeString,
					Nullable: false,
					Sequence: 3,
				},
			},
		},
	}
	pfn := parseJSON(config)
	docs, err := pfn(context.Background(), reader, parser.WithExtraMeta(map[string]any{
		"document_id":  int64(123),
		"knowledge_id": int64(456),
	}))
	assert.NoError(t, err)
	for _, doc := range docs {
		assertSheet(t, doc)
	}
}
