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

	"code.byted.org/gopkg/logs"
	"code.byted.org/middleware/hertz/pkg/app"
	"github.com/spf13/cast"

	"code.byted.org/data_edc/workflow_engine_next/domain/user/entity"
	"code.byted.org/data_edc/workflow_engine_next/pkg/errorx"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/conv"
	"code.byted.org/data_edc/workflow_engine_next/types/errno"

	"code.byted.org/data_edc/workflow_engine_next/api/internal/httputil"
	"code.byted.org/data_edc/workflow_engine_next/application/user"
	"code.byted.org/data_edc/workflow_engine_next/pkg/ctxcache"
	"code.byted.org/data_edc/workflow_engine_next/types/consts"
	bdsso "code.byted.org/ucenter/bdsso_sessionlib"
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

		// 先尝试获取邮箱登录的 session
		s := ctx.Cookie(entity.SessionKey)
		logs.CtxInfo(c, "[SessionAuthMW] session id: %s", s)
		if len(s) == 0 {
			// 再取 bdsso
			bdSession, err := bdsso.GetHertzSession(ctx)
			if err != nil {
				logs.CtxError(c, "[SessionAuthMW] get session failed, err: %v", err)
				httputil.InternalError(c, ctx,
					errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "bdsso session not found")))
				return
			} else {
				logs.CtxInfo(c, "[SessionAuthMW] bdsso session found: %v", conv.DebugJsonToStr(bdSession))
				userName, err := bdSession.UserName(c)
				if err != nil {
					logs.CtxError(c, "[SessionAuthMW] get user name failed, err: %v", err)
					httputil.InternalError(c, ctx,
						errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "bdsso session not login")))
					return
				}
				logs.CtxInfo(c, "[SessionAuthMW] user name: %s", userName)
				isLogin, _ := bdSession.IsLogin(c)
				if !isLogin {
					httputil.InternalError(c, ctx,
						errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "bdsso session not login")))
					return
				}
				userID, _ := bdSession.EmployeeID(c)
				ctxcache.Store(c, consts.SessionDataKeyInCtx, &entity.Session{
					UserID: cast.ToInt64(userID),
				})
				ctx.Next(c)
			}
		} else {
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
		}
		ctx.Next(c)
	}
}
