package builtin

import (
	"context"
	"io"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/imageunderstand"
	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
)

func parseImage(config *contract.Config, imageUnderstand imageunderstand.ImageUnderstand) parseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		options := parser.GetCommonOptions(&parser.Options{ExtraMeta: map[string]any{}}, opts...)
		imageData, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}
		var imageContent string
		if config.ParsingStrategy.CaptionType == contract.CaptionType_Auto {
			imageContent, err = imageUnderstand.ImageUnderstand(ctx, imageData)
			if err != nil {
				return nil, err
			}
		}
		doc := &schema.Document{
			Content:  imageContent,
			MetaData: map[string]any{},
		}
		for k, v := range options.ExtraMeta {
			doc.MetaData[k] = v
		}
		return []*schema.Document{doc}, nil
	}
}
