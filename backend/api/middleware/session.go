package middleware

import (
	"context"
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/application"
	"code.byted.org/flow/opencoze/backend/domain/session/entity"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

const sessionID = "sessionid"

func SessionAuthMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		// TODO: remove me
		ctxcache.Store(c, consts.SessionDataKeyInCtx, &entity.SessionData{
			UserID:  888,
			SpaceID: 666,
		})

		if ctxcache.HasKey(c, consts.SessionDataKeyInCtx) {
			ctx.Next(c)

			return
		}

		s := ctx.Cookie(sessionID)
		if len(s) == 0 {
			logs.Errorf("[SessionAuthMW] session id is nil")
			ctx.AbortWithStatus(http.StatusUnauthorized)

			return
		}

		// sessionID -> sessionData
		sessionData, err := application.SessionSVC.ValidateSession(c, string(s))
		if err != nil {
			logs.Errorf("[SessionAuthMW] validate session failed, err: %v", err)
			ctx.AbortWithStatus(http.StatusUnauthorized)

			return
		}

		if sessionData != nil {
			ctxcache.Store(c, consts.SessionDataKeyInCtx, sessionData)
		}

		ctx.Next(c)
	}
}

func ProcessSessionRequestMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		// TODO: remove me
		ctxcache.Store(c, consts.SessionDataKeyInCtx, &entity.SessionData{
			UserID:  888,
			SpaceID: 666,
		})

		// if ctxcache.HasKey(c, consts.SessionDataKeyInCtx) {
		// 	ctx.Next(c)

		// 	return
		// }

		// s := ctx.Cookie(sessionID)
		// if len(s) == 0 {
		// 	ctx.Next(c)

		// 	return
		// }

		// // sessionID -> sessionData
		// sessionData, err := application.SessionSVC.ValidateSession(c, string(s))
		// if err != nil {
		// 	logs.Errorf("validate session failed, err: %v", err)
		// }

		// if sessionData != nil {
		// 	ctxcache.Store(c, consts.SessionDataKeyInCtx, sessionData)
		// }

		ctx.Next(c)
	}
}
