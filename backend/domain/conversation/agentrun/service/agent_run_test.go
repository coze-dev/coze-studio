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
	"testing"
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
