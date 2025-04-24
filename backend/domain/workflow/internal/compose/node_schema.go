package compose

import (
	"context"
	"errors"
	"fmt"

	"github.com/cloudwego/eino/callbacks"

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
	loop2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/plugin"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/qa"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/subworkflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/textprocessor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/variableaggregator"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/variableassigner"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
	"github.com/spf13/cast"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
)

type NodeSchema struct {
	Key  nodes.NodeKey `json:"key"`
	Name string        `json:"name"`

	Type nodes.NodeType `json:"type"`

	// Configs are node specific configurations with pre-defined config key and config value.
	// Will not participate in request-time field mapping, nor as node's static values.
	// In a word, these Configs are INTERNAL to node's implementation, the workflow layer is not aware of them.
	Configs any `json:"configs,omitempty"`

	InputTypes   map[string]*nodes.TypeInfo `json:"input_types,omitempty"`
	InputSources []*nodes.FieldInfo         `json:"input_sources,omitempty"`

	OutputTypes   map[string]*nodes.TypeInfo `json:"output_types,omitempty"`
	OutputSources []*nodes.FieldInfo         `json:"output_sources,omitempty"`

	SubWorkflowSchema *WorkflowSchema `json:"sub_workflow_schema,omitempty"`

	Lambda *compose.Lambda // not serializable, used for internal test.
}

type Node struct {
	Lambda          *compose.Lambda
	InterruptBefore bool
}

