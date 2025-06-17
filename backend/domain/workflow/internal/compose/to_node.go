package compose

import (
	"context"
	"errors"
	"fmt"
	"runtime/debug"
	"strconv"
	"time"

	einomodel "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	workflow3 "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	workflow2 "code.byted.org/flow/opencoze/backend/domain/workflow"
	crosscode "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	crossconversation "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/conversation"
	crossdatabase "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	crossknowledge "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	crossplugin "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/batch"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/code"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/conversation"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/emitter"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/httprequester"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/intentdetector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/llm"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/plugin"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/qa"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/receiver"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/subworkflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/textprocessor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/variableaggregator"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/variableassigner"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/safego"
)

func (s *NodeSchema) ToLLMConfig(ctx context.Context) (*llm.Config, error) {
	llmConf := &llm.Config{
		SystemPrompt: getKeyOrZero[string]("SystemPrompt", s.Configs),
		UserPrompt:   getKeyOrZero[string]("UserPrompt", s.Configs),
		OutputFormat: mustGetKey[llm.Format]("OutputFormat", s.Configs),
		OutputFields: s.OutputTypes,
	}

	llmParams := getKeyOrZero[*model.LLMParams]("LLMParams", s.Configs)

	if llmParams == nil {
		return nil, fmt.Errorf("llm node llmParams is required")
	}
	var (
		err       error
		chatModel einomodel.BaseChatModel
	)

	chatModel, err = model.GetManager().GetModel(ctx, llmParams)
	if err != nil {
		return nil, err
	}

	metaConfigs := s.MetaConfigs
	if metaConfigs != nil && metaConfigs.MaxRetry > 0 {
		backupModelParams := getKeyOrZero[*model.LLMParams]("BackupLLMParams", s.Configs)
		if backupModelParams != nil {
			backupChatModel, err := model.GetManager().GetModel(ctx, backupModelParams)
			if err != nil {
				return nil, err
			}
			chatModel = &llm.ModelWithFallback{
				Model:         chatModel,
				FallbackModel: backupChatModel,
				UseFallback: func(ctx context.Context) bool {
					exeCtx := execute.GetExeCtx(ctx)
					if exeCtx == nil || exeCtx.NodeCtx == nil {
						return false
					}

					return exeCtx.CurrentRetryCount > 0
				},
			}
		}
	}

	llmConf.ChatModel = chatModel

	fcParams := getKeyOrZero[*vo.FCParam]("FCParam", s.Configs)
	if fcParams != nil {
		if fcParams.WorkflowFCParam != nil {
			for _, wf := range fcParams.WorkflowFCParam.WorkflowList {
				wfIDStr := wf.WorkflowID
				wfID, err := strconv.ParseInt(wfIDStr, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid workflow id: %s", wfIDStr)
				}

				workflowToolConfig := vo.WorkflowToolConfig{}
				if wf.FCSetting != nil {
					workflowToolConfig.InputParametersConfig = wf.FCSetting.RequestParameters
					workflowToolConfig.OutputParametersConfig = wf.FCSetting.ResponseParameters
				}

				locator := vo.FromDraft
				if wf.WorkflowVersion != "" {
					locator = vo.FromSpecificVersion
				}

				wfTool, err := workflow2.GetRepository().WorkflowAsTool(ctx, vo.GetPolicy{
					ID:      wfID,
					QType:   locator,
					Version: wf.WorkflowVersion,
				}, workflowToolConfig)
				if err != nil {
					return nil, err
				}
				llmConf.Tools = append(llmConf.Tools, wfTool)
				if wfTool.TerminatePlan() == vo.UseAnswerContent {
					if llmConf.ToolsReturnDirectly == nil {
						llmConf.ToolsReturnDirectly = make(map[string]bool)
					}
					toolInfo, err := wfTool.Info(ctx)
					if err != nil {
						return nil, err
					}
					llmConf.ToolsReturnDirectly[toolInfo.Name] = true
				}
			}
		}

		if fcParams.PluginFCParam != nil {
			pluginToolsInvokableReq := make(map[int64]*crossplugin.PluginToolsInvokableRequest)
			for _, p := range fcParams.PluginFCParam.PluginList {
				pid, err := strconv.ParseInt(p.PluginID, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid plugin id: %s", p.PluginID)
				}
				toolID, err := strconv.ParseInt(p.ApiId, 10, 64)
				if err != nil {
					return nil, fmt.Errorf("invalid plugin id: %s", p.PluginID)
				}

				var (
					requestParameters  []*workflow3.APIParameter
					responseParameters []*workflow3.APIParameter
				)
				if p.FCSetting != nil {
					requestParameters = p.FCSetting.RequestParameters
					responseParameters = p.FCSetting.RequestParameters
				}

				if req, ok := pluginToolsInvokableReq[pid]; ok {
					req.ToolsInvokableInfo[toolID] = &crossplugin.ToolsInvokableInfo{
						ToolID:                      toolID,
						RequestAPIParametersConfig:  requestParameters,
						ResponseAPIParametersConfig: responseParameters,
					}
				} else {
					pluginToolsInfoRequest := &crossplugin.PluginToolsInvokableRequest{
						PluginEntity: crossplugin.PluginEntity{
							PluginID: pid,
						},
						ToolsInvokableInfo: map[int64]*crossplugin.ToolsInvokableInfo{
							toolID: {
								ToolID:                      toolID,
								RequestAPIParametersConfig:  requestParameters,
								ResponseAPIParametersConfig: responseParameters,
							},
						},
						IsDraft: p.IsDraft,
					}
					pluginToolsInvokableReq[pid] = pluginToolsInfoRequest
				}
			}
			inInvokableTools := make([]tool.BaseTool, 0, len(fcParams.PluginFCParam.PluginList))
			for _, req := range pluginToolsInvokableReq {
				toolMap, err := crossplugin.GetToolService().GetPluginInvokableTools(ctx, req)
				if err != nil {
					return nil, err
				}
				for _, t := range toolMap {
					inInvokableTools = append(inInvokableTools, crossplugin.NewInvokableTool(t))
				}
			}
			if len(inInvokableTools) > 0 {
				llmConf.Tools = inInvokableTools
			}

		}

		if fcParams.KnowledgeFCParam != nil && len(fcParams.KnowledgeFCParam.KnowledgeList) > 0 {
			kwChatModel, err := knowledgeRecallChatModel(ctx)
			if err != nil {
				return nil, err
			}
			knowledgeOperator := crossknowledge.GetKnowledgeOperator()
			setting := fcParams.KnowledgeFCParam.GlobalSetting
			cfg := &llm.KnowledgeRecallConfig{
				ChatModel: kwChatModel,
				Retriever: knowledgeOperator,
			}
			searchType, err := totRetrievalSearchType(setting.SearchMode)
			if err != nil {
				return nil, err
			}
			cfg.RetrievalStrategy = &llm.RetrievalStrategy{
				RetrievalStrategy: &crossknowledge.RetrievalStrategy{
					TopK:               ptr.Of(setting.TopK),
					MinScore:           ptr.Of(setting.MinScore),
					SearchType:         searchType,
					EnableNL2SQL:       setting.UseNL2SQL,
					EnableQueryRewrite: setting.UseRewrite,
					EnableRerank:       setting.UseRerank,
				},
				NoReCallReplyMode:            llm.NoReCallReplyMode(setting.NoRecallReplyMode),
				NoReCallReplyCustomizePrompt: setting.NoRecallReplyCustomizePrompt,
			}

			knowledgeIDs := make([]int64, 0, len(fcParams.KnowledgeFCParam.KnowledgeList))
			for _, kw := range fcParams.KnowledgeFCParam.KnowledgeList {
				kid, err := strconv.ParseInt(kw.ID, 10, 64)
				if err != nil {
					return nil, err
				}
				knowledgeIDs = append(knowledgeIDs, kid)
			}

			detailResp, err := knowledgeOperator.ListKnowledgeDetail(ctx, &crossknowledge.ListKnowledgeDetailRequest{
				KnowledgeIDs: knowledgeIDs,
			})
			if err != nil {
				return nil, err
			}
			cfg.SelectedKnowledgeDetails = detailResp.KnowledgeDetails
			llmConf.KnowledgeRecallConfig = cfg
		}

	}

	return llmConf, nil
}

