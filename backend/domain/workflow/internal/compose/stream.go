package compose

import (
	"fmt"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/llm"
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

func (s *NodeSchema) SetStreamSources(allNS map[vo.NodeKey]*NodeSchema) error {
	if s.Type != entity.NodeTypeOutputEmitter && s.Type != entity.NodeTypeExit {
		return nil
	}

	for i := range s.InputSources {
		fInfo := s.InputSources[i]
		if fInfo.Source.Ref != nil && fInfo.Source.Ref.FromNodeKey != "" {
			fromNode, ok := allNS[fInfo.Source.Ref.FromNodeKey]
			if !ok {
				return fmt.Errorf("node %s not found", fInfo.Source.Ref.FromNodeKey)
			}

			isStream, err := fromNode.IsStreamingField(fInfo.Source.Ref.FromPath)
			if err != nil {
				return err
			}

			if isStream {
				streamSources := getKeyOrZero[[]*vo.FieldInfo]("StreamSources", s.Configs)
				if len(streamSources) == 0 {
					streamSources = make([]*vo.FieldInfo, 0)
					if s.Configs == nil {
						s.Configs = make(map[string]any)
					}
					s.Configs.(map[string]any)["StreamSources"] = streamSources
				}
				s.Configs.(map[string]any)["StreamSources"] = append(s.Configs.(map[string]any)["StreamSources"].([]*vo.FieldInfo), fInfo)
			}
		}
	}

	return nil
}

func (s *NodeSchema) IsStreamingField(path compose.FieldPath) (bool, error) {
	if s.Type == entity.NodeTypeExit {
		if mustGetKey[nodes.Mode]("Mode", s.Configs) == nodes.Streaming {
			if len(path) == 1 && path[0] == "output" {
				return true, nil
			}
		}

		return false, nil
	}

	if s.Type == entity.NodeTypeSubWorkflow {
		subSC := s.SubWorkflowSchema
		subExit := subSC.GetNode(ExitNodeKey)
		ok, err := subExit.IsStreamingField(path)
		if err != nil {
			return false, err
		}

		return ok, nil
	}

	if s.Type != entity.NodeTypeLLM {
		return false, nil
	}

	if len(path) != 1 {
		return false, nil
	}

	format := mustGetKey[llm.Format]("OutputFormat", s.Configs)
	if format == llm.FormatJSON {
		return false, nil
	}

	outputs := s.OutputTypes
	var outputKey string
	for key, output := range outputs {
		if output.Type != vo.DataTypeString {
			return false, nil
		}

		if key != "reasoning_content" {
			if len(outputKey) > 0 {
				return false, nil
			}
			outputKey = key
		}
	}

	field := path[0]
	if field == "reasoning_content" || field == outputKey {
		return true, nil
	}

	return false, nil
}