func (s *NodeSchema) New(ctx context.Context, inner compose.Runnable[map[string]any, map[string]any]) (*Node, error) {
	switch s.Type {
	case nodes.NodeTypeLambda:
		if s.Lambda == nil {
			return nil, fmt.Errorf("lambda is not defined for NodeTypeLambda")
		}

		return &Node{Lambda: s.Lambda}, nil
	case nodes.NodeTypeLLM:
		conf, err := s.ToLLMConfig(ctx)
		if err != nil {
			return nil, err
		}

		l, err := llm.New(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any, opts ...any) (out map[string]any, err error) {
			ctx = nodes.NewTokenCollector(ctx)

			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, out)
				}
			}()

			ctx = callbacks.OnStart(ctx, in)

			pre := s.inputValueFiller()
			if pre != nil {
				if in, err = pre(ctx, in); err != nil {
					return nil, err
				}
			}

			if out, err = l.Chat(ctx, in); err != nil {
				return nil, err
			}

			post := s.outputValueFiller()
			if post != nil {
				if out, err = post(ctx, out); err != nil {
					return nil, err
				}
			}

			return out, nil
		}

		s := func(ctx context.Context, in map[string]any, opts ...any) (out *schema.StreamReader[map[string]any], err error) {
			ctx = nodes.NewTokenCollector(ctx)

			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_, out = callbacks.OnEndWithStreamOutput(ctx, out)
				}
			}()

			ctx = callbacks.OnStart(ctx, in)

			pre := s.inputValueFiller()
			if pre != nil {
				if in, err = pre(ctx, in); err != nil {
					return nil, err
				}
			}

			return l.ChatStream(ctx, in)
		}

		lambda, err := compose.AnyLambda(i, s, nil, nil, compose.WithLambdaType(string(nodes.NodeTypeLLM)), compose.WithLambdaCallbackEnable(true))
		if err != nil {
			return nil, err
		}

		return &Node{Lambda: lambda}, nil
	case nodes.NodeTypeSelector:
		conf, err := s.ToSelectorConfig()
		if err != nil {
			return nil, err
		}

		sl, err := selector.NewSelector(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any) (out int, err error) {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					callbackOutput, err := s.ToSelectorCallbackOutput(out)
					if err != nil {
						_ = callbacks.OnError(ctx, err)
					} else {
						_ = callbacks.OnEnd(ctx, callbackOutput)
					}
				}
			}()

			callbackInput, err := s.ToSelectorCallbackInput(in)
			if err != nil {
				return -1, err
			}
			ctx = callbacks.OnStart(ctx, callbackInput)

			newIn, err := s.SelectorInputConverter(in)
			if err != nil {
				return -1, err
			}

			return sl.Select(ctx, newIn)
		}

		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeSelector)), compose.WithLambdaCallbackEnable(true))}, nil
	case nodes.NodeTypeBatch:
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

		i := postDecorate(preDecorate(b.Execute, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeBatch)), compose.WithLambdaCallbackEnable(b.IsCallbacksEnabled()))}, nil
	case nodes.NodeTypeVariableAggregator:
		conf, err := s.ToVariableAggregatorConfig()
		if err != nil {
			return nil, err
		}

		va, err := variableaggregator.NewVariableAggregator(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
			newIn, err := s.VariableAggregatorInputConverter(in)
			if err != nil {
				return nil, err
			}

			return va.Invoke(ctx, newIn)
		}

		i = postDecorate(i, s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeVariableAggregator)))}, nil
	case nodes.NodeTypeTextProcessor:
		conf, err := s.ToTextProcessorConfig()
		if err != nil {
			return nil, err
		}

		tp, err := textprocessor.NewTextProcessor(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := postDecorate(preDecorate(tp.Invoke, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeTextProcessor)))}, nil
	case nodes.NodeTypeHTTPRequester:
		conf, err := s.ToHTTPRequesterConfig()
		if err != nil {
			return nil, err
		}

		hr, err := httprequester.NewHTTPRequester(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := postDecorate(preDecorate(hr.Invoke, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeHTTPRequester)))}, nil
	case nodes.NodeTypeContinue:
		i := func(ctx context.Context, in map[string]any, opts ...any) (map[string]any, error) {
			return map[string]any{}, nil
		}
		c := func(ctx context.Context, in *schema.StreamReader[map[string]any], opts ...any) (map[string]any, error) {
			in.Close()
			return map[string]any{}, nil
		}
		l, err := compose.AnyLambda(i, nil, c, nil, compose.WithLambdaType(string(nodes.NodeTypeContinue)))
		if err != nil {
			return nil, err
		}
		return &Node{Lambda: l}, nil
	case nodes.NodeTypeBreak:
		b, err := loop2.NewBreak(ctx, &nodes.ParentIntermediateStore{})
		if err != nil {
			return nil, err
		}
		i := func(ctx context.Context, in map[string]any, opts ...any) (map[string]any, error) {
			if err := b.DoBreak(ctx); err != nil {
				return nil, err
			}
			return map[string]any{}, nil
		}
		c := func(ctx context.Context, in *schema.StreamReader[map[string]any], opts ...any) (map[string]any, error) {
			in.Close()
			if err := b.DoBreak(ctx); err != nil {
				return nil, err
			}
			return map[string]any{}, nil
		}
		l, err := compose.AnyLambda(i, nil, c, nil, compose.WithLambdaType(string(nodes.NodeTypeBreak)))
		if err != nil {
			return nil, err
		}
		return &Node{Lambda: l}, nil
	case nodes.NodeTypeVariableAssigner, nodes.NodeTypeVariableAssignerWithinLoop:
		handler := variable.GetVariableHandler()

		conf, err := s.ToVariableAssignerConfig(handler)
		if err != nil {
			return nil, err
		}
		va, err := variableassigner.NewVariableAssigner(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			err := va.Assign(ctx, in)
			if err != nil {
				return nil, err
			}

			return map[string]any{}, nil
		}
		opt := compose.WithLambdaType(string(nodes.NodeTypeVariableAssigner))
		if s.Type == nodes.NodeTypeVariableAssignerWithinLoop {
			opt = compose.WithLambdaType(string(nodes.NodeTypeVariableAssignerWithinLoop))
		}
		return &Node{Lambda: compose.InvokableLambda(i, opt)}, nil
	case nodes.NodeTypeLoop:
		conf, err := s.ToLoopConfig(inner)
		if err != nil {
			return nil, err
		}
		l, err := loop2.NewLoop(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorateWO(preDecorateWO(l.Execute, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambdaWithOption(i, compose.WithLambdaType(string(nodes.NodeTypeLoop)))}, nil
	case nodes.NodeTypeQuestionAnswer:
		conf, err := s.ToQAConfig(ctx)
		if err != nil {
			return nil, err
		}
		qA, err := qa.NewQuestionAnswer(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(qA.Execute, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeQuestionAnswer)))}, nil
	case nodes.NodeTypeInputReceiver:
		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			return in, nil
		}
		i = postDecorate(i, s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeInputReceiver))), InterruptBefore: true}, nil
	case nodes.NodeTypeOutputEmitter:
		conf, err := s.ToOutputEmitterConfig()
		if err != nil {
			return nil, err
		}

		e, err := emitter.New(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any, _ ...any) (map[string]any, error) {
			pre := s.inputValueFiller()
			if pre != nil {
				in, err = pre(ctx, in)
				if err != nil {
					return nil, err
				}
			}

			_, err := e.Emit(ctx, in)
			if err != nil {
				return nil, err
			}

			return map[string]any{}, nil
		}

		t := func(ctx context.Context, in *schema.StreamReader[map[string]any], _ ...any) (*schema.StreamReader[map[string]any], error) {
			outStream, err := e.EmitStream(ctx, in)
			if err != nil {
				return nil, err
			}
			outStream.Close()
			sr, sw := schema.Pipe[map[string]any](0)
			sw.Close()
			sr.Close()
			return sr, nil
		}

		lambda, err := compose.AnyLambda(i, nil, nil, t, compose.WithLambdaCallbackEnable(e.IsCallbacksEnabled()), compose.WithLambdaType(string(nodes.NodeTypeOutputEmitter)))
		if err != nil {
			return nil, err
		}

		return &Node{Lambda: lambda}, nil
	case nodes.NodeTypeEntry:
		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			return in, nil
		}
		i = postDecorate(i, s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeEntry)))}, nil
	case nodes.NodeTypeExit:
		conf, err := s.ToOutputEmitterConfig()
		if err != nil {
			return nil, err
		}

		e, err := emitter.New(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any, _ ...any) (out map[string]any, err error) {
			pre := s.inputValueFiller()
			if pre != nil {
				in, err = pre(ctx, in)
				if err != nil {
					return nil, err
				}
			}

			_, err = e.Emit(ctx, in)
			if err != nil {
				return nil, err
			}

			post := s.outputValueFiller()
			if post != nil {
				out, err = post(ctx, in)
				if err != nil {
					return nil, err
				}
				return out, nil
			}

			return in, nil
		}

		t := func(ctx context.Context, in *schema.StreamReader[map[string]any], _ ...any) (*schema.StreamReader[map[string]any], error) {
			return e.EmitStream(ctx, in)
		}

		lambda, err := compose.AnyLambda(i, nil, nil, t, compose.WithLambdaCallbackEnable(e.IsCallbacksEnabled()), compose.WithLambdaType(string(nodes.NodeTypeExit)))
		if err != nil {
			return nil, err
		}

		return &Node{Lambda: lambda}, nil
	case nodes.NodeTypeDatabaseCustomSQL:
		conf, err := s.ToDatabaseCustomSQLConfig()
		if err != nil {
			return nil, err
		}

		sqlER, err := database.NewCustomSQL(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(sqlER.Execute, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeDatabaseCustomSQL)))}, nil
	case nodes.NodeTypeDatabaseQuery:
		conf, err := s.ToDatabaseQueryConfig()
		if err != nil {
			return nil, err
		}

		query, err := database.NewQuery(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			conditionGroup, err := database.ConvertClauseGroupToConditionGroup(ctx, conf.ClauseGroup, in)
			if err != nil {
				return nil, err
			}
			return query.Query(ctx, conditionGroup)
		}
		i = preDecorate(i, s.inputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeDatabaseQuery)))}, nil
	case nodes.NodeTypeDatabaseInsert:
		conf, err := s.ToDatabaseInsertConfig()
		if err != nil {
			return nil, err
		}

		insert, err := database.NewInsert(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := preDecorate(insert.Insert, s.inputValueFiller())

		return &Node{Lambda: compose.InvokableLambda(i)}, nil
	case nodes.NodeTypeDatabaseUpdate:
		conf, err := s.ToDatabaseUpdateConfig()
		if err != nil {
			return nil, err
		}
		update, err := database.NewUpdate(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			inventory, err := database.ConvertClauseGroupToUpdateInventory(ctx, conf.ClauseGroup, in)
			if err != nil {
				return nil, err
			}
			return update.Update(ctx, inventory)
		}

		i = preDecorate(i, s.inputValueFiller())

		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeDatabaseUpdate)))}, nil
	case nodes.NodeTypeDatabaseDelete:
		conf, err := s.ToDatabaseDeleteConfig()
		if err != nil {
			return nil, err
		}

		del, err := database.NewDelete(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			conditionGroup, err := database.ConvertClauseGroupToConditionGroup(ctx, conf.ClauseGroup, in)
			if err != nil {
				return nil, err
			}
			return del.Delete(ctx, conditionGroup)
		}

		i = preDecorate(i, s.inputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeDatabaseDelete)))}, nil
	case nodes.NodeTypeKnowledgeIndexer:
		conf, err := s.ToKnowledgeIndexerConfig()
		if err != nil {
			return nil, err
		}
		w, err := knowledge.NewKnowledgeIndexer(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(w.Store, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeKnowledgeIndexer)))}, nil
	case nodes.NodeTypeKnowledgeRetriever:
		conf, err := s.ToKnowledgeRetrieveConfig()
		if err != nil {
			return nil, err
		}
		r, err := knowledge.NewKnowledgeRetrieve(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.Retrieve, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeKnowledgeRetriever)))}, nil
	case nodes.NodeTypeCodeRunner:
		conf, err := s.ToCodeRunnerConfig()
		if err != nil {
			return nil, err
		}
		r, err := code.NewCodeRunner(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.RunCode, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeCodeRunner)))}, nil
	case nodes.NodeTypePlugin:
		conf, err := s.ToPluginConfig()
		if err != nil {
			return nil, err
		}
		r, err := plugin.NewPlugin(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.Invoke, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypePlugin)))}, nil
	case nodes.NodeTypeCreateConversation:
		conf, err := s.ToCreateConversationConfig()
		if err != nil {
			return nil, err
		}
		r, err := conversation.NewCreateConversation(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.Create, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeCreateConversation)))}, nil
	case nodes.NodeTypeMessageList:
		conf, err := s.ToMessageListConfig()
		if err != nil {
			return nil, err
		}
		r, err := conversation.NewMessageList(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.List, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeMessageList)))}, nil
	case nodes.NodeTypeClearMessage:
		conf, err := s.ToClearMessageConfig()
		if err != nil {
			return nil, err
		}
		r, err := conversation.NewClearMessage(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.Clear, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(nodes.NodeTypeClearMessage)))}, nil
	case nodes.NodeTypeIntentDetector:
		conf, err := s.ToIntentDetectorConfig(ctx)
		if err != nil {
			return nil, err
		}
		r, err := intentdetector.NewIntentDetector(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.Invoke, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i)}, nil
	case nodes.NodeTypeSubWorkflow:
		conf, err := s.ToSubWorkflowConfig(ctx)
		if err != nil {
			return nil, err
		}
		r, err := subworkflow.NewSubWorkflow(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorateWO(preDecorateWO(r.Invoke, s.inputValueFiller()), s.outputValueFiller())
		s := func(ctx context.Context, in map[string]any, opts ...compose.Option) (*schema.StreamReader[map[string]any], error) {
			in, err := s.inputValueFiller()(ctx, in)
			if err != nil {
				return nil, err
			}
			return r.Stream(ctx, in, opts...)
		}

		l, err := compose.AnyLambda(i, s, nil, nil, compose.WithLambdaType(string(nodes.NodeTypeSubWorkflow)))
		return &Node{Lambda: l}, nil
	default:
		panic("not implemented")
	}
}

