package crawl4ai

import (
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/crawl"
)

func TestCrawl(t *testing.T) {
	crawler := NewCrawl4ai()
	res, err := crawler.Crawl(context.Background(), "https://www.7k7k.com", crawl.CrawlOptions{})
	assert.NoError(t, err)
	fmt.Println(res)
}
