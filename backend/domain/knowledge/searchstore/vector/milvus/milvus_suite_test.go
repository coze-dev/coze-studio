package milvus

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"testing"

	. "github.com/bytedance/mockey"
	"github.com/cloudwego/eino/components/embedding"
	client "github.com/milvus-io/milvus/client/v2/milvusclient"
	. "github.com/smartystreets/goconvey/convey"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	contract "code.byted.org/flow/opencoze/backend/infra/contract/embedding"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestMilvusSuite(t *testing.T) {
	PatchConvey("test suite", t, func() {
		if os.Getenv("ENABLE_MILVUS_SUITE_TEST") != "true" {
			return
		}

		ctx := context.Background()
		connConfig := &client.ClientConfig{
			Address: "localhost:19530",
		}
		c, err := client.New(ctx, connConfig)
		So(err, ShouldBeNil)

		f, err := os.ReadFile("mock_embedding.json")
		So(err, ShouldBeNil)

		emb := &mockEmbedding{}
		So(json.Unmarshal(f, emb), ShouldBeNil)

		svc, err := NewSearchStore(&Config{
			Client:       c,
			Embedding:    emb,
			EnableHybrid: ptr.Of(true),
		})
		So(err, ShouldBeNil)

		docKnowledge := &mockKnowledge{
			knowledge: &entity.Knowledge{
				Info: common.Info{ID: 1, CreatorID: 999},
				Type: entity.DocumentTypeText,
			},
			document: &entity.Document{
				Info:        common.Info{ID: 11},
				KnowledgeID: 1,
				Type:        entity.DocumentTypeText,
			},
			slices: []*entity.Slice{
				{
					Info:        common.Info{ID: 1001},
					KnowledgeID: 1,
					DocumentID:  11,
					PlainText:   "1. Eiffel Tower: Located in Paris, France, it is one of the most famous landmarks in the world, designed by Gustave Eiffel and built in 1889.",
				},
				{
					Info:        common.Info{ID: 1002},
					KnowledgeID: 1,
					DocumentID:  11,
					PlainText:   "2. The Great Wall: Located in China, it is one of the Seven Wonders of the World, built from the Qin Dynasty to the Ming Dynasty, with a total length of over 20000 kilometers.",
				},
			},
		}

		sheetKnowledge := &mockKnowledge{
			knowledge: &entity.Knowledge{
				Info: common.Info{ID: 2, CreatorID: 999},
				Type: entity.DocumentTypeTable,
			},
			document: &entity.Document{
				Info:        common.Info{ID: 27},
				KnowledgeID: 2,
				Type:        entity.DocumentTypeTable,
				TableInfo: entity.TableInfo{
					Columns: []*entity.TableColumn{
						{
							ID:       201,
							Name:     "test_col_201",
							Type:     entity.TableColumnTypeString,
							Indexing: true,
							Sequence: 0,
						},
						{
							ID:       202,
							Name:     "test_col_202",
							Type:     entity.TableColumnTypeString,
							Indexing: false,
							Sequence: 1,
						},
						{
							ID:       203,
							Name:     "test_col_203",
							Type:     entity.TableColumnTypeString,
							Indexing: true,
							Sequence: 2,
						},
					},
				},
			},
			slices: []*entity.Slice{
				{
					Info:        common.Info{ID: 1003},
					KnowledgeID: 2,
					DocumentID:  27,
					RawContent: []*entity.SliceContent{
						{
							Type: entity.SliceContentTypeTable,
							Table: &entity.SliceTable{
								Columns: []entity.TableColumnData{
									{
										ColumnID:  201,
										Type:      entity.TableColumnTypeString,
										ValString: ptr.Of("3. Grand Canyon National Park: Located in Arizona, USA, it is famous for its deep canyons and magnificent scenery, which are cut by the Colorado River."),
									},
									{
										ColumnID:  202,
										Type:      entity.TableColumnTypeString,
										ValString: ptr.Of("asdqwe"),
									},
									{
										ColumnID:  203,
										Type:      entity.TableColumnTypeString,
										ValString: ptr.Of("5. Taj Mahal: Located in Agra, India, it was completed by Mughal Emperor Shah Jahan in 1653 to commemorate his wife and is one of the New Seven Wonders of the World."),
									},
								},
							},
						},
					},
				},
				{
					Info:        common.Info{ID: 1004},
					KnowledgeID: 2,
					DocumentID:  27,
					RawContent: []*entity.SliceContent{
						{
							Type: entity.SliceContentTypeTable,
							Table: &entity.SliceTable{
								Columns: []entity.TableColumnData{
									{
										ColumnID:  201,
										Type:      entity.TableColumnTypeString,
										ValString: ptr.Of("4. The Colosseum: Located in Rome, Italy, built between 70-80 AD, it was the largest circular arena in the ancient Roman Empire."),
									},
									{
										ColumnID:  202,
										Type:      entity.TableColumnTypeString,
										ValString: ptr.Of("zxcvbn"),
									},
									{
										ColumnID:  203,
										Type:      entity.TableColumnTypeString,
										ValString: ptr.Of("6. Sydney Opera House: Located in Sydney Harbour, Australia, it is one of the most iconic buildings of the 20th century, renowned for its unique sailboat design."),
									},
								},
							},
						},
					},
				},
			},
		}

		docs := []*mockKnowledge{docKnowledge, sheetKnowledge}
		//svc.Drop(ctx, docs[0].knowledge.ID)
		//svc.Drop(ctx, docs[1].knowledge.ID)

		defer func() {
			//svc.Drop(ctx, docs[0].knowledge.ID)
			//svc.Drop(ctx, docs[1].knowledge.ID)
			//fmt.Println("drop done")
		}()

		kMap := map[int64]*knowledge.KnowledgeInfo{}

		fmt.Println("start create & store")

		for i, doc := range docs {
			_ = i
			So(svc.Create(ctx, doc.document), ShouldBeNil)
			So(svc.Store(ctx, &searchstore.StoreRequest{
				KnowledgeID:  doc.knowledge.ID,
				DocumentID:   doc.document.ID,
				DocumentType: doc.document.Type,
				Slices:       doc.slices,
				CreatorID:    doc.knowledge.CreatorID,
				TableColumns: doc.document.TableInfo.Columns,
			}), ShouldBeNil)

			kMap[doc.knowledge.ID] = &knowledge.KnowledgeInfo{
				DocumentIDs:  []int64{doc.document.ID},
				DocumentType: doc.document.Type,
				TableColumns: doc.document.TableInfo.Columns,
			}
		}

		fmt.Println("create & store done, start retrieve")

		re, err := svc.Retrieve(ctx, &searchstore.RetrieveRequest{
			KnowledgeInfoMap: kMap,
			Query:            "best tourist attractions",
			TopK:             ptr.Of(int64(4)),
			MinScore:         ptr.Of(0.1),
			CreatorID:        ptr.Of(int64(999)),
			FilterDSL:        nil,
		})
		So(err, ShouldBeNil)
		for _, r := range re {
			fmt.Println(r.Slice.ID, r.Score)
		}

		fmt.Println("retrieve done, start delete")

		for _, doc := range docs {
			var ids []int64
			for _, s := range doc.slices {
				ids = append(ids, s.ID)
			}
			So(svc.Delete(ctx, doc.knowledge.ID, ids), ShouldBeNil)
		}
		fmt.Println("delete done")
	})
}

