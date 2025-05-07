package service

import (
	"context"
	"os"
	"testing"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/nl2sql/nl2sqlImpl"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/rewrite/llm_based"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/service"
	producerMock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/eventbus"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	storageMock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"github.com/bytedance/mockey"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func MockKnowledgeSVC(t *testing.T) knowledge.Knowledge {
	// os.Setenv("MYSQL_DSN", "coze:coze123@(localhost:3306)/opencoze?charset=utf8mb4&parseTime=True")
	os.Setenv("MYSQL_DSN", `root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local`)
	db, err := gorm.Open(mysql.Open(`root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local`))

	// mockDB := orm_mock.NewMockDB()
	// mockDB.AddTable(&model.Knowledge{}).AddRows(&model.Knowledge{ID: 1745762848936250000})
	// mockDB.AddTable(&model.KnowledgeDocument{})
	// mockDB.AddTable(&model.KnowledgeDocumentSlice{})
	// db, err := mockDB.DB()
	assert.NoError(t, err)
	//d, err := db.DB()
	//assert.NoError(t, err)
	//d.SetMaxOpenConns(1)
	//d.SetMaxIdleConns(1)

	ctrl := gomock.NewController(t)
	//defer ctrl.Finish()
	//rdbMock := rdb.NewMockRDB(ctrl)
	//rdbMock.EXPECT().CreateTable(gomock.Any(), gomock.Any()).Return(&rdbInterface.CreateTableResponse{
	//	Table: &rdbEntity.Table{
	//		Name: "test_table",
	//	},
	//}, nil).AnyTimes()
	//rdbMock.EXPECT().AlterTable(gomock.Any(), gomock.Any()).Return(&rdbInterface.AlterTableResponse{
	//	Table: &rdbEntity.Table{
	//		Name: "test_table",
	//	},
	//}, nil).AnyTimes()
	//rdbMock.EXPECT().DropTable(gomock.Any(), gomock.Any()).Return(&rdbInterface.DropTableResponse{
	//	Success: true,
	//}, nil).AnyTimes()
	mockIDGen := mock.NewMockIDGenerator(ctrl)
	mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(ctx context.Context) (int64, error) {
		baseID := time.Now().UnixNano()
		id := baseID
		baseID++
		return id, nil
	}).AnyTimes()

	mockIDGen.EXPECT().GenMultiIDs(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, count int) ([]int64, error) {
		baseID := time.Now().UnixNano()
		ids := make([]int64, count)
		for i := 0; i < count; i++ {
			ids[i] = baseID
			baseID++
		}
		return ids, nil
	}).AnyTimes()
	producer := producerMock.NewMockProducer(ctrl)
	producer.EXPECT().Send(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()
	mockStorage := storageMock.NewMockStorage(ctrl)
	mockStorage.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any()).Return("URL_ADDRESS", nil).AnyTimes()
	mockStorage.EXPECT().GetObject(gomock.Any(), gomock.Any()).Return([]byte("test text"), nil).AnyTimes()
	mockStorage.EXPECT().PutObject(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()
	rdb := service.NewService(db, mockIDGen)
	rewriter := llm_based.NewRewriter(nil, "")
	nl2sql := nl2sqlImpl.NewNL2Sql(nil, "")
	svc, _ := NewKnowledgeSVC(&KnowledgeSVCConfig{
		DB:            db,
		IDGen:         mockIDGen,
		Storage:       mockStorage,
		Producer:      producer,
		SearchStores:  nil,
		RDB:           rdb,
		QueryRewriter: rewriter,
		NL2Sql:        nl2sql,
	})
	return svc
}

func TestKnowledgeSVC_CreateKnowledge(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	kn, err := svc.CreateKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{
			Name:        "test",
			Description: "test knowledge",
			IconURI:     "icon.png",
			CreatorID:   666,
			SpaceID:     666,
			ProjectID:   888,
		},
		Type: entity.DocumentTypeTable,
	})
	assert.NoError(t, err)
	assert.NotNil(t, kn)
	assert.NotZero(t, kn.ID)
	assert.NotZero(t, kn.CreatedAtMs)
	assert.NotZero(t, kn.UpdatedAtMs)
}

