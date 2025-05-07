package service

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/bytedance/mockey"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/service"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
	producer_mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/eventbus"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	storage_mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/storage"
)

func MockKnowledgeSVC(t *testing.T) knowledge.Knowledge {
	os.Setenv("MYSQL_DSN", `root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local`)
	db, err := mysql.New()
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
	baseID := time.Now().UnixNano()
	mockIDGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(ctx context.Context) (int64, error) {
		id := baseID
		baseID++
		return id, nil
	}).AnyTimes()

	mockIDGen.EXPECT().GenMultiIDs(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, count int) ([]int64, error) {
		ids := make([]int64, count)
		for i := 0; i < count; i++ {
			ids[i] = baseID
			baseID++
		}
		return ids, nil
	}).AnyTimes()
	producer := producer_mock.NewMockProducer(ctrl)
	producer.EXPECT().Send(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()
	mockStorage := storage_mock.NewMockStorage(ctrl)
	mockStorage.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any()).Return("URL_ADDRESS", nil).AnyTimes()
	mockStorage.EXPECT().GetObject(gomock.Any(), gomock.Any()).Return([]byte("test text"), nil).AnyTimes()
	mockStorage.EXPECT().PutObject(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()
	rdb := service.NewService(db, mockIDGen)
	svc, _ := NewKnowledgeSVC(&KnowledgeSVCConfig{
		DB:           db,
		IDGen:        mockIDGen,
		Storage:      mockStorage,
		Producer:     producer,
		SearchStores: nil,
		RDB:          rdb,
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
	//mockey.PatchConvey("test txt loacl doc", t, func() {
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

//func TestKnowledgeSVC_UpdateDocument(t *testing.T) {
//	ctx := context.Background()
//	svc := MockKnowledgeSVC(t)
//	document := &entity.Document{
//		Info: common.Info{
//			Name:        "testtable",
//			Description: "test222",
//			CreatorID:   666,
//			SpaceID:     666,
//			ProjectID:   888,
//			IconURI:     "icon.png",
//		},
//		KnowledgeID:   666,
//		Type:          entity.DocumentTypeTable,
//		URI:           "test.xlsx",
//		FileExtension: "xlsx",
//		TableInfo: entity.TableInfo{
//			VirtualTableName: "test",
//			Columns: []*entity.TableColumn{
//				{
//					Name:     "第一列",
//					Type:     entity.TableColumnTypeBoolean,
//					Indexing: true,
//					Sequence: 0,
//				},
//				{
//					Name:     "第二列",
//					Type:     entity.TableColumnTypeTime,
//					Indexing: false,
//					Sequence: 1,
//				},
//				{
//					Name:     "第三列",
//					Type:     entity.TableColumnTypeString,
//					Indexing: false,
//					Sequence: 2,
//				},
//				{
//					Name:     "第四列",
//					Type:     entity.TableColumnTypeNumber,
//					Indexing: true,
//					Sequence: 3,
//				},
//			},
//		},
//	}
//	doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
//	assert.NoError(t, err)
//	assert.Equal(t, 1, len(doc))
//	doc[0].Name = "new_name"
//	doc[0].TableInfo.Columns[0].Name = "第一列_changeName"
//	doc[0].TableInfo.Columns[1].Name = "第二列_changeSeq"
//	doc[0].TableInfo.Columns[1].Sequence = 2
//	doc[0].TableInfo.Columns[2].Name = "第三列_changeType"
//	doc[0].TableInfo.Columns[2].Type = entity.TableColumnTypeInteger
//	doc[0].TableInfo.Columns[2].Sequence = 1
//	// 删除原来的第四列并新建第四列
//	doc[0].TableInfo.Columns[3].Name = "第五列_create"
//	doc[0].TableInfo.Columns[3].Type = entity.TableColumnTypeNumber
//	doc[0].TableInfo.Columns[3].Sequence = 3
//	doc[0].TableInfo.Columns[3].ID = 0
//	doc[0].TableInfo.Columns[3].Indexing = true
//	document, err = svc.UpdateDocument(ctx, doc[0])
//	assert.NoError(t, err)
//	assert.NotNil(t, document)
//}

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
