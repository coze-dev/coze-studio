package middleware

import (
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"context"

	"github.com/cloudwego/hertz/pkg/app"
)

func ContextCacheMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		c = ctxcache.Init(c)
		ctx.Next(c)
	}
}
