package elasticsearch

import (
	"context"
	"fmt"
	"os"
	"testing"

	. "github.com/bytedance/mockey"
	"github.com/elastic/go-elasticsearch/v8"
	. "github.com/smartystreets/goconvey/convey"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestESSuite(t *testing.T) {
	PatchConvey("test es suite", t, func() {
		if os.Getenv("TEST_ES_SUITE") != "true" {
			return
		}

		ctx := context.Background()
		//f, err := os.ReadFile(os.Getenv("ES_CA_CERT_PATH"))
		//So(err, ShouldBeNil)

		cli, err := elasticsearch.NewTypedClient(elasticsearch.Config{
			Addresses: []string{"http://localhost:9200"},
			//Username:  os.Getenv("ES_USERNAME"),
			//Password:  os.Getenv("ES_PASSWORD"),
			//CACert:    f,
		})
		So(err, ShouldBeNil)

		svc := NewSearchStore(&Config{
			Client:       cli,
			CompactTable: ptr.Of(true),
		})

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
		defer func() {
			svc.Drop(ctx, docs[0].knowledge.ID)
			svc.Drop(ctx, docs[1].knowledge.ID)
		}()

		kMap := map[int64]*knowledge.KnowledgeInfo{}

		fmt.Println("start drop & create & store")
		for _, doc := range docs {
			svc.Drop(ctx, doc.knowledge.ID)
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
			Query:            "Park",
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