func TestKnowledgeSVC_UpdateKnowledge(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	_, err := svc.UpdateKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{
			Name:        "test",
			Description: "test knowledge",
			IconURI:     "icon.png",
			CreatorID:   666,
			SpaceID:     777,
			ProjectID:   888,
		},
		Status: entity.KnowledgeStatusDisable,
	})
	assert.Error(t, err, "knowledge id is empty")
	time.Sleep(time.Millisecond * 5)
	_, err = svc.UpdateKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{
			ID:      1745762848936250000,
			Name:    "222",
			IconURI: "",
		},
	})
	assert.NoError(t, err)
}

func TestKnowledgeSVC_DeleteKnowledge(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	kn, err := svc.CreateKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{
			Name:        "test",
			Description: "test knowledge",
			IconURI:     "icon.png",
			CreatorID:   666,
			SpaceID:     666,
			ProjectID:   888,
		},
		Type: entity.DocumentTypeTable,
	})
	assert.NoError(t, err)
	assert.NotNil(t, kn)
	time.Sleep(time.Millisecond * 5)
	_, err = svc.DeleteKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{
			ID: kn.ID,
		},
	})
	assert.NoError(t, err)
}

func TestKnowledgeSVC_MGetKnowledge(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	spaceID := int64(666)
	projectID := "888"
	name := "test"
	page := 1
	pageSize := 10
	order := knowledge.OrderCreatedAt
	orderType := knowledge.OrderTypeAsc
	formatType := int64(entity.DocumentTypeTable)
	kns, total, err := svc.MGetKnowledge(ctx, &knowledge.MGetKnowledgeRequest{
		IDs:        []int64{1745758935573308000, 1745810102455734000, 1745810115243825000},
		SpaceID:    &spaceID,
		ProjectID:  &projectID,
		Status:     []int32{int32(entity.KnowledgeStatusEnable)},
		Page:       &page,
		PageSize:   &pageSize,
		Name:       &name,
		Order:      &order,
		OrderType:  &orderType,
		FormatType: &formatType,
	})
	assert.NoError(t, err)
	assert.Equal(t, 0, len(kns))
	assert.Equal(t, int64(0), total)
}

