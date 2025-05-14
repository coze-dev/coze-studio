package middleware

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/api/internal/errresp"
	"code.byted.org/flow/opencoze/backend/application/user"
	"code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var noNeedLoginPath = map[string]bool{
	"/api/passport/web/email/login/":       true,
	"/api/passport/web/email/register/v2/": true,
}

func SessionAuthMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {

		logs.Infof("[SessionAuthMW] path: %s", string(ctx.GetRequest().URI().Path()))
		if noNeedLoginPath[string(ctx.GetRequest().URI().Path())] {
			ctx.Next(c)
			return
		}

		// TODO: remove me
		// ctxcache.Store(c, consts.SessionDataKeyInCtx, &entity.Session{
		// 	UserID: 888,
		// })
		//
		// if ctxcache.HasKey(c, consts.SessionDataKeyInCtx) {
		// 	ctx.Next(c)
		// 	return
		// }

		s := ctx.Cookie(entity.SessionKey)
		if len(s) == 0 {
			logs.Errorf("[SessionAuthMW] session id is nil")
			errresp.InternalServerErrorResponse(c, ctx,
				errorx.New(errno.ErrAuthenticationFailed, errorx.KV("reason", "missing session_key in cookie")))
			return
		}

		// sessionID -> sessionData
		session, err := user.SVC.ValidateSession(c, string(s))
		if err != nil {
			logs.Errorf("[SessionAuthMW] validate session failed, err: %v", err)
			errresp.InternalServerErrorResponse(c, ctx, err)
			return
		}

		if session != nil {
			ctxcache.Store(c, consts.SessionDataKeyInCtx, session)
		}

		ctx.Next(c)
	}
}
