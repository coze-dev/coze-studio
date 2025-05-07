package middleware

import (
	"context"
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/application"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

const sessionID = "sessionid"

func SessionAuthMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		if ctxcache.HasKey(c, application.SessionApplicationService{}) {
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
			ctxcache.Store(c, application.SessionApplicationService{}, sessionData)
		}

		ctx.Next(c)
	}
}

func ProcessSessionRequestMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		if ctxcache.HasKey(c, application.SessionApplicationService{}) {
			ctx.Next(c)

			return
		}

		s := ctx.Cookie(sessionID)
		if len(s) == 0 {
			ctx.Next(c)

			return
		}

		// sessionID -> sessionData
		sessionData, err := application.SessionSVC.ValidateSession(c, string(s))
		if err != nil {
			logs.Errorf("validate session failed, err: %v", err)
		}

		if sessionData != nil {
			ctxcache.Store(c, application.SessionApplicationService{}, sessionData)
		}

		ctx.Next(c)
	}
}