type State struct {
	VarHandler *variable.Handler
	Answers    map[nodes.NodeKey][]string
	Questions  map[nodes.NodeKey][]*qa.Question
	Inputs     map[nodes.NodeKey]map[string]any
}

func init() {
	_ = compose.RegisterSerializableType[*State]("schema_state")
	_ = compose.RegisterSerializableType[*variable.Handler]("variable_handler")
	_ = compose.RegisterSerializableType[*nodes.ParentIntermediateStore]("parent_intermediate_store")
	_ = compose.RegisterSerializableType[[]*qa.Question]("qa_question_list")
	_ = compose.RegisterSerializableType[qa.Question]("qa_question")
	_ = compose.RegisterSerializableType[map[string]any]("map[string]any")
	_ = compose.RegisterSerializableType[[]string]("[]string")
	_ = compose.RegisterSerializableType[nodes.NodeKey]("node_key")

	variable.SetVariableHandler(&variable.Handler{
		ParentIntermediateVarStore: &nodes.ParentIntermediateStore{},
	})
}

func (s *State) AddQuestion(nodeKey nodes.NodeKey, question *qa.Question) {
	s.Questions[nodeKey] = append(s.Questions[nodeKey], question)
}

func GenState() compose.GenLocalState[*State] {
	return func(ctx context.Context) (state *State) {
		return &State{
			VarHandler: variable.GetVariableHandler(),
			Answers:    make(map[nodes.NodeKey][]string),
			Questions:  make(map[nodes.NodeKey][]*qa.Question),
			Inputs:     make(map[nodes.NodeKey]map[string]any),
		}
	}
}

