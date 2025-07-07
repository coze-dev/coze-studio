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
<<<<<<< HEAD
	res, err := crawler.Crawl(context.Background(), "https://www.baidu.com", crawl.CrawlOptions{})
=======
	res, err := crawler.Crawl(context.Background(), "https://www.7k7k.com", crawl.CrawlOptions{})
>>>>>>> ebdecfc9490e2cecac3448adf102cc7568f64a8b
	assert.NoError(t, err)
	fmt.Println(res)
}