type mockKnowledge struct { // knowledge with 1 document
	knowledge *entity.Knowledge
	document  *entity.Document
	slices    []*entity.Slice
}

type mockEmbedding struct {
	idx    int
	Dense  [][]float64       `json:"dense"`
	Sparse []map[int]float64 `json:"sparse"`
}

func (m *mockEmbedding) EmbedStrings(ctx context.Context, texts []string, opts ...embedding.Option) ([][]float64, error) {
	if m.idx+len(texts) > len(m.Dense) {
		return nil, fmt.Errorf("too many texts")
	}
	resp := m.Dense[m.idx : m.idx+len(texts)]
	m.idx += len(texts)
	return resp, nil
}

func (m *mockEmbedding) EmbedStringsHybrid(ctx context.Context, texts []string, opts ...embedding.Option) ([][]float64, []map[int]float64, error) {
	if m.idx+len(texts) > len(m.Dense) {
		return nil, nil, fmt.Errorf("too many texts")
	}
	md := m.Dense[m.idx : m.idx+len(texts)]
	ms := m.Sparse[m.idx : m.idx+len(texts)]
	m.idx += len(texts)
	return md, ms, nil
}

func (m *mockEmbedding) Dimensions() int64 {
	return 1024
}

func (m *mockEmbedding) SupportStatus() contract.SupportStatus {
	return contract.SupportDenseAndSparse
}
