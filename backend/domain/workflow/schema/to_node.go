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
	llmConf := &llm.Config{
		SystemPrompt:    getKeyOrZero[string]("SystemPrompt", s.Configs),
		UserPrompt:      getKeyOrZero[string]("UserPrompt", s.Configs),
		OutputFormat:    mustGetKey[llm.Format]("OutputFormat", s.Configs),
		OutputFields:    s.OutputTypes,
		IgnoreException: getKeyOrZero[bool]("IgnoreException", s.Configs),
		DefaultOutput:   getKeyOrZero[map[string]any]("DefaultOutput", s.Configs),
	}

	llmParams := getKeyOrZero[*model.LLMParams]("LLMParams", s.Configs)
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
		BatchNodeKey:  s.Key,
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
	return &httprequester.Config{
		URLConfig:              mustGetKey[httprequester.URLConfig]("URLConfig", s.Configs),
		AuthConfig:             getKeyOrZero[*httprequester.AuthenticationConfig]("AuthConfig", s.Configs),
		BodyConfig:             mustGetKey[httprequester.BodyConfig]("BodyConfig", s.Configs),
		IgnoreExceptionSetting: getKeyOrZero[*httprequester.IgnoreExceptionSetting]("IgnoreExceptionSetting", s.Configs),
		Method:                 mustGetKey[string]("Method", s.Configs),
		Timeout:                mustGetKey[time.Duration]("Timeout", s.Configs),
		RetryTimes:             mustGetKey[uint64]("RetryTimes", s.Configs),
	}, nil
}

func (s *NodeSchema) ToVariableAssignerConfig(handler *variables.VariableHandler) (*variableassigner.Config, error) {
	return &variableassigner.Config{
		Pairs:   s.Configs.([]*variableassigner.Pair),
		Handler: handler,
	}, nil
}

func (s *NodeSchema) ToLoopConfig(inner compose.Runnable[map[string]any, map[string]any]) (*loop.Config, error) {
	conf := &loop.Config{
		LoopNodeKey:      s.Key,
		LoopType:         mustGetKey[loop.Type]("LoopType", s.Configs),
		InputArrays:      getKeyOrZero[[]string]("InputArrays", s.Configs),
		IntermediateVars: getKeyOrZero[map[string]*nodes.TypeInfo]("IntermediateVars", s.Configs),
		Outputs:          s.OutputSources,

		Inner: inner,
	}

	return conf, nil
}

func (s *NodeSchema) ToQAConfig(ctx context.Context) (*qa.Config, error) {
	conf := &qa.Config{
		QuestionTpl:               mustGetKey[string]("QuestionTpl", s.Configs),
		AnswerType:                mustGetKey[qa.AnswerType]("AnswerType", s.Configs),
		ChoiceType:                getKeyOrZero[qa.ChoiceType]("ChoiceType", s.Configs),
		FixedChoices:              getKeyOrZero[[]string]("FixedChoices", s.Configs),
		ExtractFromAnswer:         getKeyOrZero[bool]("ExtractFromAnswer", s.Configs),
		MaxAnswerCount:            getKeyOrZero[int]("MaxAnswerCount", s.Configs),
		AdditionalSystemPromptTpl: getKeyOrZero[string]("AdditionalSystemPromptTpl", s.Configs),
		OutputFields:              getKeyOrZero[map[string]*nodes.TypeInfo]("OutputFields", s.Configs),
		NodeKey:                   s.Key,
	}

	llmParams := getKeyOrZero[*model.LLMParams]("LLMParams", s.Configs)
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
	conf := &emitter.Config{
		Template: getKeyOrZero[string]("Template", s.Configs),
	}

	streamSources := getKeyOrZero[[]string]("StreamSources", s.Configs)
	for _, source := range streamSources {
		for i := range s.InputSources {
			fieldInfo := s.InputSources[i]
			if len(fieldInfo.Path) == 1 && fieldInfo.Path[0] == source {
				conf.StreamSources = append(conf.StreamSources, fieldInfo)
			}
		}
	}

	return conf, nil
}

