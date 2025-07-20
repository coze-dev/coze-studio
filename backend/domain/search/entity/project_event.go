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

package entity

type OpType string

const (
	Created OpType = "created"
	Updated OpType = "updated"
	Deleted OpType = "deleted"
)

type ProjectDomainEvent struct {
	OpType  OpType           `json:"op_type"`
	Project *ProjectDocument `json:"project_document,omitempty"`
	Meta    *EventMeta       `json:"meta,omitempty"`
	Extra   map[string]any   `json:"extra"`
}

type EventMeta struct {
	SendTimeMs    int64 `json:"send_time_ms"`
	ReceiveTimeMs int64 `json:"receive_time_ms"`
}
