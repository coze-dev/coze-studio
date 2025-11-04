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

package middleware

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"regexp"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"

	"github.com/coze-dev/coze-studio/backend/api/internal/httputil"
	"github.com/coze-dev/coze-studio/backend/application/openauth"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

const HeaderAuthorizationKey = "Authorization"

var needAuthPath = map[string]bool{
	"/v3/chat":                         true,
	"/v1/conversations":                true,
	"/v1/conversation/create":          true,
	"/v1/conversation/message/list":    true,
	"/v1/files/upload":                 true,
	"/v1/workflow/run":                 true,
	"/v1/workflow/stream_run":          true,
	"/v1/workflow/stream_resume":       true,
	"/v1/workflow/get_run_history":     true,
	"/v1/bot/get_online_info":          true,
	"/v1/workflows/chat":               true,
	"/v1/workflow/conversation/create": true,
	"/v3/chat/cancel":                  true,
	"/v1/conversation/retrieve":        true,
	"/v3/chat/retrieve":                true,
	"/v3/chat/message/list":            true,
}

var needAuthFunc = map[string]bool{
	"^/v1/conversations/[0-9]+/clear$": true, // v1/conversations/:conversation_id/clear
	"^/v1/bots/[0-9]+$":                true,
	"^/v1/conversations/[0-9]+$":       true,

	"^/v1/workflows/[0-9]+$": true,
	"^/v1/apps/[0-9]+$":      true,
}

func parseBearerAuthToken(authHeader string) string {
	if len(authHeader) == 0 {
		return ""
	}
	parts := strings.Split(authHeader, "Bearer")
	if len(parts) != 2 {
		return ""
	}

	token := strings.TrimSpace(parts[1])
	if len(token) == 0 {
		return ""
	}

	return token
}

func isNeedOpenapiAuth(c *app.RequestContext) bool {
	isNeedAuth := false

	uriPath := c.URI().Path()

	for rule, res := range needAuthFunc {
		if regexp.MustCompile(rule).MatchString(string(uriPath)) {
			isNeedAuth = res
			break
		}
	}

	if needAuthPath[string(c.GetRequest().URI().Path())] {
		isNeedAuth = true
	}

	return isNeedAuth
}

func OpenapiAuthMW() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		requestAuthType := c.GetInt32(RequestAuthTypeStr)
		if requestAuthType != int32(RequestAuthTypeOpenAPI) {
			c.Next(ctx)
			return
		}

		// open api auth
		if len(c.Request.Header.Get(HeaderAuthorizationKey)) == 0 {
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "missing authorization in header")))
			return
		}

		apiKey := parseBearerAuthToken(c.Request.Header.Get(HeaderAuthorizationKey))
		if len(apiKey) == 0 {
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "missing api_key in request")))
			return
		}

		md5Hash := md5.Sum([]byte(apiKey))
		md5Key := hex.EncodeToString(md5Hash[:])
		apiKeyInfo, err := openauth.OpenAuthApplication.CheckPermission(ctx, md5Key)

		if err != nil {
			logs.CtxErrorf(ctx, "OpenAuthApplication.CheckPermission failed, err=%v", err)
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", err.Error())))
			return
		}

		if apiKeyInfo == nil {
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "api key invalid")))
			return
		}

		apiKeyInfo.ConnectorID = consts.APIConnectorID
		logs.CtxInfof(ctx, "OpenapiAuthMW: apiKeyInfo=%v", conv.DebugJsonToStr(apiKeyInfo))
		ctxcache.Store(ctx, consts.OpenapiAuthKeyInCtx, apiKeyInfo)
		err = openauth.OpenAuthApplication.UpdateLastUsedAt(ctx, apiKeyInfo.ID, apiKeyInfo.UserID)
		if err != nil {
			logs.CtxErrorf(ctx, "OpenAuthApplication.UpdateLastUsedAt failed, err=%v", err)
		}
		c.Next(ctx)
	}
}
