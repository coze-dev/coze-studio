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

package agentflow

import (
	"testing"

	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/infra/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/modelmgr"
)

// createTestModel creates a test model with the given input modals
func createTestModel(inputModals []modelmgr.Modal) *modelmgr.Model {
	enableBase64 := false
	return &modelmgr.Model{
		Meta: modelmgr.ModelMeta{
			Capability: &modelmgr.Capability{
				InputModal: inputModals,
			},
			ConnConfig: &chatmodel.Config{
				EnableBase64Url: &enableBase64,
			},
		},
	}
}

func TestAgentRunner_preHandlerInput(t *testing.T) {
	tests := []struct {
		name           string
		runner         *AgentRunner
		input          *schema.Message
		expectedResult *schema.Message
	}{
		{
			name: "nil MultiContent should not be processed",
			runner: &AgentRunner{
				modelInfo: createTestModel([]modelmgr.Modal{modelmgr.ModalText}),
			},
			input: &schema.Message{
				Role:         schema.User,
				Content:      "test message",
				MultiContent: nil,
			},
			expectedResult: &schema.Message{
				Role:         schema.User,
				Content:      "test message",
				MultiContent: nil,
			},
		},
		{
			name: "empty MultiContent should not be processed",
			runner: &AgentRunner{
				modelInfo: createTestModel([]modelmgr.Modal{modelmgr.ModalText}),
			},
			input: &schema.Message{
				Role:         schema.User,
				Content:      "test message",
				MultiContent: []schema.ChatMessagePart{},
			},
			expectedResult: &schema.Message{
				Role:         schema.User,
				Content:      "test message",
				MultiContent: []schema.ChatMessagePart{},
			},
		},
		{
			name: "supported image should be kept in MultiContent",
			runner: &AgentRunner{
				modelInfo: createTestModel([]modelmgr.Modal{modelmgr.ModalText, modelmgr.ModalImage}),
			},
			input: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: "http://example.com/image.jpg",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "What's in this image?",
					},
				},
			},
			expectedResult: &schema.Message{
				Role:    schema.User,
				Content: "",
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: "http://example.com/image.jpg",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "What's in this image?",
					},
				},
			},
		},
		{
			name: "unsupported image should be converted to text",
			runner: &AgentRunner{
				modelInfo: createTestModel([]modelmgr.Modal{modelmgr.ModalText}), // Only text supported
			},
			input: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: "http://example.com/image.jpg",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "What's in this image?",
					},
				},
			},
			expectedResult: &schema.Message{
				Role:         schema.User,
				Content:      "What's in this image?  this is a image:http://example.com/image.jpg",
				MultiContent: nil,
			},
		},
		{
			name: "mixed supported and unsupported content types",
			runner: &AgentRunner{
				modelInfo: createTestModel([]modelmgr.Modal{modelmgr.ModalText, modelmgr.ModalImage}), // Image supported, file not
			},
			input: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: "http://example.com/image.jpg",
						},
					},
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URL: "http://example.com/document.pdf",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "Analyze this image and document",
					},
				},
			},
			expectedResult: &schema.Message{
				Role:    schema.User,
				Content: "",
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: "http://example.com/image.jpg",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "Analyze this image and document  this is a file:http://example.com/document.pdf",
					},
				},
			},
		},
		{
			name: "all media types unsupported - text only model",
			runner: &AgentRunner{
				modelInfo: createTestModel([]modelmgr.Modal{modelmgr.ModalText}), // Only text supported
			},
			input: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: "http://example.com/image.jpg",
						},
					},
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URL: "http://example.com/document.pdf",
						},
					},
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URL: "http://example.com/audio.mp3",
						},
					},
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URL: "http://example.com/video.mp4",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "Process all these media files",
					},
				},
			},
			expectedResult: &schema.Message{
				Role:         schema.User,
				Content:      "Process all these media files  this is a image:http://example.com/image.jpg  this is a file:http://example.com/document.pdf  this is a audio:http://example.com/audio.mp3  this is a video:http://example.com/video.mp4",
				MultiContent: nil,
			},
		},
		{
			name: "all media types supported - multimodal model",
			runner: &AgentRunner{
				modelInfo: createTestModel([]modelmgr.Modal{
					modelmgr.ModalText,
					modelmgr.ModalImage,
					modelmgr.ModalFile,
					modelmgr.ModalAudio,
					modelmgr.ModalVideo,
				}),
			},
			input: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: "http://example.com/image.jpg",
						},
					},
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URL: "http://example.com/document.pdf",
						},
					},
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URL: "http://example.com/audio.mp3",
						},
					},
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URL: "http://example.com/video.mp4",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "Process all these media files",
					},
				},
			},
			expectedResult: &schema.Message{
				Role:    schema.User,
				Content: "",
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: "http://example.com/image.jpg",
						},
					},
					{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URL: "http://example.com/document.pdf",
						},
					},
					{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URL: "http://example.com/audio.mp3",
						},
					},
					{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URL: "http://example.com/video.mp4",
						},
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "Process all these media files",
					},
				},
			},
		},
		{
			name: "unknown content type should be kept",
			runner: &AgentRunner{
				modelInfo: createTestModel([]modelmgr.Modal{modelmgr.ModalText}),
			},
			input: &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: "unknown_type", // Unknown type
						Text: "unknown content",
					},
					{
						Type: schema.ChatMessagePartTypeText,
						Text: "normal text",
					},
				},
			},
			expectedResult: &schema.Message{
				Role:    schema.User,
				Content: "normal text",
				MultiContent: []schema.ChatMessagePart{
					{
						Type: "unknown_type",
						Text: "unknown content",
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.runner.preHandlerInput(tt.input)
			assert.Equal(t, tt.expectedResult, result)
		})
	}
}

