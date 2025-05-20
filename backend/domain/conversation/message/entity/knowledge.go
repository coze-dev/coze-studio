package entity

type VerboseInfo struct {
	MessageType string `json:"msg_type"`
	Data        string `json:"data"`
}

type VerboseData struct {
	Chunks     []RecallDataInfo `json:"chunks"`
	OriReq     string           `json:"ori_req"`
	StatusCode int              `json:"status_code"`
}

type RecallDataInfo struct {
	Slice string   `json:"slice"`
	Score float64  `json:"score"`
	Meta  MetaInfo `json:"meta"`
}

type MetaInfo struct {
	Dataset  DatasetInfo  `json:"dataset"`
	Document DocumentInfo `json:"document"`
	Link     LinkInfo     `json:"link"`
	Card     CardInfo     `json:"card"`
}

type DatasetInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type DocumentInfo struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	FormatType int32  `json:"format_type"`
	SourceType int32  `json:"source_type"`
}

type LinkInfo struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type CardInfo struct {
	Title string `json:"title"`
	Con   string `json:"con"`
	Index string `json:"index"`
}