func (s *NodeSchema) ToSelectorConfig() *selector.Config {
	return &selector.Config{
		Clauses: mustGetKey[[]*selector.OneClauseSchema]("Clauses", s.Configs),
	}
}

func (s *NodeSchema) SelectorInputConverter(in map[string]any) (out []selector.Operants, err error) {
	conf := mustGetKey[[]*selector.OneClauseSchema]("Clauses", s.Configs)

	for i, oneConf := range conf {
		if oneConf.Single != nil {
			left, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), selector.LeftKey})
			if !ok {
				return nil, fmt.Errorf("failed to take left operant from input map: %v, clause index= %d", in, i)
			}

			right, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), selector.RightKey})
			if ok {
				out = append(out, selector.Operants{Left: left, Right: right})
			} else {
				out = append(out, selector.Operants{Left: left})
			}
		} else if oneConf.Multi != nil {
			multiClause := make([]*selector.Operants, 0)
			for j := range oneConf.Multi.Clauses {
				left, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), strconv.Itoa(j), selector.LeftKey})
				if !ok {
					return nil, fmt.Errorf("failed to take left operant from input map: %v, clause index= %d, single clause index= %d", in, i, j)
				}
				right, ok := nodes.TakeMapValue(in, compose.FieldPath{strconv.Itoa(i), strconv.Itoa(j), selector.RightKey})
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
		if tInfo.Type != vo.DataTypeArray {
			continue
		}

		conf.InputArrays = append(conf.InputArrays, key)
	}

	return conf, nil
}

