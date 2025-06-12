package compose

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
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

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
)

type NodeSchema struct {
	Key  vo.NodeKey `json:"key"`
	Name string     `json:"name"`

	Type entity.NodeType `json:"type"`

	// Configs are node specific configurations with pre-defined config key and config value.
	// Will not participate in request-time field mapping, nor as node's static values.
	// In a word, these Configs are INTERNAL to node's implementation, the workflow layer is not aware of them.
	Configs any `json:"configs,omitempty"`

	InputTypes   map[string]*vo.TypeInfo `json:"input_types,omitempty"`
	InputSources []*vo.FieldInfo         `json:"input_sources,omitempty"`

	OutputTypes   map[string]*vo.TypeInfo `json:"output_types,omitempty"`
	OutputSources []*vo.FieldInfo         `json:"output_sources,omitempty"` // only applicable to composite nodes such as Batch or Loop

	MetaConfigs *MetaConfig `json:"meta_configs,omitempty"` // generic configurations applicable to most nodes

	SubWorkflowSchema *WorkflowSchema `json:"sub_workflow_schema,omitempty"`

	Lambda *compose.Lambda // not serializable, used for internal test.
}

type MetaConfig struct {
	TimeoutMS   int64                `json:"timeout_ms,omitempty"`   // timeout in milliseconds, 0 means no timeout
	MaxRetry    int64                `json:"max_retry,omitempty"`    // max retry times, 0 means no retry
	ProcessType *vo.ErrorProcessType `json:"process_type,omitempty"` // error process type, 0 means throw error
	DataOnErr   string               `json:"data_on_err,omitempty"`  // data to return when error, effective when ProcessType==Default occurs
}

type Node struct {
	Lambda *compose.Lambda
}

