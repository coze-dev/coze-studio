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

package schema

import (
	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type FieldStreamType string

const (
	FieldIsStream    FieldStreamType = "yes"     // absolutely a stream
	FieldNotStream   FieldStreamType = "no"      // absolutely not a stream
	FieldMaybeStream FieldStreamType = "maybe"   // maybe a stream, requires request-time resolution
	FieldSkipped     FieldStreamType = "skipped" // the field source's node is skipped
)

type FieldSkipStatus string

// SourceInfo contains stream type for a input field source of a node.
type SourceInfo struct {
	// IsIntermediate means this field is itself not a field source, but a map containing one or more field sources.
	IsIntermediate bool
	// FieldType the stream type of the field. May require request-time resolution in addition to compile-time.
	FieldType FieldStreamType
	// FromNodeKey is the node key that produces this field source. empty if the field is a static value or variable.
	FromNodeKey vo.NodeKey
	// FromPath is the path of this field source within the source node. empty if the field is a static value or variable.
	FromPath compose.FieldPath
	TypeInfo *vo.TypeInfo
	// SubSources are SourceInfo for keys within this intermediate Map(Object) field.
	SubSources map[string]*SourceInfo
}

func (s *SourceInfo) Skipped() bool {
	if !s.IsIntermediate {
		return s.FieldType == FieldSkipped
	}

	for _, sub := range s.SubSources {
		if !sub.Skipped() {
			return false
		}
	}

	return true
}

func (s *SourceInfo) FromNode(nodeKey vo.NodeKey) bool {
	if !s.IsIntermediate {
		return s.FromNodeKey == nodeKey
	}

	for _, sub := range s.SubSources {
		if sub.FromNode(nodeKey) {
			return true
		}
	}

	return false
}