func (s *NodeSchema) StatePreHandler() compose.StatePreHandler[map[string]any, *State] {
	var handlers []compose.StatePreHandler[map[string]any, *State]

	handlerForVars := s.statePreHandlerForVars()
	if handlerForVars != nil {
		handlers = append(handlers, handlerForVars)
	}

	if s.Type == nodes.NodeTypeQuestionAnswer {
		handlers = append(handlers, func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			if len(in) > 0 {
				state.Inputs[s.Key] = in
				return in, nil
			}

			out := make(map[string]any)
			for k, v := range state.Inputs[s.Key] {
				out[k] = v
			}

			out[qa.QuestionsKey] = state.Questions[s.Key]
			out[qa.AnswersKey] = state.Answers[s.Key]
			return out, nil
		})
	} else if s.Type == nodes.NodeTypeInputReceiver { // if state has this node's input, use it
		handlers = append(handlers, func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			if userInput, ok := state.Inputs[s.Key]; ok && len(userInput) > 0 {
				return userInput, nil
			}
			return in, nil
		})
	}

	if len(handlers) == 0 {
		return nil
	}

	return func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
		var err error
		for _, h := range handlers {
			in, err = h(ctx, in, state)
			if err != nil {
				return nil, err
			}
		}

		return in, nil
	}
}

