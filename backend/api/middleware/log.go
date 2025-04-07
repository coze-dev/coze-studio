package middleware

import (
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"context"
	"fmt"
	"net/http"
	"time"
	"unsafe"

	"github.com/cloudwego/hertz/pkg/app"
)

func AccessLogMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		start := time.Now()
		ctx.Next(c)

		status := ctx.Response.StatusCode()
		path := bytesToString(ctx.Request.URI().PathOriginal())
		latency := time.Since(start)
		method := bytesToString(ctx.Request.Header.Method())
		clientIP := ctx.ClientIP()
		baseLog := fmt.Sprintf("| %d | %v | %s | %s | %v", status, latency, clientIP, method, path)

		switch {
		case status >= http.StatusInternalServerError:
			logs.CtxErrorf(c, "%s", baseLog)
		case status >= http.StatusBadRequest:
			logs.CtxWarnf(c, "%s ", baseLog)
		default:
			urlQuery := ctx.Request.URI().QueryString()
			reqBody := bytesToString(ctx.Request.Body())
			respBody := bytesToString(ctx.Response.Body())

			logs.CtxDebugf(c, "%s \nquery : %s \nreq : %s \nresp: %s",
				baseLog, urlQuery, reqBody, respBody)
		}

	}
}

func bytesToString(b []byte) string {
	return *(*string)(unsafe.Pointer(&b)) //nolint
}
