package builtin

import (
	"bytes"
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
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
	ps := &entity.ParsingStrategy{
		SheetID:       0,
		HeaderLine:    0,
		DataStartLine: 1,
		RowsCount:     2,
	}
	schema, slices, err := parseJSON(context.Background(), reader, ps, &entity.Document{
		Info: common.Info{
			ID: 123,
		},
		KnowledgeID:     456,
		Type:            entity.DocumentTypeTable,
		ParsingStrategy: ps,
		TableInfo:       entity.TableInfo{},
		IsAppend:        false,
	})
	assert.NoError(t, err)
	fmt.Println(schema, slices)
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
	ps := &entity.ParsingStrategy{
		SheetID:       0,
		HeaderLine:    0,
		DataStartLine: 1,
		RowsCount:     2,
	}
	schema, slices, err := parseJSON(context.Background(), reader, ps, &entity.Document{
		Info: common.Info{
			ID: 123,
		},
		KnowledgeID:     456,
		Type:            entity.DocumentTypeTable,
		ParsingStrategy: ps,
		TableInfo: entity.TableInfo{
			VirtualTableName:  "vt",
			PhysicalTableName: "pt",
			TableDesc:         "test",
			Columns: []*entity.TableColumn{
				{
					ID:       101,
					Name:     "department",
					Type:     entity.TableColumnTypeString,
					Indexing: true,
					Sequence: 0,
				},
				{
					ID:       102,
					Name:     "title",
					Type:     entity.TableColumnTypeString,
					Indexing: true,
					Sequence: 1,
				},
				{
					ID:       103,
					Name:     "question",
					Type:     entity.TableColumnTypeString,
					Indexing: true,
					Sequence: 2,
				},
				{
					ID:       104,
					Name:     "answer",
					Type:     entity.TableColumnTypeString,
					Indexing: true,
					Sequence: 3,
				},
				{
					ID:          105,
					Name:        consts.RDBFieldID,
					Type:        entity.TableColumnTypeInteger,
					Description: "主键ID",
					Indexing:    false,
					Sequence:    -1,
				},
			},
		},
		IsAppend: false,
	})
	assert.NoError(t, err)
	fmt.Println(schema, slices)
}
