package compose

import (
	"fmt"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

func (s *NodeSchema) RequiresStreaming() bool {
	switch s.Type {
	case entity.NodeTypeOutputEmitter, entity.NodeTypeExit, entity.NodeTypeSubWorkflow:
		mode := getKeyOrZero[nodes.Mode]("Mode", s.Configs)
		return mode == nodes.Streaming
	default:
		return false
	}
}

func (s *NodeSchema) SetFullSources(allNS map[vo.NodeKey]*NodeSchema) error {
	if len(s.InputSources) == 0 {
		return nil
	}

	if s.Type != entity.NodeTypeVariableAggregator && s.Type != entity.NodeTypeOutputEmitter && s.Type != entity.NodeTypeExit {
		return nil
	}

	fullSource := make(map[string]*nodes.SourceInfo)
	for i := range s.InputSources {
		fInfo := s.InputSources[i]
		path := fInfo.Path
		currentSource := fullSource
		if len(path) > 1 {
			for j := 0; j < len(path)-1; j++ {
				if current, ok := currentSource[path[j]]; !ok {
					currentSource[path[j]] = &nodes.SourceInfo{
						IsIntermediate: true,
						FieldType:      nodes.FieldNotStream,
						SubSources:     make(map[string]*nodes.SourceInfo),
					}
				} else if !current.IsIntermediate {
					return fmt.Errorf("existing sourceInfo for path %s is not intermediate, conflict", path[:j+1])
				}

				currentSource = currentSource[path[j]].SubSources
			}
		}

		lastPath := path[len(path)-1]

		// static values or variables
		if fInfo.Source.Ref == nil || fInfo.Source.Ref.FromNodeKey == "" {
			currentSource[lastPath] = &nodes.SourceInfo{
				IsIntermediate: false,
				FieldType:      nodes.FieldNotStream,
			}
			continue
		}

		fromNodeKey := fInfo.Source.Ref.FromNodeKey
		var (
			streamType nodes.FieldStreamType
			err        error
		)
		if len(fromNodeKey) > 0 {
			fromNode, ok := allNS[fromNodeKey]
			if !ok {
				return fmt.Errorf("node %s not found", fromNodeKey)
			}
			streamType, err = fromNode.IsStreamingField(fInfo.Source.Ref.FromPath, allNS)
			if err != nil {
				return err
			}
		}

		currentSource[lastPath] = &nodes.SourceInfo{
			IsIntermediate: false,
			FieldType:      streamType,
			FromNodeKey:    fromNodeKey,
			FromPath:       fInfo.Source.Ref.FromPath,
		}
	}

	s.Configs.(map[string]any)["FullSources"] = fullSource
	return nil
}

func (s *NodeSchema) IsStreamingField(path compose.FieldPath, allNS map[vo.NodeKey]*NodeSchema) (nodes.FieldStreamType, error) {
	if s.Type == entity.NodeTypeExit {
		if mustGetKey[nodes.Mode]("Mode", s.Configs) == nodes.Streaming {
			if len(path) == 1 && path[0] == "output" {
				return nodes.FieldIsStream, nil
			}
		}

		return nodes.FieldNotStream, nil
	} else if s.Type == entity.NodeTypeSubWorkflow { // TODO: why not use sub workflow's Mode configuration directly?
		subSC := s.SubWorkflowSchema
		subExit := subSC.GetNode(ExitNodeKey)
		subStreamType, err := subExit.IsStreamingField(path, nil)
		if err != nil {
			return nodes.FieldNotStream, err
		}

		return subStreamType, nil
	} else if s.Type == entity.NodeTypeVariableAggregator {
		if len(path) == 2 { // asking about a specific index within a group
			for _, fInfo := range s.InputSources {
				if len(fInfo.Path) == len(path) {
					equal := true
					for i := range fInfo.Path {
						if fInfo.Path[i] != path[i] {
							equal = false
							break
						}
					}

					if equal {
						if fInfo.Source.Ref == nil || fInfo.Source.Ref.FromNodeKey == "" {
							return nodes.FieldNotStream, nil
						}
						fromNodeKey := fInfo.Source.Ref.FromNodeKey
						fromNode, ok := allNS[fromNodeKey]
						if !ok {
							return nodes.FieldNotStream, fmt.Errorf("node %s not found", fromNodeKey)
						}
						return fromNode.IsStreamingField(fInfo.Source.Ref.FromPath, allNS)
					}
				}
			}
		} else if len(path) == 1 { // asking about the entire group
			var streamCount, notStreamCount int
			for _, fInfo := range s.InputSources {
				if fInfo.Path[0] == path[0] { // belong to the group
					if fInfo.Source.Ref != nil && len(fInfo.Source.Ref.FromNodeKey) > 0 {
						fromNode, ok := allNS[fInfo.Source.Ref.FromNodeKey]
						if !ok {
							return nodes.FieldNotStream, fmt.Errorf("node %s not found", fInfo.Source.Ref.FromNodeKey)
						}
						subStreamType, err := fromNode.IsStreamingField(fInfo.Source.Ref.FromPath, allNS)
						if err != nil {
							return nodes.FieldNotStream, err
						}

						if subStreamType == nodes.FieldMaybeStream {
							return nodes.FieldMaybeStream, nil
						} else if subStreamType == nodes.FieldIsStream {
							streamCount++
						} else {
							notStreamCount++
						}
					}
				}
			}

			if streamCount > 0 && notStreamCount == 0 {
				return nodes.FieldIsStream, nil
			}

			if streamCount == 0 && notStreamCount > 0 {
				return nodes.FieldNotStream, nil
			}

			return nodes.FieldMaybeStream, nil
		}
	}

	if s.Type != entity.NodeTypeLLM {
		return nodes.FieldNotStream, nil
	}

	if len(path) != 1 {
		return nodes.FieldNotStream, nil
	}

	outputs := s.OutputTypes
	if len(outputs) != 1 && len(outputs) != 2 {
		return nodes.FieldNotStream, nil
	}

	var outputKey string
	for key, output := range outputs {
		if output.Type != vo.DataTypeString {
			return nodes.FieldNotStream, nil
		}

		if key != "reasoning_content" {
			if len(outputKey) > 0 {
				return nodes.FieldNotStream, nil
			}
			outputKey = key
		}
	}

	field := path[0]
	if field == "reasoning_content" || field == outputKey {
		return nodes.FieldIsStream, nil
	}

	return nodes.FieldNotStream, nil
}
