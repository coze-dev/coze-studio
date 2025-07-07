package i18n

import (
	"context"
)

type Locale string

const (
	LocaleEN Locale = "en-US"
	LocaleZH Locale = "zh-CN"
)

const key = "i18n.locale.key"

func SetLocale(ctx context.Context, locale string) context.Context {
	return context.WithValue(ctx, key, locale)
}

func GetLocale(ctx context.Context) Locale {
	locale := ctx.Value(key)
	if locale == nil {
		return LocaleEN
	}

	switch locale.(string) {
	case "en-US":
		return LocaleEN
	case "zh-CN":
		return LocaleZH
	default:
		return LocaleEN
	}
}
