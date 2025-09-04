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

package goutil

import "net/url"

// MapToQuery converts a map[string]string to a URL-encoded query string.
func MapToQuery(data map[string]string) string {
	if len(data) == 0 {
		return ""
	}
	params := url.Values{}
	for k, v := range data {
		params.Set(k, v)
	}
	return params.Encode()
}
