package entity

import "github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"

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
	LarkExtra    *LarkExtra
}

type WebCrawlTask struct {
	TaskID int64
	Source DocumentSource
}

type LarkExtra struct {
	FileType     dataconnector.FileType
	FileNodeType dataconnector.FileNodeType
}
