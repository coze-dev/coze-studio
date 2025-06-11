package middleware

import (
	"context"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
)

const RequestAuthTypeStr = "RequestAuthTypeStr"

type RequestAuthType = int32

const (
	RequestAuthTypeWebAPI     RequestAuthType = 0
	RequestAuthTypeOpenAPI    RequestAuthType = 1
	RequestAuthTypeStaticFile RequestAuthType = 2
)

func RequestInspectorMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		authType := RequestAuthTypeWebAPI // default is web api, session auth

		if isNeedOpenapiAuth(ctx) {
			authType = RequestAuthTypeOpenAPI
		} else if isStaticFile(ctx) {
			authType = RequestAuthTypeStaticFile
		}

		ctx.Set(RequestAuthTypeStr, authType)
		ctx.Next(c)
	}
}

var staticFilePath = map[string]bool{
	"/static":      true,
	"/":            true,
	"/sign":        true,
	"/favicon.png": true,
}

func isStaticFile(ctx *app.RequestContext) bool {
	path := string(ctx.GetRequest().URI().Path())
	if staticFilePath[path] {
		return true
	}

	if strings.HasPrefix(string(path), "/static/") ||
		strings.HasPrefix(string(path), "/explore/") ||
		strings.HasPrefix(string(path), "/space/") {
		return true
	}

	return false
}
