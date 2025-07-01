package middleware

import (
	"context"
	"regexp"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/api/internal/httputil"
	"code.byted.org/flow/opencoze/backend/application/openauth"
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
	"/v1/workflow/run":              true,
	"/v1/workflow/stream_run":       true,
	"/v1/workflow/stream_resume":    true,
	"/v1/workflow/get_run_history":  true,
	"/v1/bot/get_online_info":       true,
}

var needAuthFunc = map[string]bool{
	"^/v1/conversations/[0-9]+/clear$": true, // v1/conversations/:conversation_id/clear
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

	uriPath := c.URI().Path()

	for rule, res := range needAuthFunc {
		if regexp.MustCompile(rule).MatchString(string(uriPath)) {
			isNeedAuth = res
			break
		}
	}

	if needAuthPath[string(c.GetRequest().URI().Path())] {
		isNeedAuth = true
	}

	return isNeedAuth
}

func OpenapiAuthMW() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		requestAuthType := c.GetInt32(RequestAuthTypeStr)
		if requestAuthType != int32(RequestAuthTypeOpenAPI) {
			c.Next(ctx)
			return
		}

		// open api auth
		if len(c.Request.Header.Get(HeaderAuthorizationKey)) == 0 {
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "missing authorization in header")))
			return
		}

		apiKey := parseBearerAuthToken(c.Request.Header.Get(HeaderAuthorizationKey))
		if len(apiKey) == 0 {
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "missing api_key in request")))
			return
		}

		apiKeyInfo, err := openauth.OpenAuthApplication.CheckPermission(ctx, apiKey)
		if err != nil {
			logs.CtxErrorf(ctx, "OpenAuthApplication.CheckPermission failed, err=%v", err)
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", err.Error())))
			return
		}

		if apiKeyInfo == nil {
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "api key invalid")))
			return
		}

		apiKeyInfo.ConnectorID = consts.APIConnectorID
		logs.CtxInfof(ctx, "OpenapiAuthMW: apiKeyInfo=%v", conv.DebugJsonToStr(apiKeyInfo))
		ctxcache.Store(ctx, consts.OpenapiAuthKeyInCtx, apiKeyInfo)
		err = openauth.OpenAuthApplication.UpdateLastUsedAt(ctx, apiKeyInfo.ID, apiKeyInfo.UserID)
		if err != nil {
			logs.CtxErrorf(ctx, "OpenAuthApplication.UpdateLastUsedAt failed, err=%v", err)
		}
		c.Next(ctx)
	}
}
