package intentrecognition

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type IntentRecognizer interface {
	Recognize(ctx context.Context, messages []*schema.Message) (*schema.Message, error)
}
