package builtin

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

func parseImage(config *contract.Config, model chatmodel.BaseChatModel) parseFn {
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
				return nil, fmt.Errorf("[parseImage] model generate failed: %w", err)
			}

			doc.Content = output.Content
		case contract.ImageAnnotationTypeManual:
			// do nothing
		default:
			return nil, fmt.Errorf("[parseImage] unknown image annotation type=%d", config.ParsingStrategy.ImageAnnotationType)
		}

		return []*schema.Document{doc}, nil
	}
}
