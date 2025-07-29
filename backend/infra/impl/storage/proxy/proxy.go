package proxy

import (
	"context"
	"net"
	"net/url"
	"os"

	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

func CheckIfNeedReplaceHost(ctx context.Context, originURL *url.URL) (ok bool, proxyURL string) {
	proxyPort := os.Getenv(consts.MinIOProxyEndpoint) // :8889
	if proxyPort == "" {
		return false, ""
	}

	currentHost, ok := ctxcache.Get[string](ctx, consts.HostKeyInCtx)
	if !ok {
		return false, ""
	}

	currentScheme, ok := ctxcache.Get[string](ctx, consts.RequestSchemeKeyInCtx)
	if !ok {
		return false, ""
	}

	host, _, err := net.SplitHostPort(currentHost)
	if err != nil {
		host = currentHost
	}

	minioProxyHost := host + proxyPort
	originURL.Host = minioProxyHost
	originURL.Scheme = currentScheme
	logs.CtxDebugf(ctx, "[CheckIfNeedReplaceHost] reset originURL.String = %s", originURL.String())
	return true, originURL.String()
}