func (s *NodeSchema) New(ctx context.Context, inner compose.Runnable[map[string]any, map[string]any],
	sc *WorkflowSchema, streamRun bool) (*Node, error) {
	if streamRun {
		if err := s.SetFullSources(sc.GetAllNodes()); err != nil {
			return nil, err
		}
	}

	switch s.Type {
	case entity.NodeTypeLambda:
		if s.Lambda == nil {
			return nil, fmt.Errorf("lambda is not defined for NodeTypeLambda")
		}

		return &Node{Lambda: s.Lambda}, nil
	case entity.NodeTypeLLM:
		conf, err := s.ToLLMConfig(ctx)
		if err != nil {
			return nil, err
		}

		l, err := llm.New(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableStreamableNodeWO(s, l.Chat, l.ChatStream), nil
	case entity.NodeTypeSelector:
		conf := s.ToSelectorConfig()

		sl, err := selector.NewSelector(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNode(s, sl.Select, withCallbackInputConverter(s.toSelectorCallbackInput(sc)), withCallbackOutputConverter(sl.ToCallbackOutput)), nil
	case entity.NodeTypeBatch:
		if inner == nil {
			return nil, fmt.Errorf("inner workflow must not be nil when creating batch node")
		}

		conf, err := s.ToBatchConfig(inner)
		if err != nil {
			return nil, err
		}

		b, err := batch.NewBatch(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNodeWO(s, b.Execute, withCallbackInputConverter(b.ToCallbackInput)), nil
	case entity.NodeTypeVariableAggregator:
		conf, err := s.ToVariableAggregatorConfig()
		if err != nil {
			return nil, err
		}

		va, err := variableaggregator.NewVariableAggregator(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableTransformableNode(s, va.Invoke, va.Transform,
			withCallbackInputConverter(va.ToCallbackInput),
			withCallbackOutputConverter(va.ToCallbackOutput),
			withInit(va.Init)), nil
	case entity.NodeTypeTextProcessor:
		conf, err := s.ToTextProcessorConfig()
		if err != nil {
			return nil, err
		}

		tp, err := textprocessor.NewTextProcessor(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNode(s, tp.Invoke), nil
	case entity.NodeTypeHTTPRequester:
		conf, err := s.ToHTTPRequesterConfig()
		if err != nil {
			return nil, err
		}

		hr, err := httprequester.NewHTTPRequester(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNode(s, hr.Invoke, withCallbackInputConverter(hr.ToCallbackInput)), nil
	case entity.NodeTypeContinue:
		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			return map[string]any{}, nil
		}
		return invokableNode(s, i), nil
	case entity.NodeTypeBreak:
		b, err := loop.NewBreak(ctx, &nodes.ParentIntermediateStore{})
		if err != nil {
			return nil, err
		}
		return invokableNode(s, b.DoBreak), nil
	case entity.NodeTypeVariableAssigner:
		handler := variable.GetVariableHandler()

		conf, err := s.ToVariableAssignerConfig(handler)
		if err != nil {
			return nil, err
		}
		va, err := variableassigner.NewVariableAssigner(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNode(s, va.Assign), nil
	case entity.NodeTypeVariableAssignerWithinLoop:
		conf, err := s.ToVariableAssignerInLoopConfig()
		if err != nil {
			return nil, err
		}

		va, err := variableassigner.NewVariableAssignerInLoop(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNode(s, va.Assign), nil
	case entity.NodeTypeLoop:
		conf, err := s.ToLoopConfig(inner)
		if err != nil {
			return nil, err
		}
		l, err := loop.NewLoop(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNodeWO(s, l.Execute, withCallbackInputConverter(l.ToCallbackInput)), nil
	case entity.NodeTypeQuestionAnswer:
		conf, err := s.ToQAConfig(ctx)
		if err != nil {
			return nil, err
		}
		qA, err := qa.NewQuestionAnswer(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, qA.Execute, withCallbackOutputConverter(qA.ToCallbackOutput)), nil
	case entity.NodeTypeInputReceiver:
		conf, err := s.ToInputReceiverConfig()
		if err != nil {
			return nil, err
		}
		inputR, err := receiver.New(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, inputR.Invoke), nil
	case entity.NodeTypeOutputEmitter:
		conf, err := s.ToOutputEmitterConfig(sc)
		if err != nil {
			return nil, err
		}

		e, err := emitter.New(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableTransformableNode(s, e.Emit, e.EmitStream), nil
	case entity.NodeTypeEntry:
		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			return in, nil
		}
		return invokableNode(s, i), nil
	case entity.NodeTypeExit:
		terminalPlan := mustGetKey[vo.TerminatePlan]("TerminalPlan", s.Configs)
		if terminalPlan == vo.ReturnVariables {
			i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
				return in, nil
			}
			return invokableNode(s, i), nil
		}

		conf, err := s.ToOutputEmitterConfig(sc)
		if err != nil {
			return nil, err
		}

		e, err := emitter.New(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableTransformableNode(s, e.Emit, e.EmitStream), nil
	case entity.NodeTypeDatabaseCustomSQL:
		conf, err := s.ToDatabaseCustomSQLConfig()
		if err != nil {
			return nil, err
		}

		sqlER, err := database.NewCustomSQL(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, sqlER.Execute), nil
	case entity.NodeTypeDatabaseQuery:
		conf, err := s.ToDatabaseQueryConfig()
		if err != nil {
			return nil, err
		}

		query, err := database.NewQuery(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNode(s, query.Query, withCallbackInputConverter(query.ToCallbackInput)), nil
	case entity.NodeTypeDatabaseInsert:
		conf, err := s.ToDatabaseInsertConfig()
		if err != nil {
			return nil, err
		}

		insert, err := database.NewInsert(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNode(s, insert.Insert, withCallbackInputConverter(insert.ToCallbackInput)), nil
	case entity.NodeTypeDatabaseUpdate:
		conf, err := s.ToDatabaseUpdateConfig()
		if err != nil {
			return nil, err
		}
		update, err := database.NewUpdate(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, update.Update, withCallbackInputConverter(update.ToCallbackInput)), nil
	case entity.NodeTypeDatabaseDelete:
		conf, err := s.ToDatabaseDeleteConfig()
		if err != nil {
			return nil, err
		}
		del, err := database.NewDelete(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNode(s, del.Delete, withCallbackInputConverter(del.ToCallbackInput)), nil
	case entity.NodeTypeKnowledgeIndexer:
		conf, err := s.ToKnowledgeIndexerConfig()
		if err != nil {
			return nil, err
		}
		w, err := knowledge.NewKnowledgeIndexer(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, w.Store), nil
	case entity.NodeTypeKnowledgeRetriever:
		conf, err := s.ToKnowledgeRetrieveConfig()
		if err != nil {
			return nil, err
		}
		r, err := knowledge.NewKnowledgeRetrieve(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, r.Retrieve), nil
	case entity.NodeTypeCodeRunner:
		conf, err := s.ToCodeRunnerConfig()
		if err != nil {
			return nil, err
		}
		r, err := code.NewCodeRunner(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, r.RunCode), nil
	case entity.NodeTypePlugin:
		conf, err := s.ToPluginConfig()
		if err != nil {
			return nil, err
		}
		r, err := plugin.NewPlugin(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, r.Invoke), nil
	case entity.NodeTypeCreateConversation:
		conf, err := s.ToCreateConversationConfig()
		if err != nil {
			return nil, err
		}
		r, err := conversation.NewCreateConversation(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, r.Create), nil
	case entity.NodeTypeMessageList:
		conf, err := s.ToMessageListConfig()
		if err != nil {
			return nil, err
		}
		r, err := conversation.NewMessageList(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, r.List), nil
	case entity.NodeTypeClearMessage:
		conf, err := s.ToClearMessageConfig()
		if err != nil {
			return nil, err
		}
		r, err := conversation.NewClearMessage(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, r.Clear), nil
	case entity.NodeTypeIntentDetector:
		conf, err := s.ToIntentDetectorConfig(ctx)
		if err != nil {
			return nil, err
		}
		r, err := intentdetector.NewIntentDetector(ctx, conf)
		if err != nil {
			return nil, err
		}

		return invokableNode(s, r.Invoke), nil
	case entity.NodeTypeSubWorkflow:
		conf, err := s.ToSubWorkflowConfig(ctx, sc.requireCheckPoint)
		if err != nil {
			return nil, err
		}
		r, err := subworkflow.NewSubWorkflow(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableStreamableNodeWO(s, r.Invoke, r.Stream), nil
	default:
		panic("not implemented")
	}
}

func (s *NodeSchema) IsEnableUserQuery() bool {
	if s == nil {
		return false
	}
	if s.Type != entity.NodeTypeEntry {
		return false
	}

	if len(s.OutputSources) == 0 {
		return false
	}

	for _, source := range s.OutputSources {
		fieldPath := source.Path
		if len(fieldPath) == 1 && (fieldPath[0] == "BOT_USER_INPUT" || fieldPath[0] == "USER_INPUT") {
			return true
		}
	}

	return false

}

func (s *NodeSchema) IsEnableChatHistory() bool {
	if s == nil {
		return false
	}

	switch s.Type {

	case entity.NodeTypeLLM:
		llmParam := mustGetKey[*model.LLMParams]("LLMParams", s.Configs)
		return llmParam.EnableChatHistory
	case entity.NodeTypeIntentDetector:
		llmParam := mustGetKey[*model.LLMParams]("LLMParams", s.Configs)
		return llmParam.EnableChatHistory
	default:
		return false
	}

}

func (s *NodeSchema) IsRefGlobalVariable() bool {
	for _, source := range s.InputSources {
		if source.IsRefGlobalVariable() {
			return true
		}
	}
	for _, source := range s.OutputSources {
		if source.IsRefGlobalVariable() {
			return true
		}
	}

	fields, err := s.GetImplicitInputFields()
	if err != nil {
		return false
	}

	for _, source := range fields {
		if source.IsRefGlobalVariable() {
			return true
		}

	}

	return false
}

func (s *NodeSchema) requireCheckpoint() bool {
	if s.Type == entity.NodeTypeQuestionAnswer || s.Type == entity.NodeTypeInputReceiver {
		return true
	}

	if s.Type == entity.NodeTypeLLM {
		fcParams := getKeyOrZero[*vo.FCParam]("FCParam", s.Configs)
		if fcParams != nil && fcParams.WorkflowFCParam != nil {
			return true
		}
	}

	if s.Type == entity.NodeTypeSubWorkflow {
		s.SubWorkflowSchema.Init()
		if s.SubWorkflowSchema.requireCheckPoint {
			return true
		}
	}

	return false
}