func TestKnowledgeSVC_CreateDocument(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	//mockey.PatchConvey("test txt local doc", t, func() {
	//	document := &entity.Document{
	//		Info: common.Info{
	//			Name:        "test11",
	//			Description: "test222",
	//			CreatorID:   666,
	//			SpaceID:     666,
	//			ProjectID:   888,
	//			IconURI:     "icon.png",
	//		},
	//		KnowledgeID:   666,
	//		Type:          entity.DocumentTypeText,
	//		URI:           "test.txt",
	//		FileExtension: "txt",
	//	}
	//	doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
	//	assert.NoError(t, err)
	//	assert.NotNil(t, doc)
	//})
	//mockey.PatchConvey("test custom doc", t, func() {
	//	document := &entity.Document{
	//		Info: common.Info{
	//			Name:        "test_custom",
	//			Description: "test222",
	//			CreatorID:   666,
	//			SpaceID:     666,
	//			ProjectID:   888,
	//			IconURI:     "icon.png",
	//		},
	//		KnowledgeID:   666,
	//		RawContent:    "测试测试测试测试",
	//		Source:        entity.DocumentSourceCustom,
	//		FileExtension: "txt",
	//	}
	//	doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
	//	assert.NoError(t, err)
	//	assert.NotNil(t, doc)
	//})
	mockey.PatchConvey("test table doc", t, func() {
		document := &entity.Document{
			Info: common.Info{
				Name:        "testtable",
				Description: "test222",
				CreatorID:   666,
				SpaceID:     666,
				ProjectID:   888,
				IconURI:     "icon.png",
			},
			KnowledgeID:   666,
			Type:          entity.DocumentTypeTable,
			URI:           "test.xlsx",
			FileExtension: "xlsx",
			TableInfo: entity.TableInfo{
				VirtualTableName: "test",
				Columns: []*entity.TableColumn{
					{
						Name:     "第一列",
						Type:     entity.TableColumnTypeBoolean,
						Indexing: true,
						Sequence: 0,
					},
					{
						Name:     "第二列",
						Type:     entity.TableColumnTypeTime,
						Indexing: false,
						Sequence: 1,
					},
					{
						Name:     "第三列",
						Type:     entity.TableColumnTypeString,
						Indexing: false,
						Sequence: 2,
					},
					{
						Name:     "第四列",
						Type:     entity.TableColumnTypeNumber,
						Indexing: true,
						Sequence: 3,
					},
				},
			},
		}
		doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
		assert.NoError(t, err)
		assert.NotNil(t, doc)
	})
	// mockey.PatchConvey("test table custom append", t, func() {
	// 	row := map[string]string{
	// 		"col1": "11",
	// 		"col2": "22",
	// 	}
	// 	rows := []map[string]string{row}
	// 	data, err := sonic.Marshal(rows)
	// 	assert.NoError(t, err)
	// 	document := &entity.Document{
	// 		Info: common.Info{
	// 			ID:          1745829456377646000,
	// 			Name:        "testtable_custom",
	// 			Description: "test222",
	// 			CreatorID:   666,
	// 			SpaceID:     666,
	// 			ProjectID:   888,
	// 			IconURI:     "icon.png",
	// 		},
	// 		Source:      entity.DocumentSourceCustom,
	// 		RawContent:  string(data),
	// 		KnowledgeID: 666,
	// 		Type:        entity.DocumentTypeTable,
	// 		TableInfo: entity.TableInfo{
	// 			VirtualTableName: "test",
	// 			Columns: []*entity.TableColumn{
	// 				{
	// 					Name:     "第一列",
	// 					Type:     entity.TableColumnTypeBoolean,
	// 					Indexing: true,
	// 					Sequence: 0,
	// 				},
	// 				{
	// 					Name:     "第二列",
	// 					Type:     entity.TableColumnTypeTime,
	// 					Indexing: false,
	// 					Sequence: 1,
	// 				},
	// 				{
	// 					Name:     "第三列",
	// 					Type:     entity.TableColumnTypeString,
	// 					Indexing: false,
	// 					Sequence: 2,
	// 				},
	// 				{
	// 					Name:     "第四列",
	// 					Type:     entity.TableColumnTypeNumber,
	// 					Indexing: true,
	// 					Sequence: 3,
	// 				},
	// 			},
	// 		},
	// 		IsAppend: true,
	// 	}
	// 	doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
	// 	assert.NoError(t, err)
	// 	assert.NotNil(t, doc)
	// })
}

func TestKnowledgeSVC_DeleteDocument(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	document := &entity.Document{
		Info: common.Info{
			Name:        "testtable",
			Description: "test222",
			CreatorID:   666,
			SpaceID:     666,
			ProjectID:   888,
			IconURI:     "icon.png",
		},
		KnowledgeID:   666,
		Type:          entity.DocumentTypeTable,
		URI:           "test.xlsx",
		FileExtension: "xlsx",
		TableInfo: entity.TableInfo{
			VirtualTableName: "test",
			Columns: []*entity.TableColumn{
				{
					Name:     "第一列",
					Type:     entity.TableColumnTypeBoolean,
					Indexing: true,
					Sequence: 0,
				},
				{
					Name:     "第二列",
					Type:     entity.TableColumnTypeTime,
					Indexing: false,
					Sequence: 1,
				},
				{
					Name:     "第三列",
					Type:     entity.TableColumnTypeString,
					Indexing: false,
					Sequence: 2,
				},
				{
					Name:     "第四列",
					Type:     entity.TableColumnTypeNumber,
					Indexing: true,
					Sequence: 3,
				},
			},
		},
	}
	doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
	assert.NoError(t, err)
	assert.Equal(t, 1, len(doc))
	_, err = svc.DeleteDocument(ctx, &entity.Document{
		Info: common.Info{
			ID: doc[0].ID,
		},
	})
	assert.NoError(t, err)
}

