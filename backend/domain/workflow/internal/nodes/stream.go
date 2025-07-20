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

package nodes

import (
	"context"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

var KeyIsFinished = "\x1FKey is finished\x1F"

type Mode string

const (
	Streaming    Mode = "streaming"
	NonStreaming Mode = "non-streaming"
)

type FieldStreamType string

const (
	FieldIsStream    FieldStreamType = "yes"     // absolutely a stream
	FieldNotStream   FieldStreamType = "no"      // absolutely not a stream
	FieldMaybeStream FieldStreamType = "maybe"   // maybe a stream, requires request-time resolution
	FieldSkipped     FieldStreamType = "skipped" // the field source's node is skipped
)

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

type DynamicStreamContainer interface {
	SaveDynamicChoice(nodeKey vo.NodeKey, groupToChoice map[string]int)
	GetDynamicChoice(nodeKey vo.NodeKey) map[string]int
	GetDynamicStreamType(nodeKey vo.NodeKey, group string) (FieldStreamType, error)
	GetAllDynamicStreamTypes(nodeKey vo.NodeKey) (map[string]FieldStreamType, error)
}

// ResolveStreamSources resolves incoming field sources for a node, deciding their stream type.
func ResolveStreamSources(ctx context.Context, sources map[string]*SourceInfo) (map[string]*SourceInfo, error) {
	resolved := make(map[string]*SourceInfo, len(sources))

	nodeKey2Skipped := make(map[vo.NodeKey]bool)

	var resolver func(path string, sInfo *SourceInfo) (*SourceInfo, error)
	resolver = func(path string, sInfo *SourceInfo) (*SourceInfo, error) {
		resolvedNode := &SourceInfo{
			IsIntermediate: sInfo.IsIntermediate,
			FieldType:      sInfo.FieldType,
			FromNodeKey:    sInfo.FromNodeKey,
			FromPath:       sInfo.FromPath,
			TypeInfo:       sInfo.TypeInfo,
		}

		if len(sInfo.SubSources) > 0 {
			resolvedNode.SubSources = make(map[string]*SourceInfo, len(sInfo.SubSources))

			for k, subInfo := range sInfo.SubSources {
				resolvedSub, err := resolver(k, subInfo)
				if err != nil {
					return nil, err
				}

				resolvedNode.SubSources[k] = resolvedSub
			}

			return resolvedNode, nil
		}

		if sInfo.FromNodeKey == "" { // static values and variables, always non-streaming and available
			return resolvedNode, nil
		}

		var skipped, ok bool
		if skipped, ok = nodeKey2Skipped[sInfo.FromNodeKey]; !ok {
			_ = compose.ProcessState(ctx, func(ctx context.Context, state NodeExecuteStatusAware) error {
				skipped = !state.NodeExecuted(sInfo.FromNodeKey)
				return nil
			})
			nodeKey2Skipped[sInfo.FromNodeKey] = skipped
		}

		if skipped {
			resolvedNode.FieldType = FieldSkipped
			return resolvedNode, nil
		}

		if sInfo.FieldType == FieldMaybeStream {
			if len(sInfo.SubSources) > 0 {
				panic("a maybe stream field should not have sub sources")
			}

			var streamType FieldStreamType
			err := compose.ProcessState(ctx, func(ctx context.Context, state DynamicStreamContainer) error {
				var e error
				streamType, e = state.GetDynamicStreamType(sInfo.FromNodeKey, sInfo.FromPath[0])
				return e
			})
			if err != nil {
				return nil, err
			}

			return &SourceInfo{
				IsIntermediate: sInfo.IsIntermediate,
				FieldType:      streamType,
				FromNodeKey:    sInfo.FromNodeKey,
				FromPath:       sInfo.FromPath,
				SubSources:     sInfo.SubSources,
				TypeInfo:       sInfo.TypeInfo,
			}, nil
		}

		return resolvedNode, nil
	}

	for k, sInfo := range sources {
		resolvedInfo, err := resolver(k, sInfo)
		if err != nil {
			return nil, err
		}
		resolved[k] = resolvedInfo
	}

	return resolved, nil
}

type NodeExecuteStatusAware interface {
	NodeExecuted(key vo.NodeKey) bool
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
