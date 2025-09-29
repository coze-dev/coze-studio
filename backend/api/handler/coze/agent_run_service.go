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
	"encoding/json"
	"errors"
	"net/http"

	"github.com/hertz-contrib/sse"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/run"

	"github.com/coze-dev/coze-studio/backend/application/conversation"
	sseImpl "github.com/coze-dev/coze-studio/backend/infra/sse/impl/sse"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// AgentRun .
// @router /api/conversation/chat [POST]
func AgentRun(ctx context.Context, c *app.RequestContext) {
	var err error
	var req run.AgentRunRequest

	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	if checkErr := checkParams(ctx, &req); checkErr != nil {
		invalidParamRequestResponse(c, checkErr.Error())
		return
	}

	sseSender := sseImpl.NewSSESender(sse.NewStream(c))
	c.SetStatusCode(http.StatusOK)
	c.Response.Header.Set("X-Accel-Buffering", "no")

	err = conversation.ConversationSVC.Run(ctx, sseSender, &req)
	if err != nil {
		errData := run.ErrorData{
			Code: errno.ErrConversationAgentRunError,
			Msg:  err.Error(),
		}
		ed, _ := json.Marshal(errData)
		_ = sseSender.Send(ctx, &sse.Event{
			Event: run.RunEventError,
			Data:  ed,
		})
	}
}

func checkParams(_ context.Context, ar *run.AgentRunRequest) error {
	if ar.BotID == 0 {
		return errorx.New(errno.ErrConversationInvalidParamCode, errorx.KV("msg", "bot id is required"))
	}

	if ar.Scene == nil {
		return errorx.New(errno.ErrConversationInvalidParamCode, errorx.KV("msg", "scene is required"))
	}

	if ar.ContentType == nil {
		ar.ContentType = ptr.Of(run.ContentTypeText)
	}
	return nil
}

// ChatV3 .
// @router /v3/chat [POST]
func ChatV3(ctx context.Context, c *app.RequestContext) {
	var err error
	var req run.ChatV3Request

	// Pre-process parameters field: convert JSON object to string if needed
	if err = preprocessChatV3Parameters(c); err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}
	if checkErr := checkParamsV3(ctx, &req); checkErr != nil {
		invalidParamRequestResponse(c, checkErr.Error())
		return
	}

	c.SetStatusCode(http.StatusOK)
	c.Response.Header.Set("X-Accel-Buffering", "no")
	sseSender := sseImpl.NewSSESender(sse.NewStream(c))
	err = conversation.ConversationOpenAPISVC.OpenapiAgentRun(ctx, sseSender, &req)
	if err != nil {
		errData := run.ErrorData{
			Code: errno.ErrConversationAgentRunError,
			Msg:  err.Error(),
		}
		ed, _ := json.Marshal(errData)
		_ = sseSender.Send(ctx, &sse.Event{
			Event: run.RunEventError,
			Data:  ed,
		})
	}

}

func checkParamsV3(_ context.Context, ar *run.ChatV3Request) error {
	if ar.BotID == 0 {
		return errorx.New(errno.ErrConversationInvalidParamCode, errorx.KV("msg", "bot id is required"))
	}
	return nil
}

// CancelChatApi .
// @router /v3/chat/cancel [POST]
func CancelChatApi(ctx context.Context, c *app.RequestContext) {
	var err error
	var req run.CancelChatApiRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	resp, err := conversation.ConversationOpenAPISVC.CancelRun(ctx, &req)
	if err != nil {
		invalidParamRequestResponse(c, err.Error())
		return
	}

	c.JSON(consts.StatusOK, resp)
}

// preprocessChatV3Parameters handles the conversion of parameters field from JSON object to string
func preprocessChatV3Parameters(c *app.RequestContext) error {
	// Get the raw request body
	body := c.Request.Body()
	if len(body) == 0 {
		return nil
	}

	// Parse the JSON body
	var requestData map[string]interface{}
	if err := json.Unmarshal(body, &requestData); err != nil {
		return nil // If it's not valid JSON, let BindAndValidate handle the error
	}

	// Check if parameters field exists and is an object
	if parametersValue, exists := requestData["parameters"]; exists {
		// If parameters is already a string, no conversion needed
		if _, isString := parametersValue.(string); isString {
			return errors.New("parameters field should be an object, not a string")
		}

		// If parameters is an object, convert it to JSON string
		if parametersObj, isObject := parametersValue.(map[string]interface{}); isObject {
			parametersJSON, err := json.Marshal(parametersObj)
			if err != nil {
				return err
			}
			requestData["parameters"] = string(parametersJSON)

			// Update the request body with the modified data
			modifiedBody, err := json.Marshal(requestData)
			if err != nil {
				return err
			}

			// Replace the request body
			c.Request.SetBody(modifiedBody)
		}
	}

	return nil
}
