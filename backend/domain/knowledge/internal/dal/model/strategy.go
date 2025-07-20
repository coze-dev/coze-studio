package model

import "github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"

type DocumentParseRule struct {
	ParsingStrategy  *entity.ParsingStrategy  `json:"parsing_strategy"`
	ChunkingStrategy *entity.ChunkingStrategy `json:"chunking_strategy"`
}
