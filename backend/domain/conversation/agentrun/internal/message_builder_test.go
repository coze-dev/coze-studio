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

package internal

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	mockImagex "github.com/coze-dev/coze-studio/backend/internal/mock/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

func TestParseMessageURI(t *testing.T) {

	testServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.Contains(r.URL.Path, "image.jpg"):
			w.Header().Set("Content-Type", "image/jpeg")
			w.Write([]byte("fake-image-data"))
		case strings.Contains(r.URL.Path, "file.pdf"):
			w.Header().Set("Content-Type", "application/pdf")
			w.Write([]byte("fake-pdf-data"))
		case strings.Contains(r.URL.Path, "audio.mp3"):
			w.Header().Set("Content-Type", "audio/mpeg")
			w.Write([]byte("fake-audio-data"))
		case strings.Contains(r.URL.Path, "video.mp4"):
			w.Header().Set("Content-Type", "video/mp4")
			w.Write([]byte("fake-video-data"))
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer testServer.Close()

	tests := []struct {
		name           string
		mcMsg          *schema.Message
		setupMock      func(mock *mockImagex.MockImageX, serverURL string)
		setupEnv       func()
		cleanupEnv     func()
		expectedResult *schema.Message
	}{
		{
			name: "nil MultiContent should not be processed",
			mcMsg: &schema.Message{
				Role:         schema.User,
				Content:      "test message",
				MultiContent: nil,
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				// No mock calls expected
			},
			setupEnv:   func() {},
			cleanupEnv: func() {},
			expectedResult: &schema.Message{
				Role:         schema.User,
				Content:      "test message",
				MultiContent: nil,
			},
		},
		{
			name: "empty MultiContent should not be processed",
			mcMsg: &schema.Message{
				Role:         schema.User,
				Content:      "test message",
				MultiContent: []schema.ChatMessagePart{},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				// No mock calls expected
			},
			setupEnv:   func() {},
			cleanupEnv: func() {},
			expectedResult: &schema.Message{
				Role:         schema.User,
				Content:      "test message",
				MultiContent: []schema.ChatMessagePart{},
			},
		},
		{
			name: "ImageURL with valid URI should be processed (base64 disabled)",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "test-image-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-image-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/image.jpg",
				}, nil)
			},
			setupEnv: func() {
				os.Setenv(consts.EnableLocalFileToLLMWithBase64, "false")
			},
			cleanupEnv: func() {
				os.Unsetenv(consts.EnableLocalFileToLLMWithBase64)
			},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: "",
						},
					},
				},
			},
		},
		{
			name: "ImageURL with valid URI should be processed (base64 enabled)",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "test-image-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-image-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/image.jpg",
				}, nil)
			},
			setupEnv: func() {
				os.Setenv(consts.EnableLocalFileToLLMWithBase64, "true")
			},
			cleanupEnv: func() {
				os.Unsetenv(consts.EnableLocalFileToLLMWithBase64)
			},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL:      "data:image/jpeg;base64,ZmFrZS1pbWFnZS1kYXRh", // base64 encoded "fake-image-data"
							MIMEType: "image/jpeg",
						},
					},
				},
			},
		},
		{
			name: "ImageURL with empty URI should not be processed",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				// No mock calls expected
			},
			setupEnv:   func() {},
			cleanupEnv: func() {},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "",
						},
					},
				},
			},
		},
		{
			name: "ImageURL with GetResourceURL error should keep original",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "invalid-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"invalid-uri",
				).Return(nil, errors.New("resource not found"))
			},
			setupEnv:   func() {},
			cleanupEnv: func() {},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "invalid-uri",
						},
					},
				},
			},
		},
		// FileURL
		{
			name: "FileURL with valid URI should be processed (base64 disabled)",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URI: "test-file-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-file-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/file.pdf",
				}, nil)
			},
			setupEnv: func() {
				os.Setenv(consts.EnableLocalFileToLLMWithBase64, "false")
			},
			cleanupEnv: func() {
				os.Unsetenv(consts.EnableLocalFileToLLMWithBase64)
			},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URL: "", // 将在测试中动态设置
						},
					},
				},
			},
		},
		{
			name: "FileURL with valid URI should be processed (base64 enabled)",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URI: "test-file-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-file-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/file.pdf",
				}, nil)
			},
			setupEnv: func() {
				os.Setenv(consts.EnableLocalFileToLLMWithBase64, "true")
			},
			cleanupEnv: func() {
				os.Unsetenv(consts.EnableLocalFileToLLMWithBase64)
			},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URL:      "data:application/pdf;base64,ZmFrZS1wZGYtZGF0YQ==", // base64 encoded "fake-pdf-data"
							MIMEType: "application/pdf",
						},
					},
				},
			},
		},
		{
			name: "FileURL with GetResourceURL error should keep original",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URI: "invalid-file-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"invalid-file-uri",
				).Return(nil, errors.New("resource not found"))
			},
			setupEnv:   func() {},
			cleanupEnv: func() {},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URI: "invalid-file-uri",
						},
					},
				},
			},
		},
		// AudioURL
		{
			name: "AudioURL with valid URI should be processed (base64 disabled)",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URI: "test-audio-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-audio-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/audio.mp3",
				}, nil)
			},
			setupEnv: func() {
				os.Setenv(consts.EnableLocalFileToLLMWithBase64, "false")
			},
			cleanupEnv: func() {
				os.Unsetenv(consts.EnableLocalFileToLLMWithBase64)
			},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URL: "",
						},
					},
				},
			},
		},
		{
			name: "AudioURL with valid URI should be processed (base64 enabled)",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URI: "test-audio-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-audio-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/audio.mp3",
				}, nil)
			},
			setupEnv: func() {
				os.Setenv(consts.EnableLocalFileToLLMWithBase64, "true")
			},
			cleanupEnv: func() {
				os.Unsetenv(consts.EnableLocalFileToLLMWithBase64)
			},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URL:      "data:audio/mpeg;base64,ZmFrZS1hdWRpby1kYXRh", // base64 encoded "fake-audio-data"
							MIMEType: "audio/mpeg",
						},
					},
				},
			},
		},
		{
			name: "AudioURL with GetResourceURL error should keep original",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URI: "invalid-audio-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"invalid-audio-uri",
				).Return(nil, errors.New("resource not found"))
			},
			setupEnv:   func() {},
			cleanupEnv: func() {},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URI: "invalid-audio-uri",
						},
					},
				},
			},
		},
		// VideoURL
		{
			name: "VideoURL with valid URI should be processed (base64 disabled)",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URI: "test-video-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-video-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/video.mp4",
				}, nil)
			},
			setupEnv: func() {
				os.Setenv(consts.EnableLocalFileToLLMWithBase64, "false")
			},
			cleanupEnv: func() {
				os.Unsetenv(consts.EnableLocalFileToLLMWithBase64)
			},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URL: "",
						},
					},
				},
			},
		},
		{
			name: "VideoURL with valid URI should be processed (base64 enabled)",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URI: "test-video-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-video-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/video.mp4",
				}, nil)
			},
			setupEnv: func() {
				os.Setenv(consts.EnableLocalFileToLLMWithBase64, "true")
			},
			cleanupEnv: func() {
				os.Unsetenv(consts.EnableLocalFileToLLMWithBase64)
			},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URL:      "data:video/mp4;base64,ZmFrZS12aWRlby1kYXRh", // base64 encoded "fake-video-data"
							MIMEType: "video/mp4",
						},
					},
				},
			},
		},
		{
			name: "VideoURL with GetResourceURL error should keep original",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URI: "invalid-video-uri",
						},
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"invalid-video-uri",
				).Return(nil, errors.New("resource not found"))
			},
			setupEnv:   func() {},
			cleanupEnv: func() {},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URI: "invalid-video-uri",
						},
					},
				},
			},
		},
		// mix content types
		{
			name: "Mixed content types should be processed correctly (base64 enabled)",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "test-image-uri",
						},
					},
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URI: "test-file-uri",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "This is text content",
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-image-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/image.jpg",
				}, nil)
				mock.EXPECT().GetResourceURL(
					gomock.Any(),
					"test-file-uri",
				).Return(&imagex.ResourceURL{
					URL: serverURL + "/file.pdf",
				}, nil)
			},
			setupEnv: func() {
				os.Setenv(consts.EnableLocalFileToLLMWithBase64, "true")
			},
			cleanupEnv: func() {
				os.Unsetenv(consts.EnableLocalFileToLLMWithBase64)
			},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL:      "data:image/jpeg;base64,ZmFrZS1pbWFnZS1kYXRh",
							MIMEType: "image/jpeg",
						},
					},
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URL:      "data:application/pdf;base64,ZmFrZS1wZGYtZGF0YQ==",
							MIMEType: "application/pdf",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "This is text content",
					},
				},
			},
		},
		{
			name: "Unsupported content type should be ignored",
			mcMsg: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "This is text content",
					},
				},
			},
			setupMock: func(mock *mockImagex.MockImageX, serverURL string) {
				// No mock calls expected
			},
			setupEnv:   func() {},
			cleanupEnv: func() {},
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "This is text content",
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			mockImagexClient := mockImagex.NewMockImageX(ctrl)
			tt.setupMock(mockImagexClient, testServer.URL)

			tt.setupEnv()
			defer tt.cleanupEnv()

			ctx := context.Background()
			result := parseMessageURI(ctx, tt.mcMsg, mockImagexClient)

			if strings.Contains(tt.name, "base64 disabled") {
				for i, part := range tt.expectedResult.MultiContent {
					switch part.Type {
					case schema.ChatMessagePartTypeImageURL:
						if part.ImageURL != nil && part.ImageURL.URL == "" {
							tt.expectedResult.MultiContent[i].ImageURL.URL = testServer.URL + "/image.jpg"
						}
					case schema.ChatMessagePartTypeFileURL:
						if part.FileURL != nil && part.FileURL.URL == "" {
							tt.expectedResult.MultiContent[i].FileURL.URL = testServer.URL + "/file.pdf"
						}
					case schema.ChatMessagePartTypeAudioURL:
						if part.AudioURL != nil && part.AudioURL.URL == "" {
							tt.expectedResult.MultiContent[i].AudioURL.URL = testServer.URL + "/audio.mp3"
						}
					case schema.ChatMessagePartTypeVideoURL:
						if part.VideoURL != nil && part.VideoURL.URL == "" {
							tt.expectedResult.MultiContent[i].VideoURL.URL = testServer.URL + "/video.mp4"
						}
					}
				}
			}

			assert.Equal(t, tt.expectedResult, result)
		})
	}
}
