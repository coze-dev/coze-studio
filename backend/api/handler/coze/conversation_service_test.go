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

	"code.byted.org/flow/opencoze/backend/api/model/conversation/common"
	"code.byted.org/flow/opencoze/backend/api/model/conversation/conversation"
	"code.byted.org/flow/opencoze/backend/application"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestClearConversationCtx(t *testing.T) {
	h := server.Default()
	err := application.Init(context.Background())

	t.Logf("application init err: %v", err)
	h.POST("/api/conversation/create_section", ClearConversationCtx)

	req := &conversation.ClearConversationCtxRequest{
		ConversationID: "7496790123757961216",
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
		ConversationID: "7496795180809322496",
		Scene:          ptr.Of(common.Scene_Playground),
		BotID:          ptr.Of("7366055842027922437"),
	}
	m, err := sonic.Marshal(req)
	assert.Nil(t, err)
	w := ut.PerformRequest(h.Engine, "POST", "/api/conversation/clear_message", &ut.Body{Body: bytes.NewBuffer(m), Len: len(m)}, ut.Header{Key: "Content-Type", Value: "application/json"})
	res := w.Result()
	t.Logf("clear conversation history: %s", res.Body())
	assert.Equal(t, http.StatusInternalServerError, res.StatusCode())

}
