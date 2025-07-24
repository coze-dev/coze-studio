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
	FileID       string
	AuthID       int64
	FileSize     int64
	LarkFileType *int32
}

type WebCrawlTask struct {
	TaskID int64
	Source DocumentSource
}