func (s *NodeSchema) ToVariableAggregatorConfig() (*variableaggregator.Config, error) {
	return &variableaggregator.Config{
		MergeStrategy: s.Configs.(map[string]any)["MergeStrategy"].(variableaggregator.MergeStrategy),
		GroupLen:      s.Configs.(map[string]any)["GroupToLen"].(map[string]int),
		FullSources:   getKeyOrZero[map[string]*nodes.SourceInfo]("FullSources", s.Configs),
		NodeKey:       s.Key,
		InputSources:  s.InputSources,
	}, nil
}

func (s *NodeSchema) variableAggregatorInputConverter(in map[string]any) (converted map[string]map[int]any) {
	converted = make(map[string]map[int]any)

	for k, value := range in {
		m, ok := value.(map[string]any)
		if !ok {
			panic(errors.New("value is not a map[string]any"))
		}
		converted[k] = make(map[int]any, len(m))
		for i, sv := range m {
			index, err := strconv.Atoi(i)
			if err != nil {
				panic(fmt.Errorf(" converting %s to int failed, err=%v", i, err))
			}
			converted[k][index] = sv
		}
	}

	return converted
}

func (s *NodeSchema) variableAggregatorStreamInputConverter(in *schema.StreamReader[map[string]any]) *schema.StreamReader[map[string]map[int]any] {
	converter := func(input map[string]any) (output map[string]map[int]any, err error) {
		defer func() {
			if r := recover(); r != nil {
				err = safego.NewPanicErr(r, debug.Stack())
			}
		}()
		return s.variableAggregatorInputConverter(input), nil
	}
	return schema.StreamReaderWithConvert(in, converter)
}

