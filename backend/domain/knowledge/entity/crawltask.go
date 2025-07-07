package entity

type WebCrawlTaskResp struct {
	Title        string
	Progress     int
	URL          string
	Status       WebCrawlTaskStatus
	ContentUri   string
	SubPageCount int
	SubLinkUrls  []string
	FailReason   string
}

type WebCrawlTask struct {
	TaskID int64
	Source DocumentSource
}
