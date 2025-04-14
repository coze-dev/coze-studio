package schema

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/cloudwego/eino/compose"

	crossdatabase "code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/database"
	crossknowledge "code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/workflow/cross_domain/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/batch"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/emitter"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/httprequester"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/llm"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/qa"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/textprocessor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableaggregator"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableassigner"
	"code.byted.org/flow/opencoze/backend/domain/workflow/variables"
)

func (s *NodeSchema) ToLLMConfig(ctx context.Context) (*llm.Config, error) {
	conf := s.Configs.(map[string]any)
	llmConf := &llm.Config{
		SystemPrompt:    getKeyOrZero[string]("SystemPrompt", conf),
		UserPrompt:      getKeyOrZero[string]("UserPrompt", conf),
		OutputFormat:    mustGetKey[llm.Format]("OutputFormat", conf),
		OutputFields:    mustGetKey[map[string]*nodes.TypeInfo]("OutputFields", conf),
		IgnoreException: getKeyOrZero[bool]("IgnoreException", conf),
		DefaultOutput:   getKeyOrZero[map[string]any]("DefaultOutput", conf),
	}

	llmParams := getKeyOrZero[*model.LLMParams]("LLMParams", conf)
	if llmParams != nil {
		m, err := model.ManagerImpl.GetModel(ctx, llmParams)
		if err != nil {
			return nil, err
		}

		llmConf.ChatModel = m
	}

	// TODO: inject tools

	return llmConf, nil
}

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
		Outputs:       s.OutputSources,
	}

	for key, tInfo := range s.InputTypes {
		if tInfo.Type != nodes.DataTypeArray {
			continue
		}

		conf.InputArrays = append(conf.InputArrays, key)
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
		Outputs:          s.OutputSources,

		Inner: inner,
	}

	return conf, nil
}

func (s *NodeSchema) ToQAConfig(ctx context.Context) (*qa.Config, error) {
	confMap := s.Configs.(map[string]any)
	conf := &qa.Config{
		QuestionTpl:               mustGetKey[string]("QuestionTpl", confMap),
		AnswerType:                mustGetKey[qa.AnswerType]("AnswerType", confMap),
		ChoiceType:                getKeyOrZero[qa.ChoiceType]("ChoiceType", confMap),
		FixedChoices:              getKeyOrZero[[]string]("FixedChoices", confMap),
		ExtractFromAnswer:         getKeyOrZero[bool]("ExtractFromAnswer", confMap),
		MaxAnswerCount:            getKeyOrZero[int]("MaxAnswerCount", confMap),
		AdditionalSystemPromptTpl: getKeyOrZero[string]("AdditionalSystemPromptTpl", confMap),
		OutputFields:              getKeyOrZero[map[string]*nodes.TypeInfo]("OutputFields", confMap),
		NodeKey:                   s.Key,
	}

	llmParams := getKeyOrZero[*model.LLMParams]("LLMParams", confMap)
	if llmParams != nil {
		m, err := model.ManagerImpl.GetModel(ctx, llmParams)
		if err != nil {
			return nil, err
		}

		conf.Model = m
	}

	return conf, nil
}

func (s *NodeSchema) ToOutputEmitterConfig() (*emitter.Config, error) {
	confMap := s.Configs.(map[string]any)
	return &emitter.Config{
		Template: mustGetKey[string]("Template", confMap),
		M:        mustGetKey[emitter.Mode]("Mode", confMap),
	}, nil
}

func (s *NodeSchema) ToDatabaseCustomSQLConfig() (*database.CustomSQLConfig, error) {
	cfgMap := s.Configs.(map[string]any)
	return &database.CustomSQLConfig{
		DatabaseInfoID:    mustGetKey[int64]("DatabaseInfoID", cfgMap),
		SQLTemplate:       mustGetKey[string]("SQLTemplate", cfgMap),
		OutputConfig:      getKeyOrZero[database.OutputConfig]("OutputConfig", cfgMap),
		CustomSQLExecutor: crossdatabase.CustomSQLExecutorImpl,
	}, nil

}

