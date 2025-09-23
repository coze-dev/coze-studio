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

package execute

import (
	"fmt"
	"strings"
	"unicode"
)

func sanitizeSpanSegment(raw string, fallback string) string {
	name := strings.TrimSpace(raw)
	if name == "" {
		return fallback
	}

	var b strings.Builder
	for _, r := range name {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			b.WriteRune(r)
		case r == '-' || r == '_':
			b.WriteRune(r)
		case unicode.IsSpace(r):
			b.WriteRune('_')
		default:
			b.WriteRune('_')
		}
	}

	sanitized := strings.Trim(b.String(), "_-")
	if sanitized == "" {
		return fallback
	}
	return sanitized
}

func normalizedModelName(name string, id int64) string {
	fallback := "unknown"
	if id != 0 {
		fallback = fmt.Sprintf("id-%d", id)
	}
	return sanitizeSpanSegment(name, fallback)
}

func normalizedProvider(provider string) string {
	return sanitizeSpanSegment(provider, "provider")
}
