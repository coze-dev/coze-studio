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

package service

import (
	"net/http"
	"net/url"
	"testing"

	. "github.com/bytedance/mockey"
	"github.com/stretchr/testify/assert"
)

func TestGenRequestString(t *testing.T) {
	PatchConvey("", t, func() {
		requestStr, err := genRequestString(&http.Request{
			Header: http.Header{
				"Content-Type": []string{"application/json"},
			},
			Method: http.MethodPost,
			URL:    &url.URL{Path: "/test"},
		}, []byte(`{"a": 1}`))
		assert.NoError(t, err)
		assert.Equal(t, `{"header":{"Content-Type":["application/json"]},"query":null,"path":"/test","body":{"a": 1}}`, requestStr)
	})

	PatchConvey("", t, func() {
		var body []byte
		requestStr, err := genRequestString(&http.Request{
			URL: &url.URL{Path: "/test"},
		}, body)
		assert.NoError(t, err)
		assert.Equal(t, `{"header":null,"query":null,"path":"/test","body":null}`, requestStr)
	})
}
