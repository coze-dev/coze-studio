package crawl4ai

import (
	"context"
	"fmt"
	"testing"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/crawl"
	"github.com/stretchr/testify/assert"
)

func TestCrawl(t *testing.T) {
	crawler := NewCrawl4ai()
	res, err := crawler.Crawl(context.Background(), "https://www.baidu.com", crawl.CrawlOptions{})
	assert.NoError(t, err)
	fmt.Println(res)
}
