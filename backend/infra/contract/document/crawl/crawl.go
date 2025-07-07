package crawl

import "context"

type CrawlResult struct {
	Content       string   `json:"content"`
	InternalLinks []string `json:"internal,omitempty"`
	ExternalLinks []string `json:"external,omitempty"`
	Error         string   `json:"error,omitempty"`
}

type CrawlOptions struct {
	NeedSubURLs bool
}

type Crawler interface {
	Crawl(ctx context.Context, url string, opts CrawlOptions) (*CrawlResult, error)
}
