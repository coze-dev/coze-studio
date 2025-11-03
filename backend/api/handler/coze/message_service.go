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
	"context"
	"errors"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/message"
	application "github.com/coze-dev/coze-studio/backend/application/conversation"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// GetMessageList .
// @router /api/conversation/get_message_list [POST]
func GetMessageList(ctx context.Context, c *app.RequestContext) {
	var err error
	var req message.GetMessageListRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	if checkErr := checkMLParams(ctx, &req); checkErr != nil {
		invalidParamRequestResponse(c, checkErr.Error())
		return
	}

	resp, err := application.ConversationSVC.GetMessageList(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}

func checkMLParams(ctx context.Context, req *message.GetMessageListRequest) error {
	if req.BotID == "" {
		return errorx.New(errno.ErrConversationInvalidParamCode, errorx.KV("msg", "agent id is required"))
	}

	return nil
}

// DeleteMessage .
// @router /api/conversation/delete_message [POST]
func DeleteMessage(ctx context.Context, c *app.RequestContext) {
	var err error
	var req message.DeleteMessageRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}
	if checkErr := checkDMParams(ctx, &req); checkErr != nil {
		invalidParamRequestResponse(c, checkErr.Error())
		return
	}

	resp, err := application.ConversationSVC.DeleteMessage(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}

func checkDMParams(_ context.Context, req *message.DeleteMessageRequest) error {
	if req.MessageID <= 0 {
		return errorx.New(errno.ErrConversationInvalidParamCode, errorx.KV("msg", "message id is invalid"))
	}

	return nil
}

// BreakMessage .
// @router /api/conversation/break_message [POST]
func BreakMessage(ctx context.Context, c *app.RequestContext) {
	var err error
	var req message.BreakMessageRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	if checkErr := checkBMParams(ctx, &req); checkErr != nil {
		invalidParamRequestResponse(c, checkErr.Error())
		return
	}

	resp, err := application.ConversationSVC.BreakMessage(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}
	c.JSON(consts.StatusOK, resp)
}

func checkBMParams(_ context.Context, req *message.BreakMessageRequest) error {
	if req.AnswerMessageID == nil {
		return errors.New("answer message id is required")
	}
	if *req.AnswerMessageID <= 0 {
		return errorx.New(errno.ErrConversationInvalidParamCode, errorx.KV("msg", "answer message id is invalid"))
	}

	return nil
}

// GetApiMessageList .
// @router /v1/conversation/message/list [POST]
func GetApiMessageList(ctx context.Context, c *app.RequestContext) {
	var err error
	var req message.ListMessageApiRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	resp, err := application.OpenapiMessageSVC.GetApiMessageList(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}

// ListChatMessageApi .
// @router /v3/chat/message/list [GET]
func ListChatMessageApi(ctx context.Context, c *app.RequestContext) {
	var err error
	var req message.ListChatMessageApiRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	resp, err := application.ConversationOpenAPISVC.ListChatMessageApi(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}
