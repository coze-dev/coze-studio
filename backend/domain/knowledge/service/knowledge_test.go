package service

import (
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	storage_mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/storage"
	"context"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"os"
	"testing"
	"time"
)

func MockKnowledgeSVC(t *testing.T) knowledge.Knowledge {
	os.Setenv("MYSQL_DSN", "coze:coze123@(localhost:3306)/opencoze?charset=utf8mb4&parseTime=True")
	db, err := mysql.New()
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mockIDGen := mock.NewMockIDGenerator(ctrl)
	mockIDGen.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixNano(), nil).AnyTimes()
	assert.NoError(t, err)
	mockStorage := storage_mock.NewMockStorage(ctrl)
	mockStorage.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any()).Return("URL_ADDRESS", nil).AnyTimes()
	svc, _ := NewKnowledgeSVC(&KnowledgeSVCConfig{
		DB:      db,
		IDGen:   mockIDGen,
		Storage: mockStorage,
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

func TestKnowledgeSVC_ListKnowledge(t *testing.T) {
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
	assert.Equal(t, 0, total)
	kns, total, err = svc.MGetKnowledge(ctx, &knowledge.MGetKnowledgeRequest{})

}
