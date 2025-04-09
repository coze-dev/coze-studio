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
		}
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)
		m := map[string]any{
			"URLVars": map[string]string{"url_v1": "v1"},
			"Headers": map[string]string{"h1": "1", "h2": "2"},
			"Params":  map[string]string{"p1": "v1", "p2": "v2"},
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, 200, result["statusCode"])
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
		}

		// 创建 HTTPRequest 实例
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)

		m := map[string]any{
			"URLVars":      map[string]string{"post_v1": "post_v1"},
			"Headers":      map[string]string{"h1": "1", "h2": "2"},
			"Params":       map[string]string{"p1": "v1", "p2": "v2"},
			"FormDataVars": map[string]string{"f1": "fv1", "f2": "fv2", "fileURL": fileServer.URL},
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, 200, result["statusCode"])

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
		}
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)

		m := map[string]any{
			"URLVars": map[string]string{"post_text_plain": "post_text_plain"},

			"Headers":       map[string]string{"h1": "1", "h2": "2"},
			"Params":        map[string]string{"p1": "v1", "p2": "v2"},
			"TextPlainVars": map[string]string{"v1": "v1", "v2": "v2"},
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, 200, result["statusCode"])

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
		}

		// 创建 HTTPRequest 实例
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)

		m := map[string]any{
			"URLVars":  map[string]string{"application_json": "application_json"},
			"Headers":  map[string]string{"h1": "1", "h2": "2"},
			"Params":   map[string]string{"p1": "v1", "p2": "v2"},
			"JsonVars": map[string]string{"v1": "v1", "v2": "v2"},
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, 200, result["statusCode"])

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
		}

		// 创建 HTTPRequest 实例
		hg, err := NewHTTPRequester(context.Background(), cfg)
		assert.NoError(t, err)

		m := map[string]any{
			"URLVars": map[string]string{"application_json": "application_json"},
			"Headers": map[string]string{"h1": "1", "h2": "2"},
			"Params":  map[string]string{"p1": "v1", "p2": "v2"},
			"FileURL": fileServer.URL,
		}

		result, err := hg.Invoke(context.Background(), m)
		assert.NoError(t, err)
		assert.Equal(t, `{"message":"success"}`, result["body"])
		assert.Equal(t, 200, result["statusCode"])

	})

}
