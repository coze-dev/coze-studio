package crawl4ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os/exec"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/crawl"
	"code.byted.org/flow/opencoze/backend/pkg/goutil"
)

func NewCrawl4ai() crawl.Crawler {
	return &crawl4ai{}
}

type crawl4ai struct{}

func (c *crawl4ai) Crawl(ctx context.Context, url string, opts crawl.CrawlOptions) (*crawl.CrawlResult, error) {
	cmd := exec.Command(goutil.GetPython3Path(), "crawl.py", url)
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out

	err := cmd.Run()
	if err != nil {
		return nil, fmt.Errorf("python script error: %v output: %s", err, out.String())
	}

	var result crawl.CrawlResult
	if err := json.Unmarshal(out.Bytes(), &result); err != nil {
		return nil, fmt.Errorf("json unmarshal error: %w", err)
	}

	if result.Error != "" {
		return &result, fmt.Errorf("crawl error: %s", result.Error)
	}

	return &result, nil
}
