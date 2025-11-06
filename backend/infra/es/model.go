/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
	From        *int
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
	// Total Total hit count information, present only if `track_total_hits` wasn't
	// `false` in the search request.
	Total *TotalHits `json:"total,omitempty"`
}

type Hit struct {
	Id_     *string         `json:"_id,omitempty"`
	Score_  *float64        `json:"_score,omitempty"`
	Source_ json.RawMessage `json:"_source,omitempty"`
}

type TotalHits struct {
	Relation TotalHitsRelation `json:"relation"`
	Value    int64             `json:"value"`
}

type TotalHitsRelation struct {
	Name string
}
