package service

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/bytedance/mockey"
	"github.com/bytedance/sonic"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/service"
	producer_mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/eventbus"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	orm_mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/orm"
	storage_mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/storage"
)

func MockKnowledgeSVC(t *testing.T) knowledge.Knowledge {
	os.Setenv("MYSQL_DSN", "coze:coze123@(localhost:3306)/opencoze?charset=utf8mb4&parseTime=True")
	// db, err := mysql.New()
	mockDB := orm_mock.NewMockDB()
	mockDB.AddTable(&model.Knowledge{}).AddRows(&model.Knowledge{ID: 1745762848936250000})
	mockDB.AddTable(&model.KnowledgeDocument{})
	mockDB.AddTable(&model.KnowledgeDocumentSlice{})
	db, err := mockDB.DB()

	assert.NoError(t, err)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mockIDGen := mock.NewMockIDGenerator(ctrl)
	mockIDGen.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()
	mockIDGen.EXPECT().GenMultiIDs(gomock.Any(), 1).Return([]int64{time.Now().UnixNano()}, nil).AnyTimes()
	mockIDGen.EXPECT().GenMultiIDs(gomock.Any(), 5).Return([]int64{time.Now().UnixNano(), time.Now().UnixNano() + 1, time.Now().UnixNano() + 2, time.Now().UnixNano() + 3, time.Now().UnixNano() + 4}, nil).AnyTimes()
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

	_, err := svc.DeleteKnowledge(ctx, &entity.Knowledge{
		Info: common.Info{
			ID: 1745762848936250000,
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
	//mockey.PatchConvey("test table doc", t, func() {
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
	//	assert.NotNil(t, doc)
	//})
	mockey.PatchConvey("test table custom append", t, func() {
		row := map[string]string{
			"col1": "11",
			"col2": "22",
		}
		rows := []map[string]string{row}
		data, err := sonic.Marshal(rows)
		assert.NoError(t, err)
		document := &entity.Document{
			Info: common.Info{
				ID:          4444,
				Name:        "testtable_custom",
				Description: "test222",
				CreatorID:   666,
				SpaceID:     666,
				ProjectID:   888,
				IconURI:     "icon.png",
			},
			Source:      entity.DocumentSourceCustom,
			RawContent:  string(data),
			KnowledgeID: 666,
			Type:        entity.DocumentTypeTable,
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
			IsAppend: true,
		}
		doc, err := svc.CreateDocument(ctx, []*entity.Document{document})
		assert.NoError(t, err)
		assert.NotNil(t, doc)
	})
}
