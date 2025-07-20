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

package middleware

import (
	"context"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"

	"github.com/coze-dev/coze-studio/backend/domain/user/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

func I18nMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		session, ok := ctxcache.Get[*entity.Session](c, consts.SessionDataKeyInCtx)
		if ok {
			c = i18n.SetLocale(c, session.Locale)
			ctx.Next(c)
			return
		}

		acceptLanguage := string(ctx.Request.Header.Get("Accept-Language"))
		locale := "en-US"
		if acceptLanguage != "" {
			languages := strings.Split(acceptLanguage, ",")
			if len(languages) > 0 {
				locale = languages[0]
			}
		}

		c = i18n.SetLocale(c, locale)

		ctx.Next(c)
	}
}
