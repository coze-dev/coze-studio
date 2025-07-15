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
	"net/http"

	"github.com/hertz-contrib/sse"

	"code.byted.org/middleware/hertz/pkg/app"

	"code.byted.org/data_edc/workflow_engine_next/api/model/conversation/run"
	"code.byted.org/data_edc/workflow_engine_next/application/conversation"
	sseImpl "code.byted.org/data_edc/workflow_engine_next/infra/impl/sse"
	"code.byted.org/data_edc/workflow_engine_next/pkg/errorx"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/ptr"
	"code.byted.org/data_edc/workflow_engine_next/types/errno"
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
