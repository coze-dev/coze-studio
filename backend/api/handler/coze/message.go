package coze

import (
	"context"
	"errors"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"code.byted.org/flow/opencoze/backend/api/model/conversation_message"
	"code.byted.org/flow/opencoze/backend/application"
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

	if checkErr := checkMLParams(ctx, &req); checkErr != nil {
		c.String(consts.StatusBadRequest, checkErr.Error())
		return
	}

	resp, err := application.MessageApplicationService.GetMessageList(ctx, &req)

	if err != nil {
		c.String(consts.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(consts.StatusOK, resp)
}

func checkMLParams(ctx context.Context, req *conversation_message.GetMessageListRequest) error {
	if req.BotID == "" {
		return errors.New("bot id is required")
	}
	if req.ConversationID == "" {
		return errors.New("conversation id is required")
	}
	return nil
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
	if checkErr := checkDMParams(ctx, &req); checkErr != nil {
		c.String(consts.StatusBadRequest, checkErr.Error())
		return
	}

	err = application.MessageApplicationService.DeleteMessage(ctx, &req)

	if err != nil {
		c.String(consts.StatusInternalServerError, err.Error())
		return
	}
	resp := new(conversation_message.DeleteMessageResponse)
	c.JSON(consts.StatusOK, resp)
}

func checkDMParams(ctx context.Context, req *conversation_message.DeleteMessageRequest) error {

	if req.MessageID == "" {
		return errors.New("message id is required")
	}
	if _, err := strconv.ParseInt(req.MessageID, 10, 64); err != nil {
		return errors.New("message id is invalid")
	}

	return nil
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

	if checkErr := checkBMParams(ctx, &req); checkErr != nil {
		c.String(consts.StatusBadRequest, checkErr.Error())
		return
	}

	err = application.MessageApplicationService.BreakMessage(ctx, &req)
	if err != nil {
		c.String(consts.StatusInternalServerError, err.Error())
		return
	}

	resp := new(conversation_message.BreakMessageResponse)

	c.JSON(consts.StatusOK, resp)
}

func checkBMParams(ctx context.Context, req *conversation_message.BreakMessageRequest) error {

	if req.AnswerMessageID == nil {
		return errors.New("answer message id is required")
	}
	if _, err := strconv.ParseInt(*req.AnswerMessageID, 10, 64); err != nil {
		return errors.New("answer message id is invalid")
	}

	return nil
}
