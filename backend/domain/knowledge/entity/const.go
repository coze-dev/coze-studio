package entity

type DocumentStatus int64

const (
	DocumentStatusInit      DocumentStatus = -1 // 初始化
	DocumentStatusUploading DocumentStatus = 0  // 上传中
	DocumentStatusEnable    DocumentStatus = 1  // 生效
	DocumentStatusDisable   DocumentStatus = 2  // 失效
	DocumentStatusDeleted   DocumentStatus = 3  // 已删除
	DocumentStatusChunking  DocumentStatus = 4  // 切片中
	// DocumentStatusRefreshing DocumentStatus = 5 // 刷新中
	DocumentStatusFailed DocumentStatus = 9 // 失败
)

func (s DocumentStatus) String() string {
	switch s {
	case DocumentStatusInit:
		return "初始化"
	case DocumentStatusUploading:
		return "上传中"
	case DocumentStatusEnable:
		return "生效"
	case DocumentStatusDisable:
		return "失效"
	case DocumentStatusDeleted:
		return "已删除"
	case DocumentStatusChunking:
		return "切片中"
	// case DocumentStatusRefreshing:
	//	return "刷新中"
	case DocumentStatusFailed:
		return "失败"
	default:
		return "未知"
	}
}

type DocumentSource int64

const (
	DocumentSourceLocal     DocumentSource = 0   // 本地文件上传
	DocumentSourceWeb       DocumentSource = 1   // url
	DocumentSourceCustom    DocumentSource = 2   // 自定义文本
	DocumentSourceFeishuWeb DocumentSource = 103 // 飞书文档
)

type WebCrawlTaskStatus int64

const (
	WebContentStatusInit    WebCrawlTaskStatus = 0
	WebContentStatusSuccess WebCrawlTaskStatus = 1
	WebContentStatusFailed  WebCrawlTaskStatus = 2
	WebContentStatusAborted WebCrawlTaskStatus = 3
)
