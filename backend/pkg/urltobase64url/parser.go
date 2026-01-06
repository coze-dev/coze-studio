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

package urltobase64url

import (
	"encoding/base64"
	"fmt"
	"io"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
)

type FileData struct {
	Base64Url string
	MimeType  string
}

func URLToBase64(url string) (*FileData, error) {

	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("http get error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("response status code error: %d", resp.StatusCode)
	}

	fileContent, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read file content error: %v", err)
	}

	var mimeType string

	contentType := resp.Header.Get("Content-Type")
	if contentType != "" {
		mediaType, _, err := mime.ParseMediaType(contentType)
		if err == nil && mediaType != "" {
			mimeType = mediaType
		}
	}

	if mimeType == "" {
		detectedType := http.DetectContentType(fileContent)
		if detectedType != "application/octet-stream" {
			mimeType = detectedType
		}
	}

	if mimeType == "" || mimeType == "application/octet-stream" {
		urlPath := url
		if idx := strings.Index(urlPath, "?"); idx != -1 {
			urlPath = urlPath[:idx]
		}
		if idx := strings.Index(urlPath, "#"); idx != -1 {
			urlPath = urlPath[:idx]
		}

		ext := filepath.Ext(urlPath)
		if ext != "" {
			extMimeType := mime.TypeByExtension(ext)
			if extMimeType != "" {
				mimeType = extMimeType
			}
		}
	}

	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	base64Str := base64.StdEncoding.EncodeToString(fileContent)

	return &FileData{
		Base64Url: "data:" + mimeType + ";base64," + base64Str,
		MimeType:  mimeType,
	}, nil
}
