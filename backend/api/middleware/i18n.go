package middleware

import (
	"context"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/pkg/i18n"
)

func I18nMW() app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
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
