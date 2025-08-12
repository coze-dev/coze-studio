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
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/cloudwego/eino/schema"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func ConvertMessageToString(ctx context.Context, msg *conversation.Message) (string, error) {
	if msg.MultiContent != nil {
		var textContents []string
		var otherContents []string
		for _, m := range msg.MultiContent {
			if m.Text != nil {
				textContents = append(textContents, ptr.From(m.Text))
			} else if m.Uri != nil {
				url, err := workflow.GetRepository().GetObjectUrl(ctx, ptr.From(m.Uri))
				if err != nil {
					return "", err
				}
				otherContents = append(otherContents, url)
			}
		}

		var allParts []string
		if len(textContents) > 0 {
			allParts = append(allParts, textContents...)
		}
		if len(otherContents) > 0 {
			allParts = append(allParts, otherContents...)
		}
		return strings.Join(allParts, ","), nil
	} else if msg.Text != nil {
		return ptr.From(msg.Text), nil
	} else {
		return "", vo.WrapError(errno.ErrInvalidParameter, errors.New("message is invalid"))
	}
}

func ConvertMessageToSchema(ctx context.Context, msg *conversation.Message) (*schema.Message, error) {
	schemaMsg := &schema.Message{}

	switch msg.Role {
	case schema.User:
		schemaMsg.Role = schema.User
	case schema.Assistant:
		schemaMsg.Role = schema.Assistant
	default:
		return nil, fmt.Errorf("unknown role: %s", string(msg.Role))
	}

	if msg.Text != nil {
		schemaMsg.Content = *msg.Text
		return schemaMsg, nil
	}

	if len(msg.MultiContent) > 0 {
		multiContent := make([]schema.ChatMessagePart, 0, len(msg.MultiContent))
		for _, part := range msg.MultiContent {
			schemaPart, err := convertContentPart(ctx, part)
			if err != nil {
				logs.CtxErrorf(ctx, "failed to convert content part, err: %v", err)
				continue
			}
			multiContent = append(multiContent, schemaPart)
		}
		schemaMsg.MultiContent = multiContent
		return schemaMsg, nil
	}

	return nil, fmt.Errorf("message has no content")
}

func convertContentPart(ctx context.Context, part *conversation.Content) (schema.ChatMessagePart, error) {
	schemaPart := schema.ChatMessagePart{}
	uri := ""
	if part.Uri != nil {
		uri = *part.Uri
	}

	switch part.Type {
	case message.InputTypeText:
		schemaPart.Type = schema.ChatMessagePartTypeText
		if part.Text == nil || *part.Text == "" {
			return schema.ChatMessagePart{}, fmt.Errorf("text is empty for text content part type")
		}
		schemaPart.Text = *part.Text
	case message.InputTypeImage:
		schemaPart.Type = schema.ChatMessagePartTypeImageURL
		url, err := workflow.GetRepository().GetObjectUrl(ctx, uri)
		if err != nil {
			return schema.ChatMessagePart{}, fmt.Errorf("failed to get object url: %w", err)
		}
		schemaPart.ImageURL = &schema.ChatMessageImageURL{URL: url}
	case message.InputTypeAudio:
		schemaPart.Type = schema.ChatMessagePartTypeAudioURL
		url, err := workflow.GetRepository().GetObjectUrl(ctx, uri)
		if err != nil {
			return schema.ChatMessagePart{}, fmt.Errorf("failed to get object url: %w", err)
		}
		schemaPart.AudioURL = &schema.ChatMessageAudioURL{URL: url}
	case message.InputTypeVideo:
		schemaPart.Type = schema.ChatMessagePartTypeVideoURL
		url, err := workflow.GetRepository().GetObjectUrl(ctx, uri)
		if err != nil {
			return schema.ChatMessagePart{}, fmt.Errorf("failed to get object url: %w", err)
		}
		schemaPart.VideoURL = &schema.ChatMessageVideoURL{URL: url}
	case message.InputTypeFile:
		schemaPart.Type = schema.ChatMessagePartTypeFileURL
		url, err := workflow.GetRepository().GetObjectUrl(ctx, uri)
		if err != nil {
			return schema.ChatMessagePart{}, fmt.Errorf("failed to get object url: %w", err)
		}
		schemaPart.FileURL = &schema.ChatMessageFileURL{URL: url}
	default:
		return schema.ChatMessagePart{}, fmt.Errorf("unknown content part type: %s", part.Type)
	}

	if schemaPart.Type != schema.ChatMessagePartTypeText && uri == "" {
		return schema.ChatMessagePart{}, fmt.Errorf("uri is empty for non-text content part type %s", part.Type)
	}

	return schemaPart, nil
}
