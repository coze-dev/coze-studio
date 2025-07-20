/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package compose

import (
	"context"
	"fmt"
	"runtime/debug"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/batch"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/code"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/database"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/emitter"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/entry"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/httprequester"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/intentdetector"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/json"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/llm"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/loop"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/plugin"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/qa"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/receiver"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/selector"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/subworkflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/textprocessor"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/variableaggregator"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/variableassigner"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/errno"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
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

	ExceptionConfigs *ExceptionConfig `json:"exception_configs,omitempty"` // generic configurations applicable to most nodes
	StreamConfigs    *StreamConfig    `json:"stream_configs,omitempty"`

	SubWorkflowBasic  *entity.WorkflowBasic `json:"sub_workflow_basic,omitempty"`
	SubWorkflowSchema *WorkflowSchema       `json:"sub_workflow_schema,omitempty"`

	Lambda *compose.Lambda // not serializable, used for internal test.
}

type ExceptionConfig struct {
	TimeoutMS   int64                `json:"timeout_ms,omitempty"`   // timeout in milliseconds, 0 means no timeout
	MaxRetry    int64                `json:"max_retry,omitempty"`    // max retry times, 0 means no retry
	ProcessType *vo.ErrorProcessType `json:"process_type,omitempty"` // error process type, 0 means throw error
	DataOnErr   string               `json:"data_on_err,omitempty"`  // data to return when error, effective when ProcessType==Default occurs
}

type StreamConfig struct {
	// whether this node has the ability to produce genuine streaming output.
	// not include nodes that only passes stream down as they receives them
	CanGeneratesStream bool `json:"can_generates_stream,omitempty"`
	// whether this node prioritize streaming input over none-streaming input.
	// not include nodes that can accept both and does not have preference.
	RequireStreamingInput bool `json:"can_process_stream,omitempty"`
}

type Node struct {
	Lambda *compose.Lambda
}

func (s *NodeSchema) New(ctx context.Context, inner compose.Runnable[map[string]any, map[string]any],
	sc *WorkflowSchema, deps *dependencyInfo) (_ *Node, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrCreateNodeFail, err, errorx.KV("node_name", s.Name), errorx.KV("cause", err.Error()))
		}
	}()

	if m := entity.NodeMetaByNodeType(s.Type); m != nil && m.InputSourceAware {
		if err = s.SetFullSources(sc.GetAllNodes(), deps); err != nil {
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

		return invokableStreamableNodeWO(s, l.Chat, l.ChatStream, withCallbackOutputConverter(l.ToCallbackOutput)), nil
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

		return invokableNode(s, hr.Invoke, withCallbackInputConverter(hr.ToCallbackInput), withCallbackOutputConverter(hr.ToCallbackOutput)), nil
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
		return invokableNode(s, inputR.Invoke, withCallbackOutputConverter(inputR.ToCallbackOutput)), nil
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
		conf, err := s.ToEntryConfig(ctx)
		if err != nil {
			return nil, err
		}
		e, err := entry.NewEntry(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, e.Invoke), nil
	case entity.NodeTypeExit:
		terminalPlan := mustGetKey[vo.TerminatePlan]("TerminalPlan", s.Configs)
		if terminalPlan == vo.ReturnVariables {
			i := func(ctx context.Context, in map[string]any) (map[string]any, error) {
				if in == nil {
					return map[string]any{}, nil
				}
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
	case entity.NodeTypeKnowledgeDeleter:
		conf, err := s.ToKnowledgeDeleterConfig()
		if err != nil {
			return nil, err
		}
		r, err := knowledge.NewKnowledgeDeleter(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, r.Delete), nil
	case entity.NodeTypeCodeRunner:
		conf, err := s.ToCodeRunnerConfig()
		if err != nil {
			return nil, err
		}
		r, err := code.NewCodeRunner(ctx, conf)
		if err != nil {
			return nil, err
		}
		initFn := func(ctx context.Context) (context.Context, error) {
			return ctxcache.Init(ctx), nil
		}
		return invokableNode(s, r.RunCode, withCallbackOutputConverter(r.ToCallbackOutput), withInit(initFn)), nil
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
	case entity.NodeTypeJsonSerialization:
		conf, err := s.ToJsonSerializationConfig()
		if err != nil {
			return nil, err
		}
		js, err := json.NewJsonSerializer(ctx, conf)
		if err != nil {
			return nil, err
		}
		return invokableNode(s, js.Invoke), nil
	case entity.NodeTypeJsonDeserialization:
		conf, err := s.ToJsonDeserializationConfig()
		if err != nil {
			return nil, err
		}
		jd, err := json.NewJsonDeserializer(ctx, conf)
		if err != nil {
			return nil, err
		}
		initFn := func(ctx context.Context) (context.Context, error) {
			return ctxcache.Init(ctx), nil
		}
		return invokableNode(s, jd.Invoke, withCallbackOutputConverter(jd.ToCallbackOutput), withInit(initFn)), nil
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
