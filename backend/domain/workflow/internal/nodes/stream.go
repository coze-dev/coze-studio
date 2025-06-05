package nodes

import (
	"context"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

var KeyIsFinished = "\x1FKey is finished\x1F"

type Mode string

const (
	Streaming    Mode = "streaming"
	NonStreaming Mode = "non-streaming"
)

type FieldStreamType string

const (
	FieldIsStream    FieldStreamType = "yes"
	FieldNotStream   FieldStreamType = "no"
	FieldMaybeStream FieldStreamType = "maybe"
)

type SourceInfo struct {
	IsIntermediate bool
	FieldIsStream  FieldStreamType
	FromNodeKey    vo.NodeKey
	FromPath       compose.FieldPath
	SubSources     map[string]*SourceInfo
}

type DynamicStreamContainer interface {
	SaveDynamicChoice(nodeKey vo.NodeKey, groupToChoice map[string]int)
	GetDynamicChoice(nodeKey vo.NodeKey) map[string]int
	GetDynamicStreamType(nodeKey vo.NodeKey, group string) (FieldStreamType, error)
	GetAllDynamicStreamTypes(nodeKey vo.NodeKey) (map[string]FieldStreamType, error)
}

func ResolveStreamSources(ctx context.Context, sources map[string]*SourceInfo) (map[string]*SourceInfo, error) {
	resolved := make(map[string]*SourceInfo, len(sources))

	var resolver func(path string, sInfo *SourceInfo) (*SourceInfo, error)
	resolver = func(path string, sInfo *SourceInfo) (*SourceInfo, error) {
		if sInfo.FieldIsStream == FieldMaybeStream {
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
				FieldIsStream:  streamType,
				FromNodeKey:    sInfo.FromNodeKey,
				FromPath:       sInfo.FromPath,
				SubSources:     sInfo.SubSources,
			}, nil
		}

		resolvedNode := &SourceInfo{
			IsIntermediate: sInfo.IsIntermediate,
			FieldIsStream:  sInfo.FieldIsStream,
			FromNodeKey:    sInfo.FromNodeKey,
			FromPath:       sInfo.FromPath,
		}

		if len(sInfo.SubSources) == 0 {
			return resolvedNode, nil
		}

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

	for k, sInfo := range sources {
		resolvedInfo, err := resolver(k, sInfo)
		if err != nil {
			return nil, err
		}
		resolved[k] = resolvedInfo
	}

	return resolved, nil
}