func (s *NodeSchema) ToTextProcessorConfig() (*textprocessor.Config, error) {
	return &textprocessor.Config{
		Type:       s.Configs.(map[string]any)["Type"].(textprocessor.Type),
		Tpl:        getKeyOrZero[string]("Tpl", s.Configs.(map[string]any)),
		ConcatChar: getKeyOrZero[string]("ConcatChar", s.Configs.(map[string]any)),
		Separators: getKeyOrZero[[]string]("Separators", s.Configs.(map[string]any)),
	}, nil
}

func (s *NodeSchema) ToHTTPRequesterConfig() (*httprequester.Config, error) {
	return &httprequester.Config{
		URLConfig:  mustGetKey[httprequester.URLConfig]("URLConfig", s.Configs),
		AuthConfig: getKeyOrZero[*httprequester.AuthenticationConfig]("AuthConfig", s.Configs),
		BodyConfig: mustGetKey[httprequester.BodyConfig]("BodyConfig", s.Configs),
		Method:     mustGetKey[string]("Method", s.Configs),
		Timeout:    mustGetKey[time.Duration]("Timeout", s.Configs),
		RetryTimes: mustGetKey[uint64]("RetryTimes", s.Configs),
	}, nil
}

func (s *NodeSchema) ToVariableAssignerConfig(handler *variable.Handler) (*variableassigner.Config, error) {
	return &variableassigner.Config{
		Pairs:   s.Configs.([]*variableassigner.Pair),
		Handler: handler,
	}, nil
}

func (s *NodeSchema) ToVariableAssignerInLoopConfig() (*variableassigner.Config, error) {
	return &variableassigner.Config{
		Pairs: s.Configs.([]*variableassigner.Pair),
	}, nil
}

func (s *NodeSchema) ToLoopConfig(inner compose.Runnable[map[string]any, map[string]any]) (*loop.Config, error) {
	conf := &loop.Config{
		LoopNodeKey:      s.Key,
		LoopType:         mustGetKey[loop.Type]("LoopType", s.Configs),
		IntermediateVars: getKeyOrZero[map[string]*vo.TypeInfo]("IntermediateVars", s.Configs),
		Outputs:          s.OutputSources,
		Inner:            inner,
	}

	for key, tInfo := range s.InputTypes {
		if tInfo.Type != vo.DataTypeArray {
			continue
		}

		conf.InputArrays = append(conf.InputArrays, key)
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
		OutputFields:              s.OutputTypes,
		NodeKey:                   s.Key,
	}

	llmParams := getKeyOrZero[*model.LLMParams]("LLMParams", s.Configs)
	if llmParams != nil {
		m, err := model.GetManager().GetModel(ctx, llmParams)
		if err != nil {
			return nil, err
		}

		conf.Model = m
	}

	return conf, nil
}

func (s *NodeSchema) ToInputReceiverConfig() (*receiver.Config, error) {
	return &receiver.Config{
		OutputTypes:  s.OutputTypes,
		NodeKey:      s.Key,
		OutputSchema: mustGetKey[string]("OutputSchema", s.Configs),
	}, nil
}

func (s *NodeSchema) ToOutputEmitterConfig(sc *WorkflowSchema) (*emitter.Config, error) {
	conf := &emitter.Config{
		Template:    getKeyOrZero[string]("Template", s.Configs),
		FullSources: getKeyOrZero[map[string]*nodes.SourceInfo]("FullSources", s.Configs),
	}

	return conf, nil
}

func (s *NodeSchema) ToDatabaseCustomSQLConfig() (*database.CustomSQLConfig, error) {
	return &database.CustomSQLConfig{
		DatabaseInfoID:    mustGetKey[int64]("DatabaseInfoID", s.Configs),
		SQLTemplate:       mustGetKey[string]("SQLTemplate", s.Configs),
		OutputConfig:      s.OutputTypes,
		CustomSQLExecutor: crossdatabase.GetDatabaseOperator(),
	}, nil

}

