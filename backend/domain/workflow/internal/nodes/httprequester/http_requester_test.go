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

package httprequester

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/pkg/lang/crypto"
)

func TestInvoke(t *testing.T) {
	t.Run("get method", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			response := map[string]string{
				"message": "success",
			}
			bs, _ := json.Marshal(response)
			_, _ = w.Write(bs)
		}))
		defer ts.Close()
		urlTpl := ts.URL + "/{{url_v1}}"
		cfg := &Config{
			URLConfig: URLConfig{
				Tpl: urlTpl,
			},
			BodyConfig: BodyConfig{
				BodyType: BodyTypeNone,
			},
			Method:     http.MethodGet,
			RetryTimes: 1,
			Timeout:    2 * time.Second,
			MD5FieldMapping: MD5FieldMapping{
				URLMD5Mapping: map[string]string{
					crypto.MD5HexValue("url_v1"): "url_v1",
				},
				HeaderMD5Mapping: map[string]string{
					crypto.MD5HexValue("h1"): "h1",
					crypto.MD5HexValue("h2"): "h2",
				},
				ParamMD5Mapping: map[string]string{
					crypto.MD5HexValue("p1"): "p1",
					crypto.MD5HexValue("p2"): "p2",
				},
			},
		}
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)
		m := map[string]any{
			"__apiInfo_url_" + crypto.MD5HexValue("url_v1"): "v1",
			"__headers_" + crypto.MD5HexValue("h1"):         "1",
			"__headers_" + crypto.MD5HexValue("h2"):         "2",
			"__params_" + crypto.MD5HexValue("p1"):          "v1",
			"__params_" + crypto.MD5HexValue("p2"):          "v2",
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, int64(200), result["statusCode"])
	})

	t.Run("post method multipart/form-data", func(t *testing.T) {
		fileServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fileContent := "fileV1"
			_, _ = w.Write([]byte(fileContent))
		}))
		defer fileServer.Close()
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			err := r.ParseMultipartForm(10 << 20) // 10 MB
			if err != nil {
				return
			}
			f1 := r.MultipartForm.Value["f1"][0]
			assert.Equal(t, "fv1", f1)
			f2 := r.MultipartForm.Value["f2"][0]
			assert.Equal(t, "fv2", f2)
			file, _, err := r.FormFile("fileURL")
			if err != nil {
				t.Error(err)
			}

			fileBs, err := io.ReadAll(file)
			if err != nil {
				t.Error(err)
			}
			assert.Equal(t, "fileV1", string(fileBs))

			w.WriteHeader(http.StatusOK)
			response := map[string]string{
				"message": "success",
			}
			bs, _ := json.Marshal(response)
			_, _ = w.Write(bs)
		}))
		defer ts.Close()

		urlTpl := ts.URL + "/{{post_v1}}"

		cfg := &Config{
			URLConfig: URLConfig{
				Tpl: urlTpl,
			},
			BodyConfig: BodyConfig{
				BodyType: BodyTypeFormData,
				FormDataConfig: &FormDataConfig{
					map[string]bool{
						"fileURL": true,
					},
				},
			},
			Method:     http.MethodPost,
			RetryTimes: 1,
			Timeout:    2 * time.Second,
			MD5FieldMapping: MD5FieldMapping{
				URLMD5Mapping: map[string]string{
					crypto.MD5HexValue("post_v1"): "post_v1",
				},
				HeaderMD5Mapping: map[string]string{
					crypto.MD5HexValue("h1"): "h1",
					crypto.MD5HexValue("h2"): "h2",
				},
				ParamMD5Mapping: map[string]string{
					crypto.MD5HexValue("p1"): "p1",
					crypto.MD5HexValue("p2"): "p2",
				},
				BodyMD5Mapping: map[string]string{
					crypto.MD5HexValue("f1"):      "f1",
					crypto.MD5HexValue("f2"):      "f2",
					crypto.MD5HexValue("fileURL"): "fileURL",
				},
			},
		}

		// Create an HTTPRequest instance
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)

		m := map[string]any{
			"__apiInfo_url_" + crypto.MD5HexValue("post_v1"):            "post_v1",
			"__headers_" + crypto.MD5HexValue("h1"):                     "1",
			"__headers_" + crypto.MD5HexValue("h2"):                     "2",
			"__params_" + crypto.MD5HexValue("p1"):                      "v1",
			"__params_" + crypto.MD5HexValue("p2"):                      "v2",
			"__body_bodyData_formData_" + crypto.MD5HexValue("f1"):      "fv1",
			"__body_bodyData_formData_" + crypto.MD5HexValue("f2"):      "fv2",
			"__body_bodyData_formData_" + crypto.MD5HexValue("fileURL"): fileServer.URL,
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, int64(200), result["statusCode"])
	})

	t.Run("post method text/plain", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				t.Fatal(err)
				return
			}
			defer func() {
				_ = r.Body.Close()
			}()
			assert.Equal(t, "text v1 v2", string(body))
			w.WriteHeader(http.StatusOK)
			response := map[string]string{
				"message": "success",
			}
			bs, _ := json.Marshal(response)
			_, _ = w.Write(bs)
		}))
		defer ts.Close()
		urlTpl := ts.URL + "/{{post_text_plain}}"
		cfg := &Config{
			URLConfig: URLConfig{
				Tpl: urlTpl,
			},
			BodyConfig: BodyConfig{
				BodyType: BodyTypeRawText,
				TextPlainConfig: &TextPlainConfig{
					Tpl: "text {{v1}} {{v2}}",
				},
			},
			Method:     http.MethodPost,
			RetryTimes: 1,
			Timeout:    2 * time.Second,
			MD5FieldMapping: MD5FieldMapping{
				URLMD5Mapping: map[string]string{
					crypto.MD5HexValue("post_text_plain"): "post_text_plain",
				},
				HeaderMD5Mapping: map[string]string{
					crypto.MD5HexValue("h1"): "h1",
					crypto.MD5HexValue("h2"): "h2",
				},
				ParamMD5Mapping: map[string]string{
					crypto.MD5HexValue("p1"): "p1",
					crypto.MD5HexValue("p2"): "p2",
				},
				BodyMD5Mapping: map[string]string{
					crypto.MD5HexValue("v1"): "v1",
					crypto.MD5HexValue("v2"): "v2",
				},
			},
		}
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)

		m := map[string]any{
			"__apiInfo_url_" + crypto.MD5HexValue("post_text_plain"): "post_text_plain",
			"__headers_" + crypto.MD5HexValue("h1"):                  "1",
			"__headers_" + crypto.MD5HexValue("h2"):                  "2",
			"__params_" + crypto.MD5HexValue("p1"):                   "v1",
			"__params_" + crypto.MD5HexValue("p2"):                   "v2",
			"__body_bodyData_rawText_" + crypto.MD5HexValue("v1"):    "v1",
			"__body_bodyData_rawText_" + crypto.MD5HexValue("v2"):    "v2",
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, int64(200), result["statusCode"])
	})

	t.Run("post method application/json", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				t.Fatal(err)
				return
			}
			defer func() {
				_ = r.Body.Close()
			}()
			assert.Equal(t, `{"v1":v1,"v2":v2}`, string(body))
			w.WriteHeader(http.StatusOK)
			response := map[string]string{
				"message": "success",
			}
			bs, _ := json.Marshal(response)
			_, _ = w.Write(bs)
		}))
		defer ts.Close()

		urlTpl := ts.URL + "/{{application_json}}"

		cfg := &Config{
			URLConfig: URLConfig{
				Tpl: urlTpl,
			},
			BodyConfig: BodyConfig{
				BodyType: BodyTypeJSON,
				TextJsonConfig: &TextJsonConfig{
					Tpl: `{"v1":{{v1}},"v2":{{v2}}}`,
				},
			},
			Method:     http.MethodPost,
			RetryTimes: 1,
			Timeout:    2 * time.Second,

			MD5FieldMapping: MD5FieldMapping{
				URLMD5Mapping: map[string]string{
					crypto.MD5HexValue("application_json"): "application_json",
				},
				HeaderMD5Mapping: map[string]string{
					crypto.MD5HexValue("h1"): "h1",
					crypto.MD5HexValue("h2"): "h2",
				},
				ParamMD5Mapping: map[string]string{
					crypto.MD5HexValue("p1"): "p1",
					crypto.MD5HexValue("p2"): "p2",
				},
				BodyMD5Mapping: map[string]string{
					crypto.MD5HexValue("v1"): "v1",
					crypto.MD5HexValue("v2"): "v2",
				},
			},
		}

		// Create an HTTPRequest instance
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)

		m := map[string]any{
			"__apiInfo_url_" + crypto.MD5HexValue("application_json"): "application_json",
			"__headers_" + crypto.MD5HexValue("h1"):                   "1",
			"__headers_" + crypto.MD5HexValue("h2"):                   "2",
			"__params_" + crypto.MD5HexValue("p1"):                    "v1",
			"__params_" + crypto.MD5HexValue("p2"):                    "v2",
			"__body_bodyData_json_" + crypto.MD5HexValue("v1"):        "v1",
			"__body_bodyData_json_" + crypto.MD5HexValue("v2"):        "v2",
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, int64(200), result["statusCode"])
	})

	t.Run("post method application/octet-stream", func(t *testing.T) {
		fileServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fileContent := strings.Repeat("fileV1", 100)
			_, _ = w.Write([]byte(fileContent))
		}))
		defer fileServer.Close()
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				t.Fatal(err)
				return
			}
			defer func() {
				_ = r.Body.Close()
			}()
			fileContent := strings.Repeat("fileV1", 100)
			assert.Equal(t, fileContent, string(body))
			w.WriteHeader(http.StatusOK)
			response := map[string]string{
				"message": "success",
			}
			bs, _ := json.Marshal(response)
			_, _ = w.Write(bs)
		}))
		defer ts.Close()

		urlTpl := ts.URL + "/{{binary}}"

		cfg := &Config{
			URLConfig: URLConfig{
				Tpl: urlTpl,
			},
			BodyConfig: BodyConfig{
				BodyType: BodyTypeBinary,
			},
			Method:     http.MethodPost,
			RetryTimes: 1,
			Timeout:    2 * time.Second,
			MD5FieldMapping: MD5FieldMapping{
				URLMD5Mapping: map[string]string{
					crypto.MD5HexValue("binary"): "binary",
				},
				HeaderMD5Mapping: map[string]string{
					crypto.MD5HexValue("h1"): "h1",
					crypto.MD5HexValue("h2"): "h2",
				},
				ParamMD5Mapping: map[string]string{
					crypto.MD5HexValue("p1"): "p1",
					crypto.MD5HexValue("p2"): "p2",
				},
			},
		}

		// Create an HTTPRequest instance
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)

		m := map[string]any{
			"__apiInfo_url_" + crypto.MD5HexValue("application_json"):   "application_json",
			"__headers_" + crypto.MD5HexValue("h1"):                     "1",
			"__headers_" + crypto.MD5HexValue("h2"):                     "2",
			"__params_" + crypto.MD5HexValue("p1"):                      "v1",
			"__params_" + crypto.MD5HexValue("p2"):                      "v2",
			"__body_bodyData_binary_fileURL" + crypto.MD5HexValue("v1"): fileServer.URL,
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, int64(200), result["statusCode"])
	})
}