func (s *NodeSchema) statePreHandlerForVars() compose.StatePreHandler[map[string]any, *State] {
	// checkout the node's inputs, if it has any variable, use the state's variableHandler to get the variables and set them to the input
	var vars []*nodes.FieldInfo
	for _, input := range s.InputSources {
		if input.Source.Ref != nil && input.Source.Ref.VariableType != nil {
			vars = append(vars, input)
		}
	}

	if len(vars) == 0 {
		return nil
	}

	return func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
		out := make(map[string]any)
		for k, v := range in {
			out[k] = v
		}

		for _, input := range vars {
			v, err := state.VarHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath)
			if err != nil {
				return nil, err
			}
			nodes.SetMapValue(out, input.Path, v)
		}

		return out, nil
	}
}

func (s *NodeSchema) OutputPortCount() int {
	switch s.Type {
	case nodes.NodeTypeSelector:
		return len(s.Configs.([]*selector.OneClauseSchema)) + 1
	case nodes.NodeTypeQuestionAnswer:
		if mustGetKey[qa.AnswerType]("AnswerType", s.Configs.(map[string]any)) == qa.AnswerByChoices {
			if mustGetKey[qa.ChoiceType]("ChoiceType", s.Configs.(map[string]any)) == qa.FixedChoices {
				return len(mustGetKey[[]string]("FixedChoices", s.Configs.(map[string]any))) + 1
			} else {
				return 2
			}
		}
		return 1
	case nodes.NodeTypeIntentDetector:
		intents := mustGetKey[[]string]("Intents", s.Configs.(map[string]any))
		return len(intents) + 1
	default:
		return 1
	}
}

type BranchMapping []map[string]bool

const (
	DefaultBranch = "default"
	BranchFmt     = "branch_%d"
)

