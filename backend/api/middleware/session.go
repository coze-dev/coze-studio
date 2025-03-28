package middleware

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
)

func SessionMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		// TODO: handle Session
		ctx.Next(c)
	}
}