func TestKnowledgeSVC_UpdateDocument(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	document := &entity.Document{
		Info: common.Info{
			Name:        "testtable",
			Description: "test222",
			CreatorID:   666,
			SpaceID:     666,
			ProjectID:   888,
			IconURI:     "icon.png",
		},
		KnowledgeID:   666,
		Type:          entity.DocumentTypeTable,
		URI:           "test.xlsx",
		FileExtension: "xlsx",
		TableInfo: entity.TableInfo{
			VirtualTableName: "test",
			Columns: []*entity.TableColumn{
				{
					Name:     "第一列",
					Type:     entity.TableColumnTypeBoolean,
					Indexing: true,
					Sequence: 0,
				},
				{
					Name:     "第二列",
					Type:     entity.TableColumnTypeTime,
					Indexing: false,
					Sequence: 1,
				},
				{
					Name:     "第三列",
					Type:     entity.TableColumnTypeString,
					Indexing: false,
					Sequence: 2,
				},
				{
					Name:     "第四列",
					Type:     entity.TableColumnTypeNumber,
					Indexing: true,
					Sequence: 3,
				},
			},
		},
	}
	doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
	assert.NoError(t, err)
	assert.Equal(t, 1, len(doc))
	doc[0].Name = "new_name"
	doc[0].TableInfo.Columns[0].Name = "第一列_changeName"
	doc[0].TableInfo.Columns[1].Name = "第二列_changeSeq"
	doc[0].TableInfo.Columns[1].Sequence = 2
	doc[0].TableInfo.Columns[2].Name = "第三列_changeType"
	doc[0].TableInfo.Columns[2].Type = entity.TableColumnTypeInteger
	doc[0].TableInfo.Columns[2].Sequence = 1
	// 删除原来的第四列并新建第四列
	doc[0].TableInfo.Columns[3].Name = "第五列_create"
	doc[0].TableInfo.Columns[3].Type = entity.TableColumnTypeNumber
	doc[0].TableInfo.Columns[3].Sequence = 3
	doc[0].TableInfo.Columns[3].ID = 0
	doc[0].TableInfo.Columns[3].Indexing = true
	document, err = svc.UpdateDocument(ctx, doc[0])
	assert.NoError(t, err)
	assert.NotNil(t, document)
}

func TestKnowledgeSVC_ListDocument(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	cursor := "1745907737419325000"
	listResp, err := svc.ListDocument(ctx, &knowledge.ListDocumentRequest{
		KnowledgeID: 666,
		DocumentIDs: []int64{1745826797157894000, 1745908100980977000},
		Cursor:      &cursor,
	})
	assert.NoError(t, err)
	assert.NotNil(t, listResp)
}

