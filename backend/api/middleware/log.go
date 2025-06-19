package middleware

import (
	"context"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"
	"unsafe"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/google/uuid"

	"code.byted.org/flow/opencoze/backend/pkg/logs"
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
		logID, _ := ctx.Get("logID")

		handlerPkgPath := strings.Split(ctx.HandlerName(), "/")
		handleName := ""
		if len(handlerPkgPath) > 0 {
			handleName = handlerPkgPath[len(handlerPkgPath)-1]
		}

		requestType := ctx.GetInt32(RequestAuthTypeStr)
		baseLog := fmt.Sprintf("| %s | %s | %d | %v | %s | %s | %v | %s | %d",
			logID, ctx.Host(), status, latency, clientIP, method, path, handleName, requestType)

		switch {
		case status >= http.StatusInternalServerError:
			logs.CtxErrorf(c, "%s", baseLog)
		case status >= http.StatusBadRequest:
			logs.CtxWarnf(c, "%s ", baseLog)
		default:
			urlQuery := ctx.Request.URI().QueryString()
			reqBody := bytesToString(ctx.Request.Body())
			respBody := bytesToString(ctx.Response.Body())
			maxPrintLen := 3 * 1024
			if len(respBody) > maxPrintLen {
				respBody = respBody[:maxPrintLen]
			}
			if len(reqBody) > maxPrintLen {
				reqBody = reqBody[:maxPrintLen]
			}

			requestAuthType := ctx.GetInt32(RequestAuthTypeStr)
			if requestAuthType != int32(RequestAuthTypeStaticFile) && filepath.Ext(path) == "" {
				logs.CtxDebugf(c, "%s \nquery : %s \nreq : %s \nresp: %s",
					baseLog, urlQuery, reqBody, respBody)
			}
		}
	}
}
func SetLogIDMW() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		logID := uuid.New().String()
		c.Set("logID", logID)
		c.Header("X-Log-ID", logID)
		c.Next(ctx)
	}
}

func bytesToString(b []byte) string {
	return *(*string)(unsafe.Pointer(&b)) // nolint
}