func (s *NodeSchema) ToDatabaseCustomSQLConfig() (*database.CustomSQLConfig, error) {
	return &database.CustomSQLConfig{
		DatabaseInfoID:    mustGetKey[int64]("DatabaseInfoID", s.Configs),
		SQLTemplate:       mustGetKey[string]("SQLTemplate", s.Configs),
		OutputConfig:      getKeyOrZero[database.OutputConfig]("OutputConfig", s.Configs),
		CustomSQLExecutor: crossdatabase.CustomSQLExecutorImpl,
	}, nil

}

func (s *NodeSchema) ToDatabaseQueryConfig() (*database.QueryConfig, error) {
	return &database.QueryConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", s.Configs),
		QueryFields:    getKeyOrZero[[]string]("QueryFields", s.Configs),
		OrderClauses:   getKeyOrZero[[]*crossdatabase.OrderClause]("OrderClauses", s.Configs),
		ClauseGroup:    getKeyOrZero[*crossdatabase.ClauseGroup]("ClauseGroup", s.Configs),
		OutputConfig:   getKeyOrZero[database.OutputConfig]("OutputConfig", s.Configs),
		Limit:          mustGetKey[int64]("Limit", s.Configs),
		Queryer:        crossdatabase.QueryerImpl,
	}, nil
}

func (s *NodeSchema) ToDatabaseInsertConfig() (*database.InsertConfig, error) {
	return &database.InsertConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", s.Configs),
		InsertFields:   mustGetKey[map[string]nodes.TypeInfo]("InsertFields", s.Configs),
		OutputConfig:   getKeyOrZero[database.OutputConfig]("OutputConfig", s.Configs),
		Inserter:       crossdatabase.InserterImpl,
	}, nil
}

func (s *NodeSchema) ToDatabaseDeleteConfig() (*database.DeleteConfig, error) {
	return &database.DeleteConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", s.Configs),
		ClauseGroup:    mustGetKey[*crossdatabase.ClauseGroup]("ClauseGroup", s.Configs),
		OutputConfig:   getKeyOrZero[database.OutputConfig]("OutputConfig", s.Configs),
		Deleter:        crossdatabase.DeleterImpl,
	}, nil
}

func (s *NodeSchema) ToDatabaseUpdateConfig() (*database.UpdateConfig, error) {
	return &database.UpdateConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", s.Configs),
		ClauseGroup:    mustGetKey[*crossdatabase.ClauseGroup]("ClauseGroup", s.Configs),
		UpdateFields:   mustGetKey[map[string]nodes.TypeInfo]("UpdateFields", s.Configs),
		OutputConfig:   getKeyOrZero[database.OutputConfig]("OutputConfig", s.Configs),
		Updater:        crossdatabase.UpdaterImpl,
	}, nil
}

func (s *NodeSchema) ToKnowledgeIndexerConfig() (*knowledge.IndexerConfig, error) {
	return &knowledge.IndexerConfig{
		KnowledgeID:      mustGetKey[int64]("KnowledgeID", s.Configs),
		ParsingStrategy:  mustGetKey[*crossknowledge.ParsingStrategy]("ParsingStrategy", s.Configs),
		ChunkingStrategy: mustGetKey[*crossknowledge.ChunkingStrategy]("ChunkingStrategy", s.Configs),
		KnowledgeIndexer: crossknowledge.IndexerImpl,
	}, nil
}

func (s *NodeSchema) ToKnowledgeRetrieveConfig() (*knowledge.RetrieveConfig, error) {
	return &knowledge.RetrieveConfig{
		KnowledgeIDs:      mustGetKey[[]int64]("KnowledgeIDs", s.Configs),
		RetrievalStrategy: mustGetKey[*crossknowledge.RetrievalStrategy]("RetrievalStrategy", s.Configs),
		Retriever:         crossknowledge.RetrieverImpl,
	}, nil
}

func (s *NodeSchema) GetImplicitInputFields() ([]*nodes.FieldInfo, error) {
	switch s.Type {
	case NodeTypeHTTPRequester:
		urlConfig := mustGetKey[httprequester.URLConfig]("URLConfig", s.Configs)
		inputs, err := extractInputFieldsFromTemplate(urlConfig.Tpl)
		if err != nil {
			return nil, err
		}

		for i := range inputs {
			inputs[i].Path = append(compose.FieldPath{"URLVars"}, inputs[i].Path...)
		}

		bodyConfig := mustGetKey[httprequester.BodyConfig]("BodyConfig", s.Configs)
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