func TestKnowledgeSVC_CreateSlice(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	mockey.PatchConvey("test insert table slice", t, func() {
		kn, err := svc.CreateKnowledge(ctx, &entity.Knowledge{
			Info: common.Info{
				Name:        "test",
				Description: "test knowledge",
				IconURI:     "icon.png",
				CreatorID:   666,
				SpaceID:     666,
				ProjectID:   888,
			},
			Type: entity.DocumentTypeTable,
		})
		assert.NoError(t, err)
		assert.NotNil(t, kn)
		document := &entity.Document{
			Info: common.Info{
				Name:        "testtable",
				Description: "test222",
				CreatorID:   666,
				SpaceID:     666,
				ProjectID:   888,
				IconURI:     "icon.png",
			},
			KnowledgeID:   kn.ID,
			Type:          entity.DocumentTypeTable,
			URI:           "test.xlsx",
			FileExtension: "xlsx",
			TableInfo: entity.TableInfo{
				VirtualTableName: "test",
				Columns: []*entity.TableColumn{
					{
						Name:     "第一列",
						Type:     entity.TableColumnTypeBoolean,
						Indexing: true,
						Sequence: 0,
					},
					{
						Name:     "第二列",
						Type:     entity.TableColumnTypeTime,
						Indexing: false,
						Sequence: 1,
					},
					{
						Name:     "第三列",
						Type:     entity.TableColumnTypeString,
						Indexing: false,
						Sequence: 2,
					},
					{
						Name:     "第四列",
						Type:     entity.TableColumnTypeNumber,
						Indexing: true,
						Sequence: 3,
					},
				},
			},
		}
		doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
		assert.NoError(t, err)
		assert.Equal(t, 1, len(doc))
		boolValue := "true"
		timeValue := "2022-01-02 15:04:05"
		textValue := "text"
		floatValue := "1.1"
		columns := make([]entity.TableColumnData, 0)
		column0, err := convert.AssertValAs(entity.TableColumnTypeBoolean, boolValue)
		column0.ColumnID = doc[0].TableInfo.Columns[0].ID
		column0.ColumnName = doc[0].TableInfo.Columns[0].Name
		assert.NoError(t, err)
		columns = append(columns, *column0)
		column1, err := convert.AssertValAs(entity.TableColumnTypeTime, timeValue)
		column1.ColumnID = doc[0].TableInfo.Columns[1].ID
		column1.ColumnName = doc[0].TableInfo.Columns[1].Name
		assert.NoError(t, err)
		columns = append(columns, *column1)
		column2, err := convert.AssertValAs(entity.TableColumnTypeString, textValue)
		column2.ColumnID = doc[0].TableInfo.Columns[2].ID
		column2.ColumnName = doc[0].TableInfo.Columns[2].Name
		assert.NoError(t, err)
		columns = append(columns, *column2)
		column3, err := convert.AssertValAs(entity.TableColumnTypeNumber, floatValue)
		column3.ColumnID = doc[0].TableInfo.Columns[3].ID
		column3.ColumnName = doc[0].TableInfo.Columns[3].Name
		assert.NoError(t, err)
		columns = append(columns, *column3)
		slice := &entity.Slice{
			Info: common.Info{
				CreatorID: 999,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeTable,
					Table: &entity.SliceTable{
						Columns: columns,
					},
				},
			},
			KnowledgeID: 666,
			DocumentID:  doc[0].ID,
			Sequence:    0,
		}
		slice, err = svc.CreateSlice(ctx, slice)
		assert.NoError(t, err)
		assert.NotNil(t, slice)
		slice = &entity.Slice{
			Info: common.Info{
				CreatorID: 999,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeTable,
					Table: &entity.SliceTable{
						Columns: columns,
					},
				},
			},
			KnowledgeID: 666,
			DocumentID:  doc[0].ID,
			Sequence:    1,
		}
		slice, err = svc.CreateSlice(ctx, slice)
		assert.NoError(t, err)
		assert.NotNil(t, slice)
		slice = &entity.Slice{
			Info: common.Info{
				CreatorID: 999,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeTable,
					Table: &entity.SliceTable{
						Columns: columns,
					},
				},
			},
			KnowledgeID: 666,
			DocumentID:  doc[0].ID,
			Sequence:    1,
		}
		slice, err = svc.CreateSlice(ctx, slice)
		assert.NoError(t, err)
		assert.NotNil(t, slice)
		listResp, err := svc.ListSlice(ctx, &knowledge.ListSliceRequest{
			DocumentID:  doc[0].ID,
			KnowledgeID: kn.ID,
			Limit:       2,
			Offset:      2,
			Sequence:    2,
		})
		assert.NoError(t, err)
		assert.NotNil(t, listResp)
	})
	mockey.PatchConvey("test insert doc slice", t, func() {
		document := &entity.Document{
			Info: common.Info{
				Name:        "test11",
				Description: "test222",
				CreatorID:   666,
				SpaceID:     666,
				ProjectID:   888,
				IconURI:     "icon.png",
			},
			KnowledgeID:   666,
			Type:          entity.DocumentTypeText,
			URI:           "test.txt",
			FileExtension: "txt",
		}
		doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
		assert.NoError(t, err)
		assert.Equal(t, 1, len(doc))
		text := "test insert slice"
		slice := &entity.Slice{
			Info: common.Info{
				CreatorID: 999,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeText,
					Text: &text,
				},
			},
			DocumentID: doc[0].ID,
		}
		slice2 := &entity.Slice{
			Info: common.Info{
				CreatorID: 999,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeText,
					Text: &text,
				},
			},
			DocumentID: doc[0].ID,
		}
		slice3 := &entity.Slice{
			Info: common.Info{
				CreatorID: 999,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeText,
					Text: &text,
				},
			},
			DocumentID: doc[0].ID,
			Sequence:   2,
		}
		slice4 := &entity.Slice{
			Info: common.Info{
				CreatorID: 999,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeText,
					Text: &text,
				},
			},
			DocumentID: doc[0].ID,
			Sequence:   2,
		}
		slice, err = svc.CreateSlice(ctx, slice)
		assert.NoError(t, err)
		assert.NotNil(t, slice)
		slice2, err = svc.CreateSlice(ctx, slice2)
		assert.NoError(t, err)
		assert.NotNil(t, slice2)
		slice3, err = svc.CreateSlice(ctx, slice3)
		assert.NoError(t, err)
		assert.NotNil(t, slice3)
		slice4, err = svc.CreateSlice(ctx, slice4)
		assert.NoError(t, err)
		assert.NotNil(t, slice4)
	})
	mockey.PatchConvey("test insert doc slice invalid seq", t, func() {
		document := &entity.Document{
			Info: common.Info{
				Name:        "test11",
				Description: "test222",
				CreatorID:   666,
				SpaceID:     666,
				ProjectID:   888,
				IconURI:     "icon.png",
			},
			KnowledgeID:   666,
			Type:          entity.DocumentTypeText,
			URI:           "test.txt",
			FileExtension: "txt",
		}
		doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
		assert.NoError(t, err)
		assert.Equal(t, 1, len(doc))
		text := "test insert slice"
		slice := &entity.Slice{
			Info: common.Info{
				CreatorID: 999,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeText,
					Text: &text,
				},
			},
			DocumentID: doc[0].ID,
			Sequence:   66,
		}
		slice, err = svc.CreateSlice(ctx, slice)
		assert.Error(t, err, "the inserted slice position is illegal")
	})
}

