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

package conversation

import (
	"testing"

	"github.com/cloudwego/eino/schema"

	"github.com/stretchr/testify/assert"

	apimessage "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func Test_convertMessage(t *testing.T) {
	type args struct {
		lr *entity.ListResult
	}
	tests := []struct {
		name    string
		args    args
		want    *conversation.MessageListResponse
		wantErr bool
	}{
		{
			name: "pure text",
			args: args{
				lr: &entity.ListResult{
					Messages: []*entity.Message{
						{
							ID:   1,
							Role: schema.User,

							ContentType: "text",
							MultiContent: []*apimessage.InputMetaData{
								{
									Type: "text",
									Text: "hello",
								},
							},
						},
					},
				},
			},
			want: &conversation.MessageListResponse{
				Messages: []*conversation.Message{
					{
						ID:   1,
						Role: schema.User,

						ContentType: "text",
						MultiContent: []*conversation.Content{
							{Type: "text", Text: ptr.Of("hello")},
						},
					},
				},
			},
		},
		{
			name: "pure file",
			args: args{
				lr: &entity.ListResult{
					Messages: []*entity.Message{
						{
							ID:   2,
							Role: schema.User,

							ContentType: "file",
							MultiContent: []*apimessage.InputMetaData{
								{
									Type: "file",
									FileData: []*apimessage.FileData{
										{
											URI: "f_uri_1",
										},
									},
								},
								{
									Type: "text",
									Text: "",
								},
							},
						},
					},
				},
			},
			want: &conversation.MessageListResponse{
				Messages: []*conversation.Message{
					{
						ID:          2,
						Role:        schema.User,
						ContentType: "file",
						MultiContent: []*conversation.Content{
							{Type: "file", Uri: ptr.Of("f_uri_1")},
							{Type: "text", Text: ptr.Of("")},
						},
					},
				},
			},
		},
		{
			name: "text and file",
			args: args{
				lr: &entity.ListResult{
					Messages: []*entity.Message{
						{
							ID:   3,
							Role: schema.User,

							ContentType: "text_file",
							MultiContent: []*apimessage.InputMetaData{
								{
									Type: "text",
									Text: "hello",
								},
								{
									Type: "file",
									FileData: []*apimessage.FileData{
										{
											URI: "f_uri_2",
										},
									},
								},
							},
						},
					},
				},
			},
			want: &conversation.MessageListResponse{
				Messages: []*conversation.Message{
					{
						ID:          3,
						Role:        schema.User,
						ContentType: "text_file",
						MultiContent: []*conversation.Content{
							{Type: "text", Text: ptr.Of("hello")},
							{Type: "file", Uri: ptr.Of("f_uri_2")},
						},
					},
				},
			},
		},
		{
			name: "multiple files",
			args: args{
				lr: &entity.ListResult{
					Messages: []*entity.Message{
						{
							ID: 4,

							Role: schema.User,

							ContentType: "file",
							MultiContent: []*apimessage.InputMetaData{
								{
									Type: "file",
									FileData: []*apimessage.FileData{
										{
											URI: "f_uri_3",
										},
										{
											URI: "f_uri_4",
										},
									},
								},
								{
									Type: "text",
									Text: "",
								},
							},
						},
					},
				},
			},
			want: &conversation.MessageListResponse{
				Messages: []*conversation.Message{
					{
						ID:          4,
						Role:        schema.User,
						ContentType: "file",
						MultiContent: []*conversation.Content{
							{Type: "file", Uri: ptr.Of("f_uri_3")},
							{Type: "file", Uri: ptr.Of("f_uri_4")},
							{Type: "text", Text: ptr.Of("")},
						},
					},
				},
			},
		},
		{
			name: "empty text",
			args: args{
				lr: &entity.ListResult{
					Messages: []*entity.Message{
						{
							ID:   5,
							Role: schema.User,

							ContentType: "text",
							MultiContent: []*apimessage.InputMetaData{
								{
									Type: "text",
									Text: "",
								},
							},
						},
					},
				},
			},
			want: &conversation.MessageListResponse{
				Messages: []*conversation.Message{
					{
						ID:   5,
						Role: schema.User,

						ContentType: "text",
						MultiContent: []*conversation.Content{
							{Type: "text", Text: ptr.Of("")},
						},
					},
				},
			},
		},
		{
			name: "pure image",
			args: args{
				lr: &entity.ListResult{
					Messages: []*entity.Message{
						{
							ID:   6,
							Role: schema.User,

							ContentType: "image",
							MultiContent: []*apimessage.InputMetaData{
								{
									Type: "image",
									FileData: []*apimessage.FileData{
										{
											URI: "image_uri_5",
										},
									},
								},
								{
									Type: "text",
									Text: "",
								},
							},
						},
					},
				},
			},
			want: &conversation.MessageListResponse{
				Messages: []*conversation.Message{
					{
						ID:   6,
						Role: schema.User,

						ContentType: "image",
						MultiContent: []*conversation.Content{
							{Type: "image", Uri: ptr.Of("image_uri_5")},
							{Type: "text", Text: ptr.Of("")},
						},
					},
				},
			},
		},
		{
			name: "multiple images",
			args: args{
				lr: &entity.ListResult{
					Messages: []*entity.Message{
						{
							ID:   7,
							Role: schema.User,

							ContentType: "image",
							MultiContent: []*apimessage.InputMetaData{
								{
									Type: "image",
									FileData: []*apimessage.FileData{
										{
											URI: "file_id_6",
										},
										{
											URI: "file_id_7",
										},
									},
								},
								{
									Type: "text",
									Text: "",
								},
							},
						},
					},
				},
			},
			want: &conversation.MessageListResponse{
				Messages: []*conversation.Message{
					{
						ID:   7,
						Role: schema.User,

						ContentType: "image",
						MultiContent: []*conversation.Content{
							{Type: "image", Uri: ptr.Of("file_id_6")},
							{Type: "image", Uri: ptr.Of("file_id_7")},
							{Type: "text", Text: ptr.Of("")},
						},
					},
				},
			},
		},
		{
			name: "mixed content",
			args: args{
				lr: &entity.ListResult{
					Messages: []*entity.Message{
						{
							ID:   8,
							Role: schema.User,

							ContentType: "mix",
							MultiContent: []*apimessage.InputMetaData{
								{
									Type: "text",
									Text: "hello",
								},
								{
									Type: "image",
									FileData: []*apimessage.FileData{
										{
											URI: "file_id_8",
										},
									},
								},
								{
									Type: "file",
									FileData: []*apimessage.FileData{
										{
											URI: "file_id_9",
										},
									},
								},
							},
						},
					},
				},
			},
			want: &conversation.MessageListResponse{
				Messages: []*conversation.Message{
					{
						ID:   8,
						Role: schema.User,

						ContentType: "mix",
						MultiContent: []*conversation.Content{
							{Type: "text", Text: ptr.Of("hello")},
							{Type: "image", Uri: ptr.Of("file_id_8")},
							{Type: "file", Uri: ptr.Of("file_id_9")},
						},
					},
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			msgs, err := convertMessage(tt.args.lr.Messages)
			if (err != nil) != tt.wantErr {
				t.Errorf("convertMessage() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			for i, msg := range msgs {
				assert.Equal(t, msg.MultiContent, tt.want.Messages[i].MultiContent)
			}

		})
	}
}
