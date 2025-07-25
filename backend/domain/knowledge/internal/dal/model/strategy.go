package model

import "code.byted.org/data_edc/workflow_engine_next/domain/knowledge/entity"

type DocumentParseRule struct {
	ParsingStrategy  *entity.ParsingStrategy  `json:"parsing_strategy"`
	ChunkingStrategy *entity.ChunkingStrategy `json:"chunking_strategy"`
}
