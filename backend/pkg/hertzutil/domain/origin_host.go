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

package domain

import (
	"net/url"

	"github.com/cloudwego/hertz/pkg/app"
)

const (
	HeaderKeyOfOrigin = "Origin"
	HeaderKeyOfHost   = "Host"
)

func GetOriginHost(c *app.RequestContext) string {
	origin := c.Request.Header.Get(HeaderKeyOfOrigin)
	if origin != "" {
		u, err := url.Parse(origin)
		if err == nil {
			return u.Hostname()
		}
	}

	host := c.Request.Header.Get(HeaderKeyOfHost)
	if host != "" {
		return host
	}

	return string(c.Request.URI().Host())
}
