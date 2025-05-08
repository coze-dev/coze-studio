package run

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/conversation/run/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run/internal/model"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/orm"
)

func TestAgentRun(t *testing.T) {
	ctx := context.Background()

	// mockDB, err := mysql.New()
	// assert.Nil(t, err)
	// cacheCli := redis.New()
	//
	// idGen, err := idgen.New(cacheCli)
	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	// idGen.EXPECT().GenMultiIDs(gomock.Any(), 2).Return([]int64{10, 11}, nil).Times(2)
	idGen.EXPECT().GenID(gomock.Any()).Return(int64(12), nil).Times(1)

	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.RunRecord{})
	mockDB, err := mockDBGen.DB()

	assert.NoError(t, err)
	components := &Components{
		DB:    mockDB,
		IDGen: idGen,
	}

	imageInput := &entity.FileData{
		Url:  "https://xxxxx.xxxx/image",
		Name: "test_img",
	}
	fileInput := &entity.FileData{
		Url:  "https://xxxxx.xxxx/file",
		Name: "test_file",
	}
	content := []*entity.InputMetaData{
		{
			Type: entity.InputTypeText,
			Text: "你是谁",
		},
		{
			Type: entity.InputTypeImage,
			FileData: []*entity.FileData{
				imageInput,
			},
		},
		{
			Type: entity.InputTypeFile,
			FileData: []*entity.FileData{
				fileInput,
			},
		},
	}
	stream, err := NewService(components).AgentRun(ctx, &entity.AgentRunRequest{
		ConversationID: 7496795464885338112,
		SpaceID:        666,
		SectionID:      7496795464897921024,
		UserID:         888,
		AgentID:        7501996002144944128,
		Content:        content,
		ContentType:    entity.ContentTypeMulti,
	})

	t.Logf("------------stream: %+v; err:%v", stream, err)

	for {
		chunk, errRecv := stream.Recv()
		jsonStr, _ := json.Marshal(chunk)
		fmt.Println(string(jsonStr))
		if errRecv == io.EOF || chunk == nil || chunk.Event == entity.RunEventStreamDone {
			break
		}
		if errRecv != nil {
			assert.NoError(t, errRecv)
			break
		}
	}

}