func (s *NodeSchema) ToDatabaseQueryConfig() (*database.QueryConfig, error) {
	cfgMap := s.Configs.(map[string]any)
	return &database.QueryConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", cfgMap),
		QueryFields:    getKeyOrZero[[]string]("QueryFields", cfgMap),
		OrderClauses:   getKeyOrZero[[]*crossdatabase.OrderClause]("OrderClauses", cfgMap),
		ClauseGroup:    getKeyOrZero[*crossdatabase.ClauseGroup]("ClauseGroup", cfgMap),
		OutputConfig:   getKeyOrZero[database.OutputConfig]("OutputConfig", cfgMap),
		Limit:          mustGetKey[int64]("Limit", cfgMap),
		Queryer:        crossdatabase.QueryerImpl,
	}, nil
}

func (s *NodeSchema) ToDatabaseInsertConfig() (*database.InsertConfig, error) {
	cfgMap := s.Configs.(map[string]any)
	return &database.InsertConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", cfgMap),
		InsertFields:   mustGetKey[map[string]nodes.TypeInfo]("InsertFields", cfgMap),
		OutputConfig:   getKeyOrZero[database.OutputConfig]("OutputConfig", cfgMap),
		Inserter:       crossdatabase.InserterImpl,
	}, nil
}

func (s *NodeSchema) ToDatabaseDeleteConfig() (*database.DeleteConfig, error) {
	cfgMap := s.Configs.(map[string]any)
	return &database.DeleteConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", cfgMap),
		ClauseGroup:    mustGetKey[*crossdatabase.ClauseGroup]("ClauseGroup", cfgMap),
		OutputConfig:   getKeyOrZero[database.OutputConfig]("OutputConfig", cfgMap),
		Deleter:        crossdatabase.DeleterImpl,
	}, nil
}

func (s *NodeSchema) ToDatabaseUpdateConfig() (*database.UpdateConfig, error) {
	cfgMap := s.Configs.(map[string]any)
	return &database.UpdateConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", cfgMap),
		ClauseGroup:    mustGetKey[*crossdatabase.ClauseGroup]("ClauseGroup", cfgMap),
		UpdateFields:   mustGetKey[map[string]nodes.TypeInfo]("UpdateFields", cfgMap),
		OutputConfig:   getKeyOrZero[database.OutputConfig]("OutputConfig", cfgMap),
		Updater:        crossdatabase.UpdaterImpl,
	}, nil
}

func (s *NodeSchema) ToKnowledgeIndexerConfig() (*knowledge.IndexerConfig, error) {
	return &knowledge.IndexerConfig{
		KnowledgeID:      mustGetKey[int64]("KnowledgeID", s.Configs.(map[string]any)),
		ParsingStrategy:  mustGetKey[*crossknowledge.ParsingStrategy]("ParsingStrategy", s.Configs.(map[string]any)),
		ChunkingStrategy: mustGetKey[*crossknowledge.ChunkingStrategy]("ChunkingStrategy", s.Configs.(map[string]any)),
		KnowledgeIndexer: crossknowledge.IndexerImpl,
	}, nil
}

func (s *NodeSchema) ToKnowledgeRetrieveConfig() (*knowledge.RetrieveConfig, error) {
	cfgMap := s.Configs.(map[string]any)
	return &knowledge.RetrieveConfig{
		KnowledgeIDs:      mustGetKey[[]int64]("KnowledgeIDs", cfgMap),
		RetrievalStrategy: mustGetKey[*crossknowledge.RetrievalStrategy]("RetrievalStrategy", cfgMap),
		Retriever:         crossknowledge.RetrieverImpl,
	}, nil
}

func (s *NodeSchema) GetImplicitInputFields() ([]*nodes.FieldInfo, error) {
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
