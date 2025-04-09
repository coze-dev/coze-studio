package entity

type RetrievalStrategy struct {
	TopK      *int64   // 1-10 default 3
	MinScore  *float64 // 0.01-0.99 default 0.5
	MaxTokens *int64

	SelectType         SelectType // 调用方式
	SearchType         SearchType // 搜索策略
	EnableQueryRewrite bool
	EnableRerank       bool
	EnableNL2SQL       bool

	Extra map[string]string
}

// ParsingStrategy for document parse before indexing
type ParsingStrategy struct {
	ExtractImage bool `json:"extract_image"` // 提取图片元素
	ExtractTable bool `json:"extract_table"` // 提取表格元素
	ImageOCR     bool `json:"image_ocr"`     // 图片 ocr
}

// ChunkingStrategy for document chunk before indexing
type ChunkingStrategy struct {
	ChunkType ChunkType `json:"chunk_type"`

	// custom chunk config
	ChunkSize       int64  `json:"chunk_size"` // 分段最大长度
	Separator       string `json:"separator"`  // 分段标识符
	Overlap         int64  `json:"overlap"`    // 分段重叠
	TrimSpace       bool   `json:"trim_space"`
	TrimURLAndEmail bool   `json:"trim_url_and_email"`

	// 按层级分段
	MaxDepth  int64 `json:"max_depth"`  // 按层级分段时的最大层级
	SaveTitle bool  `json:"save_title"` // 保留层级标题
}
