package es

import (
	"encoding/json"
	"io"
)

type BulkIndexerItem struct {
	Index           string
	Action          string
	DocumentID      string
	Routing         string
	Version         *int64
	VersionType     string
	Body            io.ReadSeeker
	RetryOnConflict *int
}

type Request struct {
	Size        *int
	Query       *Query
	MinScore    *float64
	Sort        []SortFiled
	SearchAfter []any
}

type SortFiled struct {
	Field string
	Asc   bool
}

type Response struct {
	Hits     HitsMetadata `json:"hits"`
	MaxScore *float64     `json:"max_score,omitempty"`
}

type HitsMetadata struct {
	Hits     []Hit    `json:"hits"`
	MaxScore *float64 `json:"max_score,omitempty"`
}

type Hit struct {
	Id_     *string         `json:"_id,omitempty"`
	Score_  *float64        `json:"_score,omitempty"`
	Source_ json.RawMessage `json:"_source,omitempty"`
}
