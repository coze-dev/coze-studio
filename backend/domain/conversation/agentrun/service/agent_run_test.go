/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package agentrun

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/repository"
	mock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/internal/mock/infra/orm"
)

func TestAgentRun(t *testing.T) {
	// ctx := context.Background()
	//
	// mockDB, err := mysql.New()
	// assert.Nil(t, err)
	// cacheCli := redis.New()
	//
	// idGen, err := idgen.New(cacheCli)
	// ctrl := gomock.NewController(t)
	// idGen := mock.NewMockIDGenerator(ctrl)
	// // idGen.EXPECT().GenMultiIDs(gomock.Any(), 2).Return([]int64{time.Now().UnixMilli(), time.Now().Add(time.Second).UnixMilli()}, nil).AnyTimes()
	// idGen.EXPECT().GenID(gomock.Any()).Return(int64(time.Now().UnixMilli()), nil).AnyTimes()
	//
	// mockDBGen := orm.NewMockDB()
	// mockDBGen.AddTable(&model.RunRecord{})
	// mockDB, err := mockDBGen.DB()
	//
	// assert.NoError(t, err)
	// components := &Components{
	// 	DB:    mockDB,
	// 	IDGen: idGen,
	// }
	//
	// imageInput := &entity.FileData{
	// 	Url:  "https://xxxxx.xxxx/image",
	// 	Name: "test_img",
	// }
	// fileInput := &entity.FileData{
	// 	Url:  "https://xxxxx.xxxx/file",
	// 	Name: "test_file",
	// }
	// content := []*entity.InputMetaData{
	// 	{
	// 		Type: entity.InputTypeText,
	// 		Text: "Who are you",
	// 	},
	// 	{
	// 		Type: entity.InputTypeImage,
	// 		FileData: []*entity.FileData{
	// 			imageInput,
	// 		},
	// 	},
	// 	{
	// 		Type: entity.InputTypeFile,
	// 		FileData: []*entity.FileData{
	// 			fileInput,
	// 		},
	// 	},
	// }
	// stream, err := NewService(components, nil).AgentRun(ctx, &entity.AgentRunMeta{
	// 	ConversationID: 7503546991712960512,
	// 	SpaceID:        666,
	// 	SectionID:      7503546991712976896,
	// 	UserID:         888,
	// 	AgentID:        7501996002144944128,
	// 	Content:        content,
	// 	ContentType:    entity.ContentTypeMulti,
	// })
	// assert.NoError(t, err)
	// t.Logf("------------stream: %+v; err:%v", stream, err)
	//
	// for {
	// 	chunk, errRecv := stream.Recv()
	// 	jsonStr, _ := json.Marshal(chunk)
	// 	fmt.Println(string(jsonStr))
	// 	if errRecv == io.EOF || chunk == nil || chunk.Event == entity.RunEventStreamDone {
	// 		break
	// 	}
	// 	if errRecv != nil {
	// 		assert.NoError(t, errRecv)
	// 		break
	// 	}
	// }

	// assert.NoError(t, err)

}

func TestRunImpl_List(t *testing.T) {
	ctx := context.Background()
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.RunRecord{}).AddRows(
		&model.RunRecord{
			ID:             1,
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			UserID:         "123456",
			CreatedAt:      time.Now().Unix(),
		},
		&model.RunRecord{
			ID:             2,
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			UserID:         "123456",
			CreatedAt:      time.Now().Unix() + 1,
		}, &model.RunRecord{
			ID:             3,
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			UserID:         "123456",
			CreatedAt:      time.Now().Unix() + 2,
		}, &model.RunRecord{
			ID:             4,
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			UserID:         "123456",
			CreatedAt:      time.Now().Unix() + 3,
		}, &model.RunRecord{
			ID:             5,
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			UserID:         "123456",
			CreatedAt:      time.Now().Unix() + 4,
		},
		&model.RunRecord{
			ID:             6,
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			UserID:         "123456",
			CreatedAt:      time.Now().Unix() + 5,
		}, &model.RunRecord{
			ID:             7,
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			UserID:         "123456",
			CreatedAt:      time.Now().Unix() + 6,
		}, &model.RunRecord{
			ID:             8,
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			UserID:         "123456",
			CreatedAt:      time.Now().Unix() + 7,
		}, &model.RunRecord{
			ID:             9,
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			UserID:         "123456",
			CreatedAt:      time.Now().Unix() + 8,
		},
	)
	mockDB, err := mockDBGen.DB()
	assert.NoError(t, err)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mockIDGen := mock.NewMockIDGenerator(ctrl)

	runRecordRepo := repository.NewRunRecordRepo(mockDB, mockIDGen)

	service := &runImpl{
		Components: Components{
			RunRecordRepo: runRecordRepo,
		},
	}

	t.Run("list success", func(t *testing.T) {

		meta := &entity.ListRunRecordMeta{
			ConversationID: 123,
			AgentID:        456,
			SectionID:      789,
			Limit:          10,
			OrderBy:        "desc",
		}

		result, err := service.List(ctx, meta)
		// check result
		assert.NoError(t, err)
		assert.Len(t, result, 9)
		assert.Equal(t, int64(123), result[0].ConversationID)
		assert.Equal(t, int64(456), result[0].AgentID)
	})

	t.Run("empty list", func(t *testing.T) {
		meta := &entity.ListRunRecordMeta{
			ConversationID: 999, //
			Limit:          10,
			OrderBy:        "desc",
		}

		// check result
		result, err := service.List(ctx, meta)
		assert.NoError(t, err)
		assert.Empty(t, result)
	})

	t.Run("search with before id", func(t *testing.T) {

		meta := &entity.ListRunRecordMeta{
			ConversationID: 123,
			SectionID:      789,
			AgentID:        456,
			BeforeID:       5,
			Limit:          3,
			OrderBy:        "desc",
		}

		result, err := service.List(ctx, meta)

		// check result
		assert.NoError(t, err)
		assert.Len(t, result, 3)
		assert.Equal(t, int64(4), result[0].ID)
	})
	t.Run("search with after id and limit", func(t *testing.T) {

		meta := &entity.ListRunRecordMeta{
			ConversationID: 123,
			SectionID:      789,
			AgentID:        456,
			AfterID:        5,
			Limit:          3,
			OrderBy:        "desc",
		}

		result, err := service.List(ctx, meta)

		// check result
		assert.NoError(t, err)
		assert.Len(t, result, 3)
		assert.Equal(t, int64(9), result[0].ID)

	})
}
