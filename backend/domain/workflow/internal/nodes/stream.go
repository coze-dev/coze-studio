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
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

var KeyIsFinished = "\x1FKey is finished\x1F"

type DynamicStreamContainer interface {
	SaveDynamicChoice(nodeKey vo.NodeKey, groupToChoice map[string]int)
	GetDynamicChoice(nodeKey vo.NodeKey) map[string]int
	GetDynamicStreamType(nodeKey vo.NodeKey, group string) (schema.FieldStreamType, error)
	GetAllDynamicStreamTypes(nodeKey vo.NodeKey) (map[string]schema.FieldStreamType, error)
}

// ResolveStreamSources resolves incoming field sources for a node, deciding their stream type.
func ResolveStreamSources(ctx context.Context, sources map[string]*schema.SourceInfo) (map[string]*schema.SourceInfo, error) {
	resolved := make(map[string]*schema.SourceInfo, len(sources))

	nodeKey2Skipped := make(map[vo.NodeKey]bool)

	var resolver func(path string, sInfo *schema.SourceInfo) (*schema.SourceInfo, error)
	resolver = func(path string, sInfo *schema.SourceInfo) (*schema.SourceInfo, error) {
		resolvedNode := &schema.SourceInfo{
			IsIntermediate: sInfo.IsIntermediate,
			FieldType:      sInfo.FieldType,
			FromNodeKey:    sInfo.FromNodeKey,
			FromPath:       sInfo.FromPath,
			TypeInfo:       sInfo.TypeInfo,
		}

		if len(sInfo.SubSources) > 0 {
			resolvedNode.SubSources = make(map[string]*schema.SourceInfo, len(sInfo.SubSources))

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
			resolvedNode.FieldType = schema.FieldSkipped
			return resolvedNode, nil
		}

		if sInfo.FieldType == schema.FieldMaybeStream {
			if len(sInfo.SubSources) > 0 {
				panic("a maybe stream field should not have sub sources")
			}

			var streamType schema.FieldStreamType
			err := compose.ProcessState(ctx, func(ctx context.Context, state DynamicStreamContainer) error {
				var e error
				streamType, e = state.GetDynamicStreamType(sInfo.FromNodeKey, sInfo.FromPath[0])
				return e
			})
			if err != nil {
				return nil, err
			}

			return &schema.SourceInfo{
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

func IsStreamingField(s *schema.NodeSchema, path compose.FieldPath,
	sc *schema.WorkflowSchema) (schema.FieldStreamType, error) {
	sg, ok := s.Configs.(StreamGenerator)
	if !ok {
		return schema.FieldNotStream, nil
	}

	return sg.FieldStreamType(path, s, sc)
}
