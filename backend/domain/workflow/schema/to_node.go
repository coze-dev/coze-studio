package schema

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/batch"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/httprequester"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/textprocessor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableaggregator"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableassigner"
	"code.byted.org/flow/opencoze/backend/domain/workflow/variables"
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

func (s *NodeSchema) ToTextProcessorConfig() (*textprocessor.Config, error) {
	return &textprocessor.Config{
		Type:       s.Configs.(map[string]any)["Type"].(textprocessor.Type),
		Tpl:        getKeyOrZero[string]("Tpl", s.Configs.(map[string]any)),
		ConcatChar: getKeyOrZero[string]("ConcatChar", s.Configs.(map[string]any)),
		Separator:  getKeyOrZero[string]("Separator", s.Configs.(map[string]any)),
	}, nil
}

func (s *NodeSchema) ToHTTPRequesterConfig() (*httprequester.Config, error) {
	confMap := s.Configs.(map[string]any)
	return &httprequester.Config{
		URLConfig:              mustGetKey[httprequester.URLConfig]("URLConfig", confMap),
		AuthConfig:             getKeyOrZero[*httprequester.AuthenticationConfig]("AuthConfig", confMap),
		BodyConfig:             mustGetKey[httprequester.BodyConfig]("BodyConfig", confMap),
		IgnoreExceptionSetting: getKeyOrZero[*httprequester.IgnoreExceptionSetting]("IgnoreExceptionSetting", confMap),
		Method:                 mustGetKey[string]("Method", confMap),
		Timeout:                mustGetKey[time.Duration]("Timeout", confMap),
		RetryTimes:             mustGetKey[uint64]("RetryTimes", confMap),
	}, nil
}

func (s *NodeSchema) ToVariableAssignerConfig(handler *variables.VariableHandler) (*variableassigner.Config, error) {
	return &variableassigner.Config{
		Pairs:   s.Configs.([]*variableassigner.Pair),
		Handler: handler,
	}, nil
}

func (s *NodeSchema) ToLoopConfig(inner compose.Runnable[map[string]any, map[string]any]) (*loop.Config, error) {
	confMap := s.Configs.(map[string]any)
	conf := &loop.Config{
		LoopNodeKey:      mustGetKey[string]("LoopNodeKey", confMap),
		LoopType:         mustGetKey[loop.Type]("LoopType", confMap),
		InputArrays:      getKeyOrZero[[]string]("InputArrays", confMap),
		IntermediateVars: getKeyOrZero[map[string]*nodes.TypeInfo]("IntermediateVars", confMap),
		Outputs:          make(map[string]*nodes.FieldInfo),

		Inner: inner,
	}

	for key, layered := range s.Outputs {
		if len(layered.Object) > 0 {
			return nil, fmt.Errorf("loop node's output must be one level, got object: %v", layered.Object)
		}

		conf.Outputs[key] = layered.Info
	}

	return conf, nil
}

func (s *NodeSchema) GetImplicitInputFields() ([]*nodes.InputField, error) {
	switch s.Type {
	case NodeTypeHTTPRequester:
		urlConfig := mustGetKey[httprequester.URLConfig]("URLConfig", s.Configs.(map[string]any))
		inputs, err := extractInputFieldsFromTemplate(urlConfig.Tpl)
		if err != nil {
			return nil, err
		}

		for i := range inputs {
			inputs[i].Path = append(compose.FieldPath{"URLVars"}, inputs[i].Path...)
		}

		bodyConfig := mustGetKey[httprequester.BodyConfig]("BodyConfig", s.Configs.(map[string]any))
		if bodyConfig.TextPlainConfig != nil {
			textInputs, err := extractInputFieldsFromTemplate(bodyConfig.TextPlainConfig.Tpl)
			if err != nil {
				return nil, err
			}

			for i := range textInputs {
				textInputs[i].Path = append(compose.FieldPath{"TextPlainVars"}, textInputs[i].Path...)
			}

			inputs = append(inputs, textInputs...)
		} else if bodyConfig.TextJsonConfig != nil {
			jsonInputs, err := extractInputFieldsFromTemplate(bodyConfig.TextJsonConfig.Tpl)
			if err != nil {
				return nil, err
			}

			for i := range jsonInputs {
				jsonInputs[i].Path = append(compose.FieldPath{"JsonVars"}, jsonInputs[i].Path...)
			}

			inputs = append(inputs, jsonInputs...)
		}

		return inputs, nil
	default:
		return nil, nil
	}
}
