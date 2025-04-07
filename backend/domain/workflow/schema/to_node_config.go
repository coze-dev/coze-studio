package schema

import (
	"fmt"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/batch"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/selector"
)

func (s *NodeSchema) ToSelectorConfig() (*selector.Config, error) {
	conf := &selector.Config{}

	orderedConfigs, ok := s.Configs.([]*selector.OneClauseSchema)
	if !ok {
		return nil, fmt.Errorf("invalid config for selector: %v", s.Configs)
	}

	conf.Clauses = orderedConfigs

	return conf, nil
}

func (s *NodeSchema) ToBatchConfig(inner compose.Runnable[map[string]any, map[string]any]) (*batch.Config, error) {
	conf := &batch.Config{
		BatchNodeKey:  s.Configs.(map[string]any)["BatchNodeKey"].(string),
		InnerWorkflow: inner,
		Outputs:       s.Outputs,
	}

	for _, input := range s.Inputs {
		if input.Info.Type.Type != nodes.DataTypeArray {
			continue
		}
		
		if len(input.Path) > 1 {
			return nil, fmt.Errorf("batch node's input array must be top level, actual path: %v", input.Path)
		}

		conf.InputArrays = append(conf.InputArrays, input.Path[0])
	}

	return conf, nil
}
