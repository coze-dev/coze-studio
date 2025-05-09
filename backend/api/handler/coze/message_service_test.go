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
	"code.byted.org/flow/opencoze/backend/api/model/conversation/message"
	"code.byted.org/flow/opencoze/backend/application"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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