func (s *NodeSchema) ToDatabaseQueryConfig() (*database.QueryConfig, error) {
	return &database.QueryConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", s.Configs),
		QueryFields:    getKeyOrZero[[]string]("QueryFields", s.Configs),
		OrderClauses:   getKeyOrZero[[]*crossdatabase.OrderClause]("OrderClauses", s.Configs),
		ClauseGroup:    getKeyOrZero[*crossdatabase.ClauseGroup]("ClauseGroup", s.Configs),
		OutputConfig:   s.OutputTypes,
		Limit:          mustGetKey[int64]("Limit", s.Configs),
		Op:             crossdatabase.GetDatabaseOperator(),
	}, nil
}

func (s *NodeSchema) ToDatabaseInsertConfig() (*database.InsertConfig, error) {
	inputTimeTypes := make(map[string]*vo.TypeInfo, len(s.InputTypes))
	fieldTypes := s.InputTypes["Fields"]
	for key, t := range fieldTypes.Properties {
		if t.Type == vo.DataTypeTime {
			inputTimeTypes[key] = t
		}
	}

	return &database.InsertConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", s.Configs),
		OutputConfig:   s.OutputTypes,
		InputTimeTypes: inputTimeTypes,
		Inserter:       crossdatabase.GetDatabaseOperator(),
	}, nil
}

func (s *NodeSchema) ToDatabaseDeleteConfig() (*database.DeleteConfig, error) {
	return &database.DeleteConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", s.Configs),
		ClauseGroup:    mustGetKey[*crossdatabase.ClauseGroup]("ClauseGroup", s.Configs),
		OutputConfig:   s.OutputTypes,
		Deleter:        crossdatabase.GetDatabaseOperator(),
	}, nil
}

func (s *NodeSchema) ToDatabaseUpdateConfig() (*database.UpdateConfig, error) {
	inputTimeTypes := make(map[string]*vo.TypeInfo, len(s.InputTypes))
	fieldTypes := s.InputTypes["Fields"]
	for key, t := range fieldTypes.Properties {
		if t.Type == vo.DataTypeTime {
			inputTimeTypes[key] = t
		}
	}
	return &database.UpdateConfig{
		DatabaseInfoID: mustGetKey[int64]("DatabaseInfoID", s.Configs),
		ClauseGroup:    mustGetKey[*crossdatabase.ClauseGroup]("ClauseGroup", s.Configs),
		OutputConfig:   s.OutputTypes,
		InputTimeTypes: inputTimeTypes,
		Updater:        crossdatabase.GetDatabaseOperator(),
	}, nil
}

func (s *NodeSchema) ToKnowledgeIndexerConfig() (*knowledge.IndexerConfig, error) {
	return &knowledge.IndexerConfig{
		KnowledgeID:      mustGetKey[int64]("KnowledgeID", s.Configs),
		ParsingStrategy:  mustGetKey[*crossknowledge.ParsingStrategy]("ParsingStrategy", s.Configs),
		ChunkingStrategy: mustGetKey[*crossknowledge.ChunkingStrategy]("ChunkingStrategy", s.Configs),
		KnowledgeIndexer: crossknowledge.GetKnowledgeOperator(),
	}, nil
}

func (s *NodeSchema) ToKnowledgeRetrieveConfig() (*knowledge.RetrieveConfig, error) {
	return &knowledge.RetrieveConfig{
		KnowledgeIDs:      mustGetKey[[]int64]("KnowledgeIDs", s.Configs),
		RetrievalStrategy: mustGetKey[*crossknowledge.RetrievalStrategy]("RetrievalStrategy", s.Configs),
		Retriever:         crossknowledge.GetKnowledgeOperator(),
	}, nil
}

