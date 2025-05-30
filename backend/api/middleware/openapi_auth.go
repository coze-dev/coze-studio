package middleware

import (
	"context"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/api/internal/httputil"
	"code.byted.org/flow/opencoze/backend/application/openapiauth"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

const HeaderAuthorizationKey = "Authorization"

var needAuthPath = map[string]bool{
	"/v3/chat":                      true,
	"/v1/conversations":             true,
	"/v1/conversation/create":       true,
	"/v1/conversation/message/list": true,
	"/v1/files/upload":              true,
}

var needAuthFunc = map[string]bool{
	"coze.ClearConversationApi": true, // v1/conversations/:conversation_id/clear
}

func parseBearerAuthToken(authHeader string) string {
	if len(authHeader) == 0 {
		return ""
	}
	parts := strings.Split(authHeader, "Bearer")
	if len(parts) != 2 {
		return ""
	}

	token := strings.TrimSpace(parts[1])
	if len(token) == 0 {
		return ""
	}

	return token
}

func isNeedOpenapiAuth(c *app.RequestContext) bool {
	isNeedAuth := false

	handlerParse := strings.Split(c.HandlerName(), "/")
	if len(handlerParse) > 0 && needAuthFunc[handlerParse[len(handlerParse)-1]] {
		isNeedAuth = true
	}

	if needAuthPath[string(c.GetRequest().URI().Path())] {
		isNeedAuth = true
	}

	return isNeedAuth
}

func OpenapiAuthMW() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		if !isNeedOpenapiAuth(c) {
			c.Next(ctx)
			return
		}

		if len(c.Request.Header.Get(HeaderAuthorizationKey)) == 0 {
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrAuthenticationFailed, errorx.KV("reason", "missing authorization in header")))
			return
		}

		apiKey := parseBearerAuthToken(c.Request.Header.Get(HeaderAuthorizationKey))
		if len(apiKey) == 0 {
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrAuthenticationFailed, errorx.KV("reason", "missing api_key in request")))
			return
		}

		apiKeyInfo, err := openapiauth.OpenApiAuthApplication.CheckPermission(ctx, apiKey)
		if err != nil {
			logs.CtxErrorf(ctx, "OpenApiAuthApplication.CheckPermission failed, err=%v", err)
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrAuthenticationFailed, errorx.KV("reason", err.Error())))
			return
		}

		if apiKeyInfo == nil {
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrAuthenticationFailed, errorx.KV("reason", "api key invalid")))
			return
		}

		apiKeyInfo.ConnectorID = consts.APIConnectorID
		logs.CtxInfof(ctx, "OpenapiAuthMW: apiKeyInfo=%v", conv.DebugJsonToStr(apiKeyInfo))
		ctxcache.Store(ctx, consts.OpenapiAuthKeyInCtx, apiKeyInfo)

		c.Next(ctx)
	}
}
