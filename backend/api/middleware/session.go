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

	"github.com/cloudwego/hertz/pkg/app"

	"github.com/coze-dev/coze-studio/backend/domain/user/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"

	"github.com/coze-dev/coze-studio/backend/api/internal/httputil"
	"github.com/coze-dev/coze-studio/backend/application/user"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

var noNeedSessionCheckPath = map[string]bool{
	"/api/passport/web/email/login/":       true,
	"/api/passport/web/email/register/v2/": true,
}

func SessionAuthMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		requestAuthType := ctx.GetInt32(RequestAuthTypeStr)
		if requestAuthType != int32(RequestAuthTypeWebAPI) {
			ctx.Next(c)
			return
		}

		if noNeedSessionCheckPath[string(ctx.GetRequest().URI().Path())] {
			ctx.Next(c)
			return
		}

		s := ctx.Cookie(entity.SessionKey)
		if len(s) == 0 {
			logs.Errorf("[SessionAuthMW] session id is nil")
			httputil.InternalError(c, ctx,
				errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "missing session_key in cookie")))
			return
		}

		// sessionID -> sessionData
		session, err := user.UserApplicationSVC.ValidateSession(c, string(s))
		if err != nil {
			logs.Errorf("[SessionAuthMW] validate session failed, err: %v", err)
			httputil.InternalError(c, ctx, err)
			return
		}

		if session != nil {
			ctxcache.Store(c, consts.SessionDataKeyInCtx, session)
		}

		ctx.Next(c)
	}
}