func (s *NodeSchema) ToPluginConfig() (*plugin.Config, error) {
	return &plugin.Config{
		PluginID:      mustGetKey[int64]("PluginID", s.Configs),
		ToolID:        mustGetKey[int64]("ToolID", s.Configs),
		PluginVersion: mustGetKey[string]("PluginVersion", s.Configs),
		ToolService:   crossplugin.GetToolService(),
	}, nil

}

func (s *NodeSchema) ToCodeRunnerConfig() (*code.Config, error) {
	return &code.Config{
		Code:         mustGetKey[string]("Code", s.Configs),
		Language:     mustGetKey[crosscode.Language]("Language", s.Configs),
		OutputConfig: s.OutputTypes,
		Runner:       crosscode.GetCodeRunner(),
	}, nil
}

func (s *NodeSchema) ToCreateConversationConfig() (*conversation.CreateConversationConfig, error) {
	return &conversation.CreateConversationConfig{
		Creator: crossconversation.ConversationManagerImpl,
	}, nil
}

func (s *NodeSchema) ToClearMessageConfig() (*conversation.ClearMessageConfig, error) {
	return &conversation.ClearMessageConfig{
		Clearer: crossconversation.ConversationManagerImpl,
	}, nil
}

func (s *NodeSchema) ToMessageListConfig() (*conversation.MessageListConfig, error) {
	return &conversation.MessageListConfig{
		Lister: crossconversation.ConversationManagerImpl,
	}, nil
}

func (s *NodeSchema) ToIntentDetectorConfig(ctx context.Context) (*intentdetector.Config, error) {
	cfg := &intentdetector.Config{
		Intents:      mustGetKey[[]string]("Intents", s.Configs),
		SystemPrompt: getKeyOrZero[string]("SystemPrompt", s.Configs),
		IsFastMode:   getKeyOrZero[bool]("IsFastMode", s.Configs),
	}

	llmParams := mustGetKey[*model.LLMParams]("LLMParams", s.Configs)
	m, err := model.GetManager().GetModel(ctx, llmParams)
	if err != nil {
		return nil, err
	}
	cfg.ChatModel = m

	return cfg, nil
}

func (s *NodeSchema) ToSubWorkflowConfig(ctx context.Context, requireCheckpoint bool) (*subworkflow.Config, error) {
	var opts []WorkflowOption
	opts = append(opts, WithIDAsName(mustGetKey[int64]("WorkflowID", s.Configs)))
	if requireCheckpoint {
		opts = append(opts, WithParentRequireCheckpoint())
	}
	if s := execute.GetStaticConfig(); s != nil && s.MaxNodeCountPerWorkflow > 0 {
		opts = append(opts, WithMaxNodeCount(s.MaxNodeCountPerWorkflow))
	}
	wf, err := NewWorkflow(ctx, s.SubWorkflowSchema, opts...)
	if err != nil {
		return nil, err
	}

	return &subworkflow.Config{
		Runner: wf.Runner,
	}, nil
}

func (s *NodeSchema) GetImplicitInputFields() ([]*vo.FieldInfo, error) {
	switch s.Type {
	case entity.NodeTypeHTTPRequester:
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

func totRetrievalSearchType(s int64) (crossknowledge.SearchType, error) {
	switch s {
	case 0:
		return crossknowledge.SearchTypeSemantic, nil
	case 1:
		return crossknowledge.SearchTypeHybrid, nil
	case 20:
		return crossknowledge.SearchTypeFullText, nil
	default:
		return "", fmt.Errorf("invalid retrieval search type %v", s)
	}
}

// knowledgeRecallChatModel the chat model used by the knowledge base recall in the LLM node, not the user-configured model
func knowledgeRecallChatModel(ctx context.Context) (einomodel.BaseChatModel, error) {
	defaultChatModelParma := &model.LLMParams{
		ModelName:   "豆包·1.5·Pro·32k",
		ModelType:   1,
		Temperature: ptr.Of(0.5),
		MaxTokens:   4096,
	}
	return model.GetManager().GetModel(ctx, defaultChatModelParma)

}
