package llm_based

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/schema"
)

func TestRewrite(t *testing.T) {
	rewriter := NewRewriter(nil, "")
	RewrittenQuery, err := rewriter.QueryRewriter(context.Background(), "多少钱一斤", []*schema.Message{
		{
			Role:    "user",
			Content: "苹果真好吃",
		},
	})
	t.Log(err)
	t.Log(RewrittenQuery)
}
