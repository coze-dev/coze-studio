package crawl

import "context"

type CrawlResult struct {
	Title   string   `json:"title"`
	Content string   `json:"content"`
	SubURLs []string `json:"sub_urls,omitempty"`
	Error   string   `json:"error,omitempty"`
}

type CrawlOptions struct {
	NeedSubURLs bool
}

type Crawler interface {
	Crawl(ctx context.Context, url string, opts CrawlOptions) (*CrawlResult, error)
}
