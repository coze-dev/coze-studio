package compose

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/callbacks"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

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
	loop2 "code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
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
	OutputSources []*vo.FieldInfo         `json:"output_sources,omitempty"`

	SubWorkflowSchema *WorkflowSchema `json:"sub_workflow_schema,omitempty"`

	Lambda *compose.Lambda // not serializable, used for internal test.
}

type Node struct {
	Lambda *compose.Lambda
}

func (s *NodeSchema) New(ctx context.Context, inner compose.Runnable[map[string]any, map[string]any]) (*Node, error) {
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

		i := func(ctx context.Context, in map[string]any, opts ...any) (out map[string]any, err error) {
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

		lambda, err := compose.AnyLambda(i, s, nil, nil, compose.WithLambdaType(string(entity.NodeTypeLLM)), compose.WithLambdaCallbackEnable(true))
		if err != nil {
			return nil, err
		}

		return &Node{Lambda: lambda}, nil
	case entity.NodeTypeSelector:
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

		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeSelector)), compose.WithLambdaCallbackEnable(true))}, nil
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

		i := postDecorateWO(preDecorateWO(b.Execute, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambdaWithOption(i, compose.WithLambdaType(string(entity.NodeTypeBatch)))}, nil
	case entity.NodeTypeVariableAggregator:
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
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeVariableAggregator)))}, nil
	case entity.NodeTypeTextProcessor:
		conf, err := s.ToTextProcessorConfig()
		if err != nil {
			return nil, err
		}

		tp, err := textprocessor.NewTextProcessor(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := postDecorate(preDecorate(tp.Invoke, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeTextProcessor)))}, nil
	case entity.NodeTypeHTTPRequester:
		conf, err := s.ToHTTPRequesterConfig()
		if err != nil {
			return nil, err
		}

		hr, err := httprequester.NewHTTPRequester(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, out)
				}
			}()
			callbackInput, err := s.ToHttpRequesterCallbackInput(conf, in)
			if err != nil {
				return nil, err
			}
			ctx = callbacks.OnStart(ctx, callbackInput)
			return hr.Invoke(ctx, in)
		}

		i = postDecorate(preDecorate(i, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaCallbackEnable(true), compose.WithLambdaType(string(entity.NodeTypeHTTPRequester)))}, nil
	case entity.NodeTypeContinue:
		i := func(ctx context.Context, in map[string]any, opts ...any) (map[string]any, error) {
			return map[string]any{}, nil
		}
		c := func(ctx context.Context, in *schema.StreamReader[map[string]any], opts ...any) (map[string]any, error) {
			in.Close()
			return map[string]any{}, nil
		}
		l, err := compose.AnyLambda(i, nil, c, nil, compose.WithLambdaType(string(entity.NodeTypeContinue)))
		if err != nil {
			return nil, err
		}
		return &Node{Lambda: l}, nil
	case entity.NodeTypeBreak:
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
		l, err := compose.AnyLambda(i, nil, c, nil, compose.WithLambdaType(string(entity.NodeTypeBreak)))
		if err != nil {
			return nil, err
		}
		return &Node{Lambda: l}, nil
	case entity.NodeTypeVariableAssigner, entity.NodeTypeVariableAssignerWithinLoop:
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
		opt := compose.WithLambdaType(string(entity.NodeTypeVariableAssigner))
		if s.Type == entity.NodeTypeVariableAssignerWithinLoop {
			opt = compose.WithLambdaType(string(entity.NodeTypeVariableAssignerWithinLoop))
		}
		return &Node{Lambda: compose.InvokableLambda(i, opt)}, nil
	case entity.NodeTypeLoop:
		conf, err := s.ToLoopConfig(inner)
		if err != nil {
			return nil, err
		}
		l, err := loop2.NewLoop(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorateWO(preDecorateWO(l.Execute, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambdaWithOption(i, compose.WithLambdaType(string(entity.NodeTypeLoop)))}, nil
	case entity.NodeTypeQuestionAnswer:
		conf, err := s.ToQAConfig(ctx)
		if err != nil {
			return nil, err
		}
		qA, err := qa.NewQuestionAnswer(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(qA.Execute, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeQuestionAnswer)))}, nil
	case entity.NodeTypeInputReceiver:
		conf, err := s.ToInputReceiverConfig()
		if err != nil {
			return nil, err
		}
		inputR, err := receiver.New(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			if in == nil {
				return inputR.Invoke(ctx, "")
			}

			receivedData, ok := in[receiver.ReceivedDataKey]
			if !ok {
				return inputR.Invoke(ctx, "")
			}

			return inputR.Invoke(ctx, receivedData.(string))
		}
		i = postDecorate(i, s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeInputReceiver)))}, nil
	case entity.NodeTypeOutputEmitter:
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

		lambda, err := compose.AnyLambda(i, nil, nil, t, compose.WithLambdaCallbackEnable(e.IsCallbacksEnabled()), compose.WithLambdaType(string(entity.NodeTypeOutputEmitter)))
		if err != nil {
			return nil, err
		}

		return &Node{Lambda: lambda}, nil
	case entity.NodeTypeEntry:
		i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
			return in, nil
		}
		i = postDecorate(i, s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeEntry)))}, nil
	case entity.NodeTypeExit:
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

		lambda, err := compose.AnyLambda(i, nil, nil, t, compose.WithLambdaCallbackEnable(true), compose.WithLambdaType(string(entity.NodeTypeExit)))
		if err != nil {
			return nil, err
		}

		return &Node{Lambda: lambda}, nil
	case entity.NodeTypeDatabaseCustomSQL:
		conf, err := s.ToDatabaseCustomSQLConfig()
		if err != nil {
			return nil, err
		}

		sqlER, err := database.NewCustomSQL(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(sqlER.Execute, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeDatabaseCustomSQL)))}, nil
	case entity.NodeTypeDatabaseQuery:
		conf, err := s.ToDatabaseQueryConfig()
		if err != nil {
			return nil, err
		}

		query, err := database.NewQuery(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, out)
				}
			}()
			conditionGroup, err := database.ConvertClauseGroupToConditionGroup(ctx, conf.ClauseGroup, in)
			if err != nil {
				return nil, err
			}
			callbackInput, err := s.ToDatabaseQueryCallbackInput(conf, conditionGroup)
			if err != nil {
				return nil, err
			}
			ctx = callbacks.OnStart(ctx, callbackInput)

			return query.Query(ctx, conditionGroup)
		}
		i = preDecorate(i, s.inputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaCallbackEnable(true), compose.WithLambdaType(string(entity.NodeTypeDatabaseQuery)))}, nil
	case entity.NodeTypeDatabaseInsert:

		conf, err := s.ToDatabaseInsertConfig()
		if err != nil {
			return nil, err
		}

		insert, err := database.NewInsert(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, out)
				}
			}()
			callbackInput, err := s.ToDatabaseInsertCallbackInput(conf.DatabaseInfoID, in)
			if err != nil {
				return nil, err
			}
			ctx = callbacks.OnStart(ctx, callbackInput)

			return insert.Insert(ctx, in)
		}

		i = preDecorate(i, s.inputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaCallbackEnable(true), compose.WithLambdaType(string(entity.NodeTypeDatabaseInsert)))}, nil
	case entity.NodeTypeDatabaseUpdate:

		conf, err := s.ToDatabaseUpdateConfig()
		if err != nil {
			return nil, err
		}
		update, err := database.NewUpdate(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, out)
				}
			}()
			inventory, err := database.ConvertClauseGroupToUpdateInventory(ctx, conf.ClauseGroup, in)
			if err != nil {
				return nil, err
			}
			callbackInput, err := s.ToDatabaseUpdateCallbackInput(conf.DatabaseInfoID, inventory)
			if err != nil {
				return nil, err
			}
			ctx = callbacks.OnStart(ctx, callbackInput)

			return update.Update(ctx, inventory)
		}

		i = preDecorate(i, s.inputValueFiller())

		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaCallbackEnable(true), compose.WithLambdaType(string(entity.NodeTypeDatabaseUpdate)))}, nil
	case entity.NodeTypeDatabaseDelete:
		conf, err := s.ToDatabaseDeleteConfig()
		if err != nil {
			return nil, err
		}
		del, err := database.NewDelete(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, out)
				}
			}()
			conditionGroup, err := database.ConvertClauseGroupToConditionGroup(ctx, conf.ClauseGroup, in)
			if err != nil {
				return nil, err
			}
			callbackInput, err := s.ToDatabaseDeleteCallbackInput(conf.DatabaseInfoID, conditionGroup)
			if err != nil {
				return nil, err
			}
			ctx = callbacks.OnStart(ctx, callbackInput)

			return del.Delete(ctx, conditionGroup)
		}

		i = preDecorate(i, s.inputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaCallbackEnable(true), compose.WithLambdaType(string(entity.NodeTypeDatabaseDelete)))}, nil
	case entity.NodeTypeKnowledgeIndexer:
		conf, err := s.ToKnowledgeIndexerConfig()
		if err != nil {
			return nil, err
		}
		w, err := knowledge.NewKnowledgeIndexer(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(w.Store, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeKnowledgeIndexer)))}, nil
	case entity.NodeTypeKnowledgeRetriever:
		conf, err := s.ToKnowledgeRetrieveConfig()
		if err != nil {
			return nil, err
		}
		r, err := knowledge.NewKnowledgeRetrieve(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.Retrieve, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeKnowledgeRetriever)))}, nil
	case entity.NodeTypeCodeRunner:
		conf, err := s.ToCodeRunnerConfig()
		if err != nil {
			return nil, err
		}
		r, err := code.NewCodeRunner(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.RunCode, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeCodeRunner)))}, nil
	case entity.NodeTypePlugin:
		conf, err := s.ToPluginConfig()
		if err != nil {
			return nil, err
		}
		r, err := plugin.NewPlugin(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.Invoke, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypePlugin)))}, nil
	case entity.NodeTypeCreateConversation:
		conf, err := s.ToCreateConversationConfig()
		if err != nil {
			return nil, err
		}
		r, err := conversation.NewCreateConversation(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.Create, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeCreateConversation)))}, nil
	case entity.NodeTypeMessageList:
		conf, err := s.ToMessageListConfig()
		if err != nil {
			return nil, err
		}
		r, err := conversation.NewMessageList(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.List, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeMessageList)))}, nil
	case entity.NodeTypeClearMessage:
		conf, err := s.ToClearMessageConfig()
		if err != nil {
			return nil, err
		}
		r, err := conversation.NewClearMessage(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := postDecorate(preDecorate(r.Clear, s.inputValueFiller()), s.outputValueFiller())
		return &Node{Lambda: compose.InvokableLambda(i, compose.WithLambdaType(string(entity.NodeTypeClearMessage)))}, nil
	case entity.NodeTypeIntentDetector:
		conf, err := s.ToIntentDetectorConfig(ctx)
		if err != nil {
			return nil, err
		}
		r, err := intentdetector.NewIntentDetector(ctx, conf)
		if err != nil {
			return nil, err
		}

		i := func(ctx context.Context, in map[string]any) (out map[string]any, err error) {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, out)
				}
			}()

			ctx = callbacks.OnStart(ctx, in)

			return r.Invoke(ctx, in)
		}

		i = postDecorate(preDecorate(i, s.inputValueFiller()), s.outputValueFiller())

		return &Node{Lambda: compose.InvokableLambda(i,
			compose.WithLambdaCallbackEnable(true),
			compose.WithLambdaType(string(entity.NodeTypeIntentDetector)))}, nil
	case entity.NodeTypeSubWorkflow:
		conf, err := s.ToSubWorkflowConfig(ctx)
		if err != nil {
			return nil, err
		}
		r, err := subworkflow.NewSubWorkflow(ctx, conf)
		if err != nil {
			return nil, err
		}
		i := func(ctx context.Context, in map[string]any, opts ...compose.Option) (out map[string]any, err error) {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, out)
				}
			}()

			ctx = callbacks.OnStart(ctx, in)

			return postDecorateWO(preDecorateWO(r.Invoke, s.inputValueFiller()), s.outputValueFiller())(ctx, in, opts...)
		}

		s := func(ctx context.Context, in map[string]any, opts ...compose.Option) (out *schema.StreamReader[map[string]any], err error) {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, out)
				}
			}()

			ctx = callbacks.OnStart(ctx, in)

			in, err = s.inputValueFiller()(ctx, in)
			if err != nil {
				return nil, err
			}
			return r.Stream(ctx, in, opts...)
		}

		l, err := compose.AnyLambda(i, s, nil, nil, compose.WithLambdaType(string(entity.NodeTypeSubWorkflow)), compose.WithLambdaCallbackEnable(true))
		if err != nil {
			return nil, err
		}
		return &Node{Lambda: l}, nil
	default:
		panic("not implemented")
	}
}
