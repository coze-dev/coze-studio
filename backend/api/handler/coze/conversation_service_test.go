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

	"code.byted.org/middleware/hertz/pkg/app/server"
	"code.byted.org/middleware/hertz/pkg/common/ut"
	"github.com/bytedance/sonic"
	"github.com/stretchr/testify/assert"

	"code.byted.org/data_edc/workflow_engine_next/api/model/conversation/common"
	"code.byted.org/data_edc/workflow_engine_next/api/model/conversation/conversation"
	"code.byted.org/data_edc/workflow_engine_next/application"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/ptr"
)

func TestClearConversationCtx(t *testing.T) {
	h := server.Default()
	err := application.Init(context.Background())

	t.Logf("application init err: %v", err)
	h.POST("/api/conversation/create_section", ClearConversationCtx)

	req := &conversation.ClearConversationCtxRequest{
		ConversationID: 7496795464885338112,
		Scene:          ptr.Of(common.Scene_Playground),
	}
	m, err := sonic.Marshal(req)
	assert.Nil(t, err)

	w := ut.PerformRequest(h.Engine, "POST", "/api/conversation/create_section", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	t.Logf("clear conversation ctx: %s", res.Body())
	assert.Equal(t, http.StatusInternalServerError, res.StatusCode())
}

func TestClearConversationHistory(t *testing.T) {
	h := server.Default()
	err := application.Init(context.Background())
	t.Logf("application init err: %v", err)
	h.POST("/api/conversation/clear_message", ClearConversationHistory)
	req := &conversation.ClearConversationHistoryRequest{
		ConversationID: 7496795464885338113,
		Scene:          ptr.Of(common.Scene_Playground),
		BotID:          ptr.Of(int64(7366055842027922437)),
	}
	m, err := sonic.Marshal(req)
	assert.Nil(t, err)
	w := ut.PerformRequest(h.Engine, "POST", "/api/conversation/clear_message", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	t.Logf("clear conversation history: %s", res.Body())
	assert.Equal(t, http.StatusInternalServerError, res.StatusCode())
}
