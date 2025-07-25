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
