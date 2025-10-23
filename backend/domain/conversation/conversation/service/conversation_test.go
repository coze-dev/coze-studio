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

package conversation

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	conversation "github.com/coze-dev/coze-studio/backend/crossdomain/conversation/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/repository"
	mock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/internal/mock/infra/orm"
)

// Test_NewListMessage tests the NewListMessage function
func TestCreateConversation(t *testing.T) {
	ctx := context.Background()

	// mockDB, _ := mysql.New()
	// redisCli := redis.New()
	// idGen, err := idgen.New(redisCli)

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenMultiIDs(gomock.Any(), 2).Return([]int64{
		1, 2,
	}, nil).AnyTimes()

	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Conversation{})
	mockDB, err := mockDBGen.DB()

	components := &Components{
		ConversationRepo: repository.NewConversationRepo(mockDB, idGen),
	}

	createData, err := NewService(components).Create(ctx, &entity.CreateMeta{
		AgentID:     100000,
		UserID:      222222,
		ConnectorID: 100001,
		Scene:       common.Scene_Playground,
		Ext:         "debug ext9999",
	})
	assert.NotNil(t, createData)

	t.Logf("create conversation result: %v; err:%v", createData, err)
	assert.Nil(t, err)
	assert.Equal(t, "debug ext9999", createData.Ext)
}

func TestGetById(t *testing.T) {
	ctx := context.Background()

	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Conversation{})

	mockDBGen.AddTable(&model.Conversation{}).
		AddRows(
			&model.Conversation{
				ID:          7494574457319587840,
				AgentID:     8888,
				SectionID:   100001,
				ConnectorID: 100001,
				CreatorID:   1111,
				Ext:         "debug ext1111",
			},
		)

	mockDB, err := mockDBGen.DB()
	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).Return(time.Now().UnixMilli(), nil).AnyTimes()

	components := &Components{
		ConversationRepo: repository.NewConversationRepo(mockDB, idGen),
	}

	cd, err := NewService(components).GetByID(ctx, 7494574457319587840)
	assert.NoError(t, err)

	t.Logf("conversation result: %v; err:%v", cd, err)

	assert.Equal(t, "debug ext1111", cd.Ext)
}

func TestNewConversationCtx(t *testing.T) {
	ctx := context.Background()
	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).Return(int64(123456), nil).Times(1)
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Conversation{})
	mockDBGen.AddTable(&model.Conversation{}).
		AddRows(
			&model.Conversation{
				ID:          7494574457319587840,
				AgentID:     8888,
				SectionID:   100001,
				ConnectorID: 100001,
				CreatorID:   1111,
			},
		)
	mockDB, err := mockDBGen.DB()

	assert.Nil(t, err)
	components := &Components{
		ConversationRepo: repository.NewConversationRepo(mockDB, idGen),
	}
	res, err := NewService(components).NewConversationCtx(ctx, &entity.NewConversationCtxRequest{
		ID: 7494574457319587840,
	})

	t.Logf("conversation result: %v; err:%v", res, err)
	assert.Equal(t, int64(123456), res.SectionID)
}

func TestConversationImpl_Delete(t *testing.T) {
	ctx := context.Background()
	mockDBGen := orm.NewMockDB()
	mockDBGen.AddTable(&model.Conversation{})
	mockDBGen.AddTable(&model.Conversation{}).
		AddRows(
			&model.Conversation{
				ID:          7494574457319587840,
				AgentID:     9999,
				SectionID:   100001,
				ConnectorID: 100001,
				CreatorID:   1111,
				Status:      int32(conversation.ConversationStatusNormal),
			},
		)

	mockDB, err := mockDBGen.DB()
	assert.Nil(t, err)
	components := &Components{
		ConversationRepo: repository.NewConversationRepo(mockDB, nil),
	}
	err = NewService(components).Delete(ctx, 7494574457319587840)
	t.Logf("delete err:%v", err)
	assert.Nil(t, err)

	currentConversation, err := NewService(components).GetByID(ctx, 7494574457319587840)

	assert.NotNil(t, currentConversation)

	t.Logf("conversation result: %v; err:%v", currentConversation, err)
	assert.Nil(t, err)

	assert.Equal(t, conversation.ConversationStatusDeleted, currentConversation.Status)
}
