package entity

type WebCrawlTaskInfo struct {
	Progress     int
	Status       WebCrawlTaskStatus
	ContentUri   string
	SubPageCount int
	SubLinkUrls  []string
}