func TestAgentRunner_concatContentString(t *testing.T) {
	tests := []struct {
		name             string
		textContent      string
		unSupportTypeURL []schema.ChatMessagePart
		expectedResult   string
	}{
		{
			name:             "empty unsupported types should return original text",
			textContent:      "original text",
			unSupportTypeURL: []schema.ChatMessagePart{},
			expectedResult:   "original text",
		},
		{
			name:        "single image URL should be appended",
			textContent: "original text",
			unSupportTypeURL: []schema.ChatMessagePart{
				{
					Type: schema.ChatMessagePartTypeImageURL,
					ImageURL: &schema.ChatMessageImageURL{
						URL: "http://example.com/image.jpg",
					},
				},
			},
			expectedResult: "original text  this is a image:http://example.com/image.jpg",
		},
		{
			name:        "multiple media types should be appended",
			textContent: "original text",
			unSupportTypeURL: []schema.ChatMessagePart{
				{
					Type: schema.ChatMessagePartTypeImageURL,
					ImageURL: &schema.ChatMessageImageURL{
						URL: "http://example.com/image.jpg",
					},
				},
				{
					Type: schema.ChatMessagePartTypeFileURL,
					FileURL: &schema.ChatMessageFileURL{
						URL: "http://example.com/document.pdf",
					},
				},
				{
					Type: schema.ChatMessagePartTypeAudioURL,
					AudioURL: &schema.ChatMessageAudioURL{
						URL: "http://example.com/audio.mp3",
					},
				},
				{
					Type: schema.ChatMessagePartTypeVideoURL,
					VideoURL: &schema.ChatMessageVideoURL{
						URL: "http://example.com/video.mp4",
					},
				},
			},
			expectedResult: "original text  this is a image:http://example.com/image.jpg  this is a file:http://example.com/document.pdf  this is a audio:http://example.com/audio.mp3  this is a video:http://example.com/video.mp4",
		},
		{
			name:        "unknown type should be ignored",
			textContent: "original text",
			unSupportTypeURL: []schema.ChatMessagePart{
				{
					Type: "unknown_type",
					Text: "unknown content",
				},
			},
			expectedResult: "original text",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := concatContentString(tt.textContent, tt.unSupportTypeURL)
			assert.Equal(t, tt.expectedResult, result)
		})
	}
}
