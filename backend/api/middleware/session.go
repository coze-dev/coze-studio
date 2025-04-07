package middleware

import (
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"context"

	"code.byted.org/flow/opencoze/backend/application"
	"github.com/cloudwego/hertz/pkg/app"
)

const sessionID = "sessionid"

func ProcessSessionRequestMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
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