func TestKnowledgeSVC_UpdateSlice(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	kn, err := svc.CreateKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{
			Name:      "test_update_text",
			CreatorID: 777,
			SpaceID:   666,
			ProjectID: 777,
		},
		Type:   entity.DocumentTypeText,
		Status: 0,
	})
	assert.NoError(t, err)
	assert.NotNil(t, kn)
	kn2, err := svc.CreateKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{
			Name:      "test_update_table",
			CreatorID: 777,
			SpaceID:   666,
			ProjectID: 777,
		},
		Type:   entity.DocumentTypeTable,
		Status: 0,
	})
	assert.NoError(t, err)
	assert.NotNil(t, kn2)
	document := &entity.Document{
		Info: common.Info{
			Name:        "test_txt_doc",
			Description: "test222",
			CreatorID:   666,
			SpaceID:     666,
			ProjectID:   888,
			IconURI:     "icon.png",
		},
		KnowledgeID:   kn.ID,
		Type:          entity.DocumentTypeText,
		URI:           "test.txt",
		FileExtension: "txt",
	}
	doc1, err := svc.CreateDocument(ctx, []*entity.Document{document})
	assert.NoError(t, err)
	assert.NotNil(t, doc1)
	document2 := &entity.Document{
		Info: common.Info{
			Name:        "testtable",
			Description: "test222",
			CreatorID:   666,
			SpaceID:     666,
			ProjectID:   888,
			IconURI:     "icon.png",
		},
		KnowledgeID:   666,
		Type:          entity.DocumentTypeTable,
		URI:           "test.xlsx",
		FileExtension: "xlsx",
		TableInfo: entity.TableInfo{
			VirtualTableName: "test",
			Columns: []*entity.TableColumn{
				{
					Name:     "第一列",
					Type:     entity.TableColumnTypeBoolean,
					Indexing: true,
					Sequence: 0,
				},
				{
					Name:     "第二列",
					Type:     entity.TableColumnTypeTime,
					Indexing: false,
					Sequence: 1,
				},
				{
					Name:     "第三列",
					Type:     entity.TableColumnTypeString,
					Indexing: false,
					Sequence: 2,
				},
				{
					Name:     "第四列",
					Type:     entity.TableColumnTypeNumber,
					Indexing: true,
					Sequence: 3,
				},
			},
		},
	}
	doc2, err := svc.CreateDocument(ctx, []*entity.Document{document2})
	assert.NoError(t, err)
	assert.Equal(t, 1, len(doc2))
	slice1 := entity.Slice{
		Info:        common.Info{},
		KnowledgeID: kn.ID,
		DocumentID:  doc1[0].ID,
		Sequence:    0,
		RawContent: []*entity.SliceContent{
			{
				Type: entity.SliceContentTypeText,
				Text: ptr.Of("test update"),
			},
		}}
	sliceEntity, err := svc.CreateSlice(ctx, &slice1)
	assert.NoError(t, err)
	assert.NotNil(t, sliceEntity)
	boolValue := "true"
	timeValue := "2022-01-02 15:04:05"
	textValue := "text"
	floatValue := "1.1"
	columns := make([]entity.TableColumnData, 0)
	column0, err := convert.AssertValAs(entity.TableColumnTypeBoolean, boolValue)
	column0.ColumnID = doc2[0].TableInfo.Columns[0].ID
	column0.ColumnName = doc2[0].TableInfo.Columns[0].Name
	assert.NoError(t, err)
	columns = append(columns, *column0)
	column1, err := convert.AssertValAs(entity.TableColumnTypeTime, timeValue)
	column1.ColumnID = doc2[0].TableInfo.Columns[1].ID
	column1.ColumnName = doc2[0].TableInfo.Columns[1].Name
	assert.NoError(t, err)
	columns = append(columns, *column1)
	column2, err := convert.AssertValAs(entity.TableColumnTypeString, textValue)
	column2.ColumnID = doc2[0].TableInfo.Columns[2].ID
	column2.ColumnName = doc2[0].TableInfo.Columns[2].Name
	assert.NoError(t, err)
	columns = append(columns, *column2)
	column3, err := convert.AssertValAs(entity.TableColumnTypeNumber, floatValue)
	column3.ColumnID = doc2[0].TableInfo.Columns[3].ID
	column3.ColumnName = doc2[0].TableInfo.Columns[3].Name
	assert.NoError(t, err)
	columns = append(columns, *column3)
	slice := &entity.Slice{
		Info: common.Info{},
		RawContent: []*entity.SliceContent{
			{
				Type: entity.SliceContentTypeTable,
				Table: &entity.SliceTable{
					Columns: columns,
				},
			},
		},
		KnowledgeID: kn2.ID,
		DocumentID:  doc2[0].ID,
		Sequence:    0,
	}
	sliceEntity2, err := svc.CreateSlice(ctx, slice)
	assert.NoError(t, err)
	assert.NotNil(t, slice)
	mockey.PatchConvey("test update slice", t, func() {
		text := "changed text"
		sliceEntity := entity.Slice{
			Info: common.Info{
				ID: sliceEntity.ID,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeText,
					Text: &text,
				},
			},
		}
		slice, err := svc.UpdateSlice(ctx, &sliceEntity)
		assert.NoError(t, err)
		assert.NotNil(t, slice)
	})
	mockey.PatchConvey("test update table slice", t, func() {
		boolValue := "0"
		timeValue := "2025-01-02 15:04:05"
		textValue := "gogogo"
		floatValue := "6.6"
		listResp, err := svc.ListDocument(ctx, &knowledge.ListDocumentRequest{
			DocumentIDs: []int64{doc2[0].ID},
		})
		doc := listResp.Documents
		assert.NoError(t, err)
		columns := make([]entity.TableColumnData, 0)
		column0, err := convert.AssertValAs(entity.TableColumnTypeBoolean, boolValue)
		column0.ColumnID = doc[0].TableInfo.Columns[0].ID
		column0.ColumnName = doc[0].TableInfo.Columns[0].Name
		assert.NoError(t, err)
		columns = append(columns, *column0)
		column1, err := convert.AssertValAs(entity.TableColumnTypeTime, timeValue)
		column1.ColumnID = doc[0].TableInfo.Columns[1].ID
		column1.ColumnName = doc[0].TableInfo.Columns[1].Name
		assert.NoError(t, err)
		columns = append(columns, *column1)
		column2, err := convert.AssertValAs(entity.TableColumnTypeString, textValue)
		column2.ColumnID = doc[0].TableInfo.Columns[2].ID
		column2.ColumnName = doc[0].TableInfo.Columns[2].Name
		assert.NoError(t, err)
		columns = append(columns, *column2)
		column3, err := convert.AssertValAs(entity.TableColumnTypeNumber, floatValue)
		column3.ColumnID = doc[0].TableInfo.Columns[3].ID
		column3.ColumnName = doc[0].TableInfo.Columns[3].Name
		assert.NoError(t, err)
		columns = append(columns, *column3)
		slice := &entity.Slice{
			Info: common.Info{
				ID:        sliceEntity2.ID,
				CreatorID: 999,
			},
			RawContent: []*entity.SliceContent{
				{
					Type: entity.SliceContentTypeTable,
					Table: &entity.SliceTable{
						Columns: columns,
					},
				},
			},
			KnowledgeID: 666,
			DocumentID:  doc[0].ID,
			Sequence:    0,
		}
		slice, err = svc.UpdateSlice(ctx, slice)
		assert.NoError(t, err)
		assert.NotNil(t, slice)
	})
}

