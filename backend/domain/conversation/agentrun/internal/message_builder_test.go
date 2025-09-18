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
	"strings"
	"testing"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	mockImagex "github.com/coze-dev/coze-studio/backend/internal/mock/infra/contract/imagex"
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
			expectedResult: &schema.Message{
				Role:         schema.User,
				Content:      "test message",
				MultiContent: []schema.ChatMessagePart{},
			},
		},
		{
			name: "ImageURL with valid URI should be processed",
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
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "test-image-uri",
							URL: "",
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
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "invalid-uri",
							URL: "",
						},
					},
				},
			},
		},
		// FileURL
		{
			name: "FileURL with valid URI should be processed",
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
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URI: "test-file-uri",
							URL: "",
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
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URI: "invalid-file-uri",
							URL: "",
						},
					},
				},
			},
		},
		// AudioURL
		{
			name: "AudioURL with valid URI should be processed",
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
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URI: "test-audio-uri",
							URL: "",
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
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URI: "invalid-audio-uri",
							URL: "",
						},
					},
				},
			},
		},
		// VideoURL
		{
			name: "VideoURL with valid URI should be processed",
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
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URI: "test-video-uri",
							URL: "",
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
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URI: "invalid-video-uri",
							URL: "",
						},
					},
				},
			},
		},
		// mix content types
		{
			name: "Mixed content types should be processed correctly",
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
			expectedResult: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URI: "test-image-uri",
							URL: "",
						},
					},
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URI: "test-file-uri",
							URL: "",
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

			ctx := context.Background()
			result := parseMessageURI(ctx, tt.mcMsg, mockImagexClient)

			// For tests that expect dynamic URL setting, update expected results
			// Only set URLs for successful cases (where mock returns no error)
			if !strings.Contains(tt.name, "error") {
				for i, part := range tt.expectedResult.MultiContent {
					switch part.Type {
					case schema.ChatMessagePartTypeImageURL:
						if part.ImageURL != nil && part.ImageURL.URL == "" && part.ImageURL.URI != "" {
							tt.expectedResult.MultiContent[i].ImageURL.URL = testServer.URL + "/image.jpg"
						}
					case schema.ChatMessagePartTypeFileURL:
						if part.FileURL != nil && part.FileURL.URL == "" && part.FileURL.URI != "" {
							tt.expectedResult.MultiContent[i].FileURL.URL = testServer.URL + "/file.pdf"
						}
					case schema.ChatMessagePartTypeAudioURL:
						if part.AudioURL != nil && part.AudioURL.URL == "" && part.AudioURL.URI != "" {
							tt.expectedResult.MultiContent[i].AudioURL.URL = testServer.URL + "/audio.mp3"
						}
					case schema.ChatMessagePartTypeVideoURL:
						if part.VideoURL != nil && part.VideoURL.URL == "" && part.VideoURL.URI != "" {
							tt.expectedResult.MultiContent[i].VideoURL.URL = testServer.URL + "/video.mp4"
						}
					}
				}
			}

			assert.Equal(t, tt.expectedResult, result)
		})
	}
}
