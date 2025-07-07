package service

import (
	"context"
	"testing"

	"github.com/bytedance/mockey"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	storageMock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/contract/storage"
)

func TestSubmitWebUrlTask(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	mockey.PatchConvey("web url empty", t, func() {
		_, err := svc.SubmitWebUrlTask(ctx, &SubmitWebUrlTaskRequest{
			Source: entity.DocumentSourceWeb,
			URLs:   []string{},
		})
		assert.Contains(t, err.Error(), "urls is empty")
	})

	mockey.PatchConvey("web url success", t, func() {
		resp, err := svc.SubmitWebUrlTask(ctx, &SubmitWebUrlTaskRequest{
			Source: entity.DocumentSourceWeb,
			URLs:   []string{"https://www.example.com"},
		})
		assert.Nil(t, err)
		assert.NotEqual(t, resp.TaskIDs, []int64{})
	})

}

func TestGetWebUrlInfo(t *testing.T) {
	ctx := context.Background()
	svc := MockKnowledgeSVC(t)
	mockey.PatchConvey("get web url info", t, func() {
		resp, err := svc.SubmitWebUrlTask(ctx, &SubmitWebUrlTaskRequest{
			Source: entity.DocumentSourceWeb,
			URLs:   []string{"https://www.example.com"},
		})
		assert.Nil(t, err)
		assert.NotEqual(t, resp.TaskIDs, []int64{})

		info, err := svc.GetWebUrlInfo(ctx, &GetWebUrlInfoRequest{TaskIDs: resp.TaskIDs})
		assert.Nil(t, err)
		assert.NotNil(t, info)
		assert.NotNil(t, info.Tasks)
		assert.Equal(t, len(info.Tasks), 1)
		for _, v := range info.Tasks {
			assert.Equal(t, v.Status, entity.WebCrawlTaskStatusInit)
		}
	})
}

func TestFetchTableDataFromWebUrl(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	mockStorage := storageMock.NewMockStorage(ctrl)
	mockStorage.EXPECT().GetObjectUrl(gomock.Any(), gomock.Any()).Return("URL_ADDRESS", nil).AnyTimes()
	mockStorage.EXPECT().GetObject(gomock.Any(), gomock.Any()).Return([]byte("test text"), nil).AnyTimes()
	mockStorage.EXPECT().PutObject(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).AnyTimes()
	svc := &knowledgeSVC{storage: mockStorage}
	mockey.PatchConvey("invalid url", t, func() {
		_, err := svc.fetchTableDataFromWebUrl(ctx, &fecthRequest{URL: "666"})
		assert.Contains(t, err.Error(), "invalid url")
	})
	mockey.PatchConvey("fetch table data from web url", t, func() {
		resp, err := svc.fetchTableDataFromWebUrl(ctx, &fecthRequest{URL: "https://www.example.com"})
		assert.Nil(t, err)
		assert.NotNil(t, resp)
	})

	mockey.PatchConvey("fetch unreachable url", t, func() {
		_, err := svc.fetchTableDataFromWebUrl(ctx, &fecthRequest{URL: "https://www.unreachable.com"})
		assert.NotNil(t, err)
		assert.Contains(t, err.Error(), "do request failed")
	})
}