func TestKnowledgeSVC_ListSlice(t *testing.T) {
	//ctx := context.Background()
	//svc := MockKnowledgeSVC(t)
	//
	//mockey.PatchConvey("test list doc slice", t, func() {
	//	listResp, err := svc.ListSlice(ctx, &knowledge.ListSliceRequest{
	//		DocumentID:  1745996179184000000,
	//		KnowledgeID: 777,
	//		Limit:       2,
	//	})
	//	assert.NoError(t, err)
	//	assert.NotNil(t, listResp)
	//})
	//mockey.PatchConvey("test limit and offset", t, func() {
	//	listResp, err := svc.ListSlice(ctx, &knowledge.ListSliceRequest{
	//		DocumentID:  1745996179184000000,
	//		KnowledgeID: 777,
	//		Limit:       2,
	//		Offset:      2,
	//		Sequence:    2,
	//	})
	//	assert.NoError(t, err)
	//	assert.NotNil(t, listResp)
	//})
	//mockey.PatchConvey("test doc slice", t, func() {
	//	listResp, err := svc.ListSlice(ctx, &knowledge.ListSliceRequest{
	//		DocumentID:  1746511754630560000,
	//		KnowledgeID: 1745810102455734000,
	//		Limit:       2,
	//		Offset:      1,
	//		Sequence:    1,
	//	})
	//	assert.NoError(t, err)
	//	assert.NotNil(t, listResp)
	//})
}

func TestKnowledgeSVC_Retrieve(t *testing.T) {
	//ctx := context.Background()
	//svc := MockKnowledgeSVC(t)
	//mockey.PatchConvey("test retrieve", t, func() {
	//	res, err := svc.Retrieve(ctx, &knowledge.RetrieveRequest{
	//		Query:        "查找第三列为gogogo的数据",
	//		KnowledgeIDs: []int64{1745810102455734000, 1745810094197395000},
	//		Strategy: &entity.RetrievalStrategy{
	//			TopK:               ptr.Of(int64(2)),
	//			MinScore:           ptr.Of(0.5),
	//			MaxTokens:          ptr.Of(int64(1000)),
	//			SelectType:         entity.SelectTypeAuto,
	//			SearchType:         entity.SearchTypeHybrid,
	//			EnableQueryRewrite: true,
	//			EnableNL2SQL:       true,
	//			EnableRerank:       true,
	//		},
	//	})
	//	assert.NoError(t, err)
	//	assert.NotNil(t, res)
	//})
}
