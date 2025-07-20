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

package coze

import (
	"bytes"
	"context"
	"net/http"
	"testing"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/conversation/message"
	"github.com/coze-dev/coze-studio/backend/application"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestGetMessageList(t *testing.T) {
	h := server.Default()
	err := application.Init(context.Background())

	t.Logf("application init err: %v", err)

	h.POST("/api/conversation/get_message_list", GetMessageList)
	req := &message.GetMessageListRequest{
		BotID:          "7366055842027922437",
		Scene:          ptr.Of(common.Scene_Playground),
		ConversationID: "7496795464885338112",
		Count:          10,
		Cursor:         "1746534530268",
	}
	m, err := sonic.Marshal(req)
	assert.Nil(t, err)
	w := ut.PerformRequest(h.Engine, "POST", "/api/conversation/get_message_list", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	t.Logf("get message list: %s", res.Body())

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}
