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

package builtin

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/bizpkg/llm/modelbuilder"
	contract "github.com/coze-dev/coze-studio/backend/infra/document/parser"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func ParseImage(config *contract.Config, model modelbuilder.BaseChatModel) ParseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		options := parser.GetCommonOptions(&parser.Options{}, opts...)
		doc := &schema.Document{
			MetaData: map[string]any{},
		}
		for k, v := range options.ExtraMeta {
			doc.MetaData[k] = v
		}

		switch config.ParsingStrategy.ImageAnnotationType {
		case contract.ImageAnnotationTypeModel:
			if model == nil {
				return nil, errorx.New(errno.ErrKnowledgeNonRetryableCode, errorx.KV("reason", "model is not provided"))
			}

			bytes, err := io.ReadAll(reader)
			if err != nil {
				return nil, err
			}

			b64 := base64.StdEncoding.EncodeToString(bytes)
			mime := fmt.Sprintf("image/%s", config.FileExtension)
			url := fmt.Sprintf("data:%s;base64,%s", mime, b64)

			input := &schema.Message{
				Role: schema.User,
				MultiContent: []schema.ChatMessagePart{
					{
						Type: schema.ChatMessagePartTypeText,
						//Text: "Give a short description of the image.", // TODO: prompt in current language
						Text: "简短描述下这张图片",
					},
					{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL:      url,
							MIMEType: mime,
						},
					},
				},
			}

			output, err := model.Generate(ctx, []*schema.Message{input})
			if err != nil {
				return nil, fmt.Errorf("[ParseImage] model generate failed: %w", err)
			}

			doc.Content = output.Content
		case contract.ImageAnnotationTypeManual:
			// do nothing
		default:
			return nil, fmt.Errorf("[ParseImage] unknown image annotation type=%d", config.ParsingStrategy.ImageAnnotationType)
		}

		return []*schema.Document{doc}, nil
	}
}
