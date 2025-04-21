package run

import (
	"context"
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
	//mockDB, err := mysql.New()
	//
	//cacheCli := redis.New()
	//
	//idGenSVC, err := idgen.New(cacheCli)

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).Return(int64(10), nil).Times(1)

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
			Text: "解析图片中的内容",
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
		ChatMessage: &entity.ChatMessage{
			ConversationID: 7494873769631023104,
			SpaceID:        1,
			SectionID:      7494873769631039488,
			UserID:         222222,
			AgentID:        888,
			Content:        content,
			ContentType:    entity.ContentTypeMulti,
		},
	})

	t.Logf("------------stream: %+v; err:%v", stream, err)
	for {
		chunk, errRecv := stream.Recv()

		if errRecv == io.EOF || chunk == nil || chunk.Event == entity.RunEventStreamDone {
			break
		}
		if errRecv != nil {
			assert.NoError(t, errRecv)
			break
		}

		t.Logf("--------chunk_event--------%+v", chunk.Event)
		t.Logf("--------chunk_runRecord--------%+v", chunk.RunRecordItem)
		t.Logf("--------chunk_message--------%+v", chunk.MessageItem)
	}

}
