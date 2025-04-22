package coze

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"code.byted.org/flow/opencoze/backend/api/model/conversation_conversation"
	"code.byted.org/flow/opencoze/backend/api/model/conversation_message"
)

// GetMessageList .
// @router /api/conversation/get_message_list [POST]
func GetMessageList(ctx context.Context, c *app.RequestContext) {
	var err error
	var req conversation_message.GetMessageListRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(conversation_message.GetMessageListResponse)

	c.JSON(consts.StatusOK, resp)
}

// DeleteMessage .
// @router /api/conversation/delete_message [POST]
func DeleteMessage(ctx context.Context, c *app.RequestContext) {
	var err error
	var req conversation_message.DeleteMessageRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(conversation_message.DeleteMessageResponse)

	c.JSON(consts.StatusOK, resp)
}

// BreakMessage .
// @router /api/conversation/break_message [POST]
func BreakMessage(ctx context.Context, c *app.RequestContext) {
	var err error
	var req conversation_message.BreakMessageRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(conversation_message.BreakMessageResponse)

	c.JSON(consts.StatusOK, resp)
}

// ClearConversationCtx .
// @router /api/conversation/create_section [POST]
func ClearConversationCtx(ctx context.Context, c *app.RequestContext) {
	var err error
	var req conversation_conversation.ClearConversationCtxRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(conversation_conversation.ClearConversationCtxResponse)

	c.JSON(consts.StatusOK, resp)
}
