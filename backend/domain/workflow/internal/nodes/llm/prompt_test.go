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

package llm

import (
	"testing"

	"github.com/bytedance/mockey"
	"github.com/cloudwego/eino/schema"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/urltobase64url"
	"github.com/stretchr/testify/assert"
)

func TestTransformMessagePart(t *testing.T) {
	mockey.PatchConvey("TestTransformMessagePart", t, func() {
		tests := []struct {
			name                 string
			part                 schema.ChatMessagePart
			supportedModals      map[modelmgr.Modal]bool
			enableTransferBase64 bool
			expectedPart         schema.ChatMessagePart
			mockB64              bool
		}{
			{
				name: "Image modal not supported",
				part: schema.ChatMessagePart{
					Type:     schema.ChatMessagePartTypeImageURL,
					ImageURL: &schema.ChatMessageImageURL{URL: "http://example.com/image.png"},
				},
				supportedModals: map[modelmgr.Modal]bool{},
				expectedPart: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: "http://example.com/image.png",
				},
			},
			{
				name: "Image modal supported, no base64 transfer",
				part: schema.ChatMessagePart{
					Type:     schema.ChatMessagePartTypeImageURL,
					ImageURL: &schema.ChatMessageImageURL{URL: "http://example.com/image.png"},
				},
				supportedModals: map[modelmgr.Modal]bool{modelmgr.ModalImage: true},
				expectedPart: schema.ChatMessagePart{
					Type:     schema.ChatMessagePartTypeImageURL,
					ImageURL: &schema.ChatMessageImageURL{URL: "http://example.com/image.png"},
				},
			},
			{
				name: "Audio modal not supported",
				part: schema.ChatMessagePart{
					Type:     schema.ChatMessagePartTypeAudioURL,
					AudioURL: &schema.ChatMessageAudioURL{URL: "http://example.com/audio.mp3"},
				},
				supportedModals: map[modelmgr.Modal]bool{},
				expectedPart: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: "http://example.com/audio.mp3",
				},
			},
			{
				name: "Video modal not supported",
				part: schema.ChatMessagePart{
					Type:     schema.ChatMessagePartTypeVideoURL,
					VideoURL: &schema.ChatMessageVideoURL{URL: "http://example.com/video.mp4"},
				},
				supportedModals: map[modelmgr.Modal]bool{},
				expectedPart: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: "http://example.com/video.mp4",
				},
			},
			{
				name: "File modal not supported",
				part: schema.ChatMessagePart{
					Type:    schema.ChatMessagePartTypeFileURL,
					FileURL: &schema.ChatMessageFileURL{URL: "http://example.com/file.txt"},
				},
				supportedModals: map[modelmgr.Modal]bool{},
				expectedPart: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: "http://example.com/file.txt",
				},
			},
			{
				name: "Text part is unchanged",
				part: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: "hello world",
				},
				supportedModals: map[modelmgr.Modal]bool{},
				expectedPart: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: "hello world",
				},
			},
			{
				name: "Image modal supported, with base64 transfer",
				part: schema.ChatMessagePart{
					Type:     schema.ChatMessagePartTypeImageURL,
					ImageURL: &schema.ChatMessageImageURL{URL: "http://example.com/image.png"},
				},
				supportedModals:      map[modelmgr.Modal]bool{modelmgr.ModalImage: true},
				enableTransferBase64: true,
				expectedPart: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeImageURL,
					ImageURL: &schema.ChatMessageImageURL{
						URL:      "data:image/png;base64,base64encodedstring",
						MIMEType: "image/png",
					},
				},
				mockB64: true,
			},
			{
				name: "Audio modal supported, with base64 transfer",
				part: schema.ChatMessagePart{
					Type:     schema.ChatMessagePartTypeAudioURL,
					AudioURL: &schema.ChatMessageAudioURL{URL: "http://example.com/audio.mp3"},
				},
				supportedModals:      map[modelmgr.Modal]bool{modelmgr.ModalAudio: true},
				enableTransferBase64: true,
				expectedPart: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeAudioURL,
					AudioURL: &schema.ChatMessageAudioURL{
						URL:      "data:audio/mpeg;base64,base64encodedstring",
						MIMEType: "audio/mpeg",
					},
				},
				mockB64: true,
			},
			{
				name: "Video modal supported, with base64 transfer",
				part: schema.ChatMessagePart{
					Type:     schema.ChatMessagePartTypeVideoURL,
					VideoURL: &schema.ChatMessageVideoURL{URL: "http://example.com/video.mp4"},
				},
				supportedModals:      map[modelmgr.Modal]bool{modelmgr.ModalVideo: true},
				enableTransferBase64: true,
				expectedPart: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeVideoURL,
					VideoURL: &schema.ChatMessageVideoURL{
						URL:      "data:video/mp4;base64,base64encodedstring",
						MIMEType: "video/mp4",
					},
				},
				mockB64: true,
			},
			{
				name: "File modal supported, with base64 transfer",
				part: schema.ChatMessagePart{
					Type:    schema.ChatMessagePartTypeFileURL,
					FileURL: &schema.ChatMessageFileURL{URL: "http://example.com/file.txt"},
				},
				supportedModals:      map[modelmgr.Modal]bool{modelmgr.ModalFile: true},
				enableTransferBase64: true,
				expectedPart: schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeFileURL,
					FileURL: &schema.ChatMessageFileURL{
						URL:      "data:text/plain;base64,base64encodedstring",
						MIMEType: "text/plain",
					},
				},
				mockB64: true,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				if tt.mockB64 {
					t.Cleanup(mockey.UnPatchAll)
					var u, m string
					switch tt.part.Type {
					case schema.ChatMessagePartTypeImageURL:
						u, m = tt.expectedPart.ImageURL.URL, tt.expectedPart.ImageURL.MIMEType
					case schema.ChatMessagePartTypeAudioURL:
						u, m = tt.expectedPart.AudioURL.URL, tt.expectedPart.AudioURL.MIMEType
					case schema.ChatMessagePartTypeVideoURL:
						u, m = tt.expectedPart.VideoURL.URL, tt.expectedPart.VideoURL.MIMEType
					case schema.ChatMessagePartTypeFileURL:
						u, m = tt.expectedPart.FileURL.URL, tt.expectedPart.FileURL.MIMEType
					}
					mockey.Mock(urltobase64url.URLToBase64).Return(&urltobase64url.FileData{
						Base64Url: u,
						MimeType:  m,
					}, nil).Build()
				}
				result := transformMessagePart(tt.part, tt.supportedModals, tt.enableTransferBase64)
				assert.Equal(t, tt.expectedPart, result)
			})
		}
	})
}
