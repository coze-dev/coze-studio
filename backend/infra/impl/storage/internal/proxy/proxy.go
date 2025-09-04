/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

func CheckIfNeedReplaceHost(ctx context.Context, originURLStr string) (ok bool, proxyURL string) {
	// url parse
	originURL, err := url.Parse(originURLStr)
	if err != nil {
		logs.CtxWarnf(ctx, "[CheckIfNeedReplaceHost] url parse failed, err: %v", err)
		return false, ""
	}

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
