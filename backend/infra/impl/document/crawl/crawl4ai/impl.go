package crawl4ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"os/exec"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/crawl"
	"github.com/coze-dev/coze-studio/backend/pkg/goutil"
)

func NewCrawl4ai() crawl.Crawler {
	return &crawl4ai{}
}

type crawl4ai struct{}

func (c *crawl4ai) Crawl(ctx context.Context, url string, opts crawl.CrawlOptions) (*crawl.CrawlResult, error) {
	if !IsUrl(url) {
		return nil, fmt.Errorf("invalid url: %s", url)
	}
	cmd := exec.Command(goutil.GetPython3Path(), "crawl.py", url)
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out
	r, w, err := os.Pipe()
	if err != nil {
		return nil, fmt.Errorf("create pipe error: %w", err)
	}

	cmd.ExtraFiles = []*os.File{w}
	err = cmd.Start()
	if err != nil {
		return nil, err
	}
	err = w.Close()
	if err != nil {
		return nil, fmt.Errorf("close write pipe error: %w", err)
	}
	var result crawl.CrawlResult
	err = json.NewDecoder(r).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("json unmarshal error: %w", err)
	}

	if result.Error != "" {
		return &result, fmt.Errorf("crawl error: %s", result.Error)
	}
	internalLinks := []string{}
	for i := range result.InternalLinks {
		if IsUrl(result.InternalLinks[i]) {
			internalLinks = append(internalLinks, result.InternalLinks[i])
		}
	}
	externalLinks := []string{}
	for i := range result.ExternalLinks {
		if IsUrl(result.ExternalLinks[i]) {
			externalLinks = append(externalLinks, result.ExternalLinks[i])
		}
	}
	result.InternalLinks = internalLinks
	result.ExternalLinks = externalLinks
	return &result, nil
}
func IsUrl(str string) bool {
	u, err := url.Parse(str)
	return err == nil && u.Scheme != "" && u.Host != ""
}
