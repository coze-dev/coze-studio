package builtin

//
//import (
//	"bytes"
//	"context"
//	"fmt"
//	"os"
//	"testing"
//
//	"github.com/stretchr/testify/assert"
//
//	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
//	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
//)
//
//func TestParseCSV(t *testing.T) {
//	ctx := context.Background()
//	b, err := os.ReadFile("/Users/bytedance/Downloads/statistics.www.coze.cn.csv")
//	assert.NoError(t, err)
//
//	r1 := bytes.NewReader(b)
//	// pre parse
//	result, err := parseCSV(ctx, r1, &entity.ParsingStrategy{
//		HeaderLine:    0,
//		DataStartLine: 1,
//		RowsCount:     20,
//	}, &entity.Document{
//		Info: common.Info{
//			ID:   123,
//			Name: "doc_name",
//		},
//		KnowledgeID:  456,
//		TableColumns: nil,
//	})
//	assert.NoError(t, err)
//	fmt.Println(result)
//
//	// parse
//	r2 := bytes.NewReader(b)
//	result, err = parseCSV(ctx, r2, &entity.ParsingStrategy{
//		HeaderLine:    0,
//		DataStartLine: 3,
//		RowsCount:     10,
//	}, &entity.Document{
//		Info: common.Info{
//			ID:   123,
//			Name: "doc_name",
//		},
//		KnowledgeID: 456,
//		TableColumns: []*entity.TableColumn{
//			//{
//			//	Name:     "chatgroup",
//			//	Type:     entity.TableColumnTypeInteger,
//			//	Sequence: 0,
//			//},
//			//{
//			//	Name:     "tags",
//			//	Type:     entity.TableColumnTypeString,
//			//	Sequence: 1,
//			//},
//			//{
//			//	Name:     "input",
//			//	Type:     entity.TableColumnTypeString,
//			//	Sequence: 2,
//			//},
//			//{
//			//	Name:     "output",
//			//	Type:     entity.TableColumnTypeString,
//			//	Sequence: 3,
//			//},
//			{
//				Name:     "host",
//				Type:     entity.TableColumnTypeString,
//				Sequence: 0,
//			},
//			{
//				Name:     "rules",
//				Type:     entity.TableColumnTypeString,
//				Sequence: 1,
//			},
//			{
//				Name:     "http_method",
//				Type:     entity.TableColumnTypeString,
//				Sequence: 2,
//			},
//			{
//				Name:     "psm",
//				Type:     entity.TableColumnTypeString,
//				Sequence: 3,
//			},
//			{
//				Name:     "env",
//				Type:     entity.TableColumnTypeString,
//				Sequence: 4,
//			},
//			{
//				Name:     "cluster",
//				Type:     entity.TableColumnTypeString,
//				Sequence: 5,
//			},
//			{
//				Name:     "path",
//				Type:     entity.TableColumnTypeString,
//				Sequence: 6,
//			},
//			{
//				Name:     "handler",
//				Type:     entity.TableColumnTypeString,
//				Sequence: 7,
//			},
//			{
//				Name:     "api_service_id",
//				Type:     entity.TableColumnTypeInteger,
//				Sequence: 8,
//			},
//		},
//	})
//	assert.NoError(t, err)
//	fmt.Println(result)
//}
