package schema

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/batch"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableaggregator"
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

func (s *NodeSchema) SelectorInputConverter(in map[string]any) (out []selector.Operants, err error) {
	conf, ok := s.Configs.([]*selector.OneClauseSchema)
	if !ok {
		return nil, fmt.Errorf("invalid config for selector: %v", s.Configs)
	}

	for i, oneConf := range conf {
		if oneConf.Single != nil {
			left, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), "Left"})
			if !ok {
				return nil, fmt.Errorf("failed to take left operant from input map: %v, clause index= %d", in, i)
			}

			right, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), "Right"})
			if ok {
				out = append(out, selector.Operants{Left: left, Right: right})
			} else {
				out = append(out, selector.Operants{Left: left})
			}
		} else if oneConf.Multi != nil {
			multiClause := make([]*selector.Operants, 0)
			for j := range oneConf.Multi.Clauses {
				left, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), strconv.Itoa(j), "Left"})
				if !ok {
					return nil, fmt.Errorf("failed to take left operant from input map: %v, clause index= %d, single clause index= %d", in, i, j)
				}
				right, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), strconv.Itoa(j), "Right"})
				if ok {
					multiClause = append(multiClause, &selector.Operants{Left: left, Right: right})
				} else {
					multiClause = append(multiClause, &selector.Operants{Left: left})
				}
			}
			out = append(out, selector.Operants{Multi: multiClause})
		} else {
			return nil, fmt.Errorf("invalid clause config, both single and multi are nil: %v", oneConf)
		}
	}

	return out, nil
}

func (s *NodeSchema) ToBatchConfig(inner compose.Runnable[map[string]any, map[string]any]) (*batch.Config, error) {
	conf := &batch.Config{
		BatchNodeKey:  s.Configs.(map[string]any)["BatchNodeKey"].(string),
		InnerWorkflow: inner,
		Outputs:       make(map[string]*nodes.FieldInfo, len(s.Outputs)),
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

	for key, layered := range s.Outputs {
		if len(layered.Object) > 0 {
			return nil, fmt.Errorf("batch node's output must be array, got object: %v", layered.Object)
		}

		if layered.Info.Type.Type != nodes.DataTypeArray {
			return nil, fmt.Errorf("batch node's output must be array, actual: %v", layered.Info.Type.Type)
		}

		conf.Outputs[key] = layered.Info
	}

	return conf, nil
}

func (s *NodeSchema) ToVariableAggregatorConfig() (*variableaggregator.Config, error) {
	return &variableaggregator.Config{
		MergeStrategy: s.Configs.(map[string]any)["MergeStrategy"].(variableaggregator.MergeStrategy),
	}, nil
}

func (s *NodeSchema) VariableAggregatorInputConverter(in map[string]any) (converted map[string][]any, err error) {
	converted = make(map[string][]any)

	for k, value := range in {
		m, ok := value.(map[string]any)
		if !ok {
			return nil, errors.New("value is not a map[string]any")
		}
		converted[k] = make([]any, len(m))
		for i, sv := range m {
			index, err := strconv.Atoi(i)
			if err != nil {
				return nil, fmt.Errorf(" converting %s to int failed, err=%v", i, err)
			}
			converted[k][index] = sv
		}
	}

	return converted, nil
}
