package model

import "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"

type DocumentParseRule struct {
	ParsingStrategy  *entity.ParsingStrategy  `json:"parsing_strategy"`
	ChunkingStrategy *entity.ChunkingStrategy `json:"chunking_strategy"`
}