func (s *NodeSchema) GetBranch(bMapping *BranchMapping) (*compose.GraphBranch, error) {
	if bMapping == nil || len(*bMapping) == 0 {
		return nil, errors.New("no branch mapping")
	}

	endNodes := make(map[string]bool)
	for i := range *bMapping {
		for k := range (*bMapping)[i] {
			endNodes[k] = true
		}
	}

	switch s.Type {
	case nodes.NodeTypeSelector:
		condition := func(ctx context.Context, choice int) (map[string]bool, error) {
			if choice < 0 || choice > len(*bMapping) {
				return nil, fmt.Errorf("node %s choice out of range: %d", s.Key, choice)
			}

			choices := make(map[string]bool, len((*bMapping)[choice]))
			for k := range (*bMapping)[choice] {
				choices[k] = true
			}

			return choices, nil
		}
		return compose.NewGraphMultiBranch(condition, endNodes), nil
	case nodes.NodeTypeQuestionAnswer:
		conf := s.Configs.(map[string]any)
		if mustGetKey[qa.AnswerType]("AnswerType", conf) == qa.AnswerByChoices {
			condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
				optionID, ok := nodes.TakeMapValue(in, compose.FieldPath{qa.OptionIDKey})
				if !ok {
					return nil, fmt.Errorf("failed to take option id from input map: %v", in)
				}

				if optionID.(string) == "other" {
					return (*bMapping)[len(*bMapping)-1], nil
				}

				optionIDInt, ok := qa.AlphabetToInt(optionID.(string))
				if !ok {
					return nil, fmt.Errorf("failed to convert option id from input map: %v", optionID)
				}

				if optionIDInt < 0 || optionIDInt >= len(*bMapping)-1 {
					return nil, fmt.Errorf("failed to take option id from input map: %v", in)
				}

				return (*bMapping)[optionIDInt], nil
			}
			return compose.NewGraphMultiBranch(condition, endNodes), nil
		}
		return nil, fmt.Errorf("this qa node should not have branches: %s", s.Key)

	case nodes.NodeTypeIntentDetector:
		condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
			classificationId, ok := nodes.TakeMapValue(in, compose.FieldPath{"classificationId"})
			if !ok {
				return nil, fmt.Errorf("failed to take classification id from input map: %v", in)
			}

			// Intent detector the node default branch uses classificationId=0. But currently scene, the implementation uses default as the last element of the array.
			// Therefore, when classificationId=0, it needs to be converted into the node corresponding to the last index of the array.
			// Other options also need to reduce the index by 1.
			id, err := cast.ToInt64E(classificationId)
			if err != nil {
				return nil, err
			}
			realID := id - 1

			if realID >= int64(len(*bMapping)) {
				return nil, fmt.Errorf("invalid classification id from input, classification id: %v", classificationId)
			}

			if realID < 0 {
				realID = int64(len(*bMapping)) - 1
			}

			return (*bMapping)[realID], nil
		}
		return compose.NewGraphMultiBranch(condition, endNodes), nil
	default:
		return nil, fmt.Errorf("this node should not have branches: %s", s.Key)
	}
}

func (s *NodeSchema) RequiresStreaming() bool {
	switch s.Type {
	case nodes.NodeTypeOutputEmitter, nodes.NodeTypeExit, nodes.NodeTypeSubWorkflow:
		mode := getKeyOrZero[nodes.Mode]("Mode", s.Configs)
		return mode == nodes.Streaming
	default:
		return false
	}
}

func (s *NodeSchema) SetStreamSources(allNS map[nodes.NodeKey]*NodeSchema) error {
	if s.Type != nodes.NodeTypeOutputEmitter && s.Type != nodes.NodeTypeExit {
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
				streamSources := getKeyOrZero[[]*nodes.FieldInfo]("StreamSources", s.Configs)
				if len(streamSources) == 0 {
					streamSources = make([]*nodes.FieldInfo, 0)
					if s.Configs == nil {
						s.Configs = make(map[string]any)
					}
					s.Configs.(map[string]any)["StreamSources"] = streamSources
				}
				s.Configs.(map[string]any)["StreamSources"] = append(s.Configs.(map[string]any)["StreamSources"].([]*nodes.FieldInfo), fInfo)
			}
		}
	}

	return nil
}

func (s *NodeSchema) IsStreamingField(path compose.FieldPath) (bool, error) {
	if s.Type == nodes.NodeTypeExit {
		if mustGetKey[nodes.Mode]("Mode", s.Configs) == nodes.Streaming {
			if len(path) == 1 && path[0] == "output" {
				return true, nil
			}
		}

		return false, nil
	}

	if s.Type == nodes.NodeTypeSubWorkflow {
		subSC := s.SubWorkflowSchema
		subExit := subSC.GetNode(ExitNodeKey)
		ok, err := subExit.IsStreamingField(path)
		if err != nil {
			return false, err
		}

		return ok, nil
	}

	if s.Type != nodes.NodeTypeLLM {
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
		if output.Type != nodes.DataTypeString {
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
