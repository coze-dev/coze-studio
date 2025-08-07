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
	"strconv"
	"strings"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	workflow2 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/variable"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/exit"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/qa"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/receiver"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type State struct {
	Answers              map[vo.NodeKey][]string                   `json:"answers,omitempty"`
	Questions            map[vo.NodeKey][]*qa.Question             `json:"questions,omitempty"`
	Inputs               map[vo.NodeKey]map[string]any             `json:"inputs,omitempty"`
	NodeExeContexts      map[vo.NodeKey]*execute.Context           `json:"-"`
	WorkflowExeContext   *execute.Context                          `json:"-"`
	InterruptEvents      map[vo.NodeKey]*entity.InterruptEvent     `json:"interrupt_events,omitempty"`
	NestedWorkflowStates map[vo.NodeKey]*nodes.NestedWorkflowState `json:"nested_workflow_states,omitempty"`

	ExecutedNodes map[vo.NodeKey]bool                           `json:"executed_nodes,omitempty"`
	SourceInfos   map[vo.NodeKey]map[string]*schema2.SourceInfo `json:"source_infos,omitempty"`
	GroupChoices  map[vo.NodeKey]map[string]int                 `json:"group_choices,omitempty"`

	ToolInterruptEvents map[vo.NodeKey]map[string] /*ToolCallID*/ *entity.ToolInterruptEvent `json:"tool_interrupt_events,omitempty"`
	LLMToResumeData     map[vo.NodeKey]string                                                `json:"llm_to_resume_data,omitempty"`
}

func init() {
	_ = compose.RegisterSerializableType[*State]("schema_state")
	_ = compose.RegisterSerializableType[[]*qa.Question]("qa_question_list")
	_ = compose.RegisterSerializableType[qa.Question]("qa_question")
	_ = compose.RegisterSerializableType[vo.NodeKey]("node_key")
	_ = compose.RegisterSerializableType[*execute.Context]("exe_context")
	_ = compose.RegisterSerializableType[execute.RootCtx]("root_ctx")
	_ = compose.RegisterSerializableType[*execute.SubWorkflowCtx]("sub_workflow_ctx")
	_ = compose.RegisterSerializableType[*execute.NodeCtx]("node_ctx")
	_ = compose.RegisterSerializableType[*execute.BatchInfo]("batch_info")
	_ = compose.RegisterSerializableType[*execute.TokenCollector]("token_collector")
	_ = compose.RegisterSerializableType[entity.NodeType]("node_type")
	_ = compose.RegisterSerializableType[*entity.InterruptEvent]("interrupt_event")
	_ = compose.RegisterSerializableType[workflow2.EventType]("workflow_event_type")
	_ = compose.RegisterSerializableType[*model.TokenUsage]("model_token_usage")
	_ = compose.RegisterSerializableType[*nodes.NestedWorkflowState]("composite_state")
	_ = compose.RegisterSerializableType[*compose.InterruptInfo]("interrupt_info")
	_ = compose.RegisterSerializableType[*schema2.SourceInfo]("source_info")
	_ = compose.RegisterSerializableType[schema2.FieldStreamType]("field_stream_type")
	_ = compose.RegisterSerializableType[compose.FieldPath]("field_path")
	_ = compose.RegisterSerializableType[*entity.WorkflowBasic]("workflow_basic")
	_ = compose.RegisterSerializableType[vo.TerminatePlan]("terminate_plan")
	_ = compose.RegisterSerializableType[*entity.ToolInterruptEvent]("tool_interrupt_event")
	_ = compose.RegisterSerializableType[vo.ExecuteConfig]("execute_config")
	_ = compose.RegisterSerializableType[vo.ExecuteMode]("execute_mode")
	_ = compose.RegisterSerializableType[vo.TaskType]("task_type")
	_ = compose.RegisterSerializableType[vo.SyncPattern]("sync_pattern")
	_ = compose.RegisterSerializableType[vo.Locator]("wf_locator")
	_ = compose.RegisterSerializableType[vo.BizType]("biz_type")
	_ = compose.RegisterSerializableType[*execute.AppVariables]("app_variables")
}

func (s *State) AddQuestion(nodeKey vo.NodeKey, question *qa.Question) {
	s.Questions[nodeKey] = append(s.Questions[nodeKey], question)
}

func (s *State) AddAnswer(nodeKey vo.NodeKey, answer string) {
	s.Answers[nodeKey] = append(s.Answers[nodeKey], answer)
}

func (s *State) GetQuestionsAndAnswers(nodeKey vo.NodeKey) ([]*qa.Question, []string) {
	return s.Questions[nodeKey], s.Answers[nodeKey]
}

func (s *State) GetNodeCtx(key vo.NodeKey) (*execute.Context, bool, error) {
	c, ok := s.NodeExeContexts[key]
	if ok {
		return c, true, nil
	}

	return nil, false, nil
}

func (s *State) SetNodeCtx(key vo.NodeKey, value *execute.Context) error {
	s.NodeExeContexts[key] = value
	return nil
}

func (s *State) GetWorkflowCtx() (*execute.Context, bool, error) {
	if s.WorkflowExeContext == nil {
		return nil, false, nil
	}

	return s.WorkflowExeContext, true, nil
}

func (s *State) SetWorkflowCtx(value *execute.Context) error {
	s.WorkflowExeContext = value
	return nil
}

func (s *State) GetInterruptEvent(nodeKey vo.NodeKey) (*entity.InterruptEvent, bool, error) {
	if v, ok := s.InterruptEvents[nodeKey]; ok {
		return v, true, nil
	}

	return nil, false, nil
}

func (s *State) SetInterruptEvent(nodeKey vo.NodeKey, value *entity.InterruptEvent) error {
	s.InterruptEvents[nodeKey] = value
	return nil
}

func (s *State) DeleteInterruptEvent(nodeKey vo.NodeKey) error {
	delete(s.InterruptEvents, nodeKey)
	return nil
}

func (s *State) GetNestedWorkflowState(key vo.NodeKey) (*nodes.NestedWorkflowState, bool, error) {
	if v, ok := s.NestedWorkflowStates[key]; ok {
		return v, true, nil
	}
	return nil, false, nil
}
func (s *State) SaveNestedWorkflowState(key vo.NodeKey, value *nodes.NestedWorkflowState) error {
	s.NestedWorkflowStates[key] = value
	return nil
}

func (s *State) SaveDynamicChoice(nodeKey vo.NodeKey, groupToChoice map[string]int) {
	s.GroupChoices[nodeKey] = groupToChoice
}

func (s *State) GetDynamicChoice(nodeKey vo.NodeKey) map[string]int {
	return s.GroupChoices[nodeKey]
}

func (s *State) GetDynamicStreamType(nodeKey vo.NodeKey, group string) (schema2.FieldStreamType, error) {
	choices, ok := s.GroupChoices[nodeKey]
	if !ok {
		return schema2.FieldMaybeStream, fmt.Errorf("choice not found for node %s", nodeKey)
	}

	choice, ok := choices[group]
	if !ok {
		return schema2.FieldMaybeStream, fmt.Errorf("choice not found for node %s and group %s", nodeKey, group)
	}

	if choice == -1 { // this group picks none of the elements
		return schema2.FieldNotStream, nil
	}

	sInfos, ok := s.SourceInfos[nodeKey]
	if !ok {
		return schema2.FieldMaybeStream, fmt.Errorf("source infos not found for node %s", nodeKey)
	}

	groupInfo, ok := sInfos[group]
	if !ok {
		return schema2.FieldMaybeStream, fmt.Errorf("source infos not found for node %s and group %s", nodeKey, group)
	}

	if groupInfo.SubSources == nil {
		return schema2.FieldNotStream, fmt.Errorf("dynamic group %s of node %s does not contain any sub sources", group, nodeKey)
	}

	subInfo, ok := groupInfo.SubSources[strconv.Itoa(choice)]
	if !ok {
		return schema2.FieldNotStream, fmt.Errorf("dynamic group %s of node %s does not contain sub source for choice %d", group, nodeKey, choice)
	}

	if subInfo.FieldType != schema2.FieldMaybeStream {
		return subInfo.FieldType, nil
	}

	if len(subInfo.FromNodeKey) == 0 {
		panic("subInfo is maybe stream, but from node key is empty")
	}

	if len(subInfo.FromPath) > 1 || len(subInfo.FromPath) == 0 {
		panic("subInfo is maybe stream, but from path is more than 1 segments or is empty")
	}

	return s.GetDynamicStreamType(subInfo.FromNodeKey, subInfo.FromPath[0])
}

func (s *State) GetAllDynamicStreamTypes(nodeKey vo.NodeKey) (map[string]schema2.FieldStreamType, error) {
	result := make(map[string]schema2.FieldStreamType)
	choices, ok := s.GroupChoices[nodeKey]
	if !ok {
		return result, nil
	}

	for group := range choices {
		t, err := s.GetDynamicStreamType(nodeKey, group)
		if err != nil {
			return nil, err
		}
		result[group] = t
	}

	return result, nil
}

func (s *State) SetToolInterruptEvent(llmNodeKey vo.NodeKey, toolCallID string, ie *entity.ToolInterruptEvent) error {
	if _, ok := s.ToolInterruptEvents[llmNodeKey]; !ok {
		s.ToolInterruptEvents[llmNodeKey] = make(map[string]*entity.ToolInterruptEvent)
	}
	s.ToolInterruptEvents[llmNodeKey][toolCallID] = ie
	return nil
}

func (s *State) GetToolInterruptEvents(llmNodeKey vo.NodeKey) (map[string]*entity.ToolInterruptEvent, error) {
	return s.ToolInterruptEvents[llmNodeKey], nil
}

func (s *State) ResumeToolInterruptEvent(llmNodeKey vo.NodeKey, toolCallID string) (string, error) {
	resumeData, ok := s.LLMToResumeData[llmNodeKey]
	if !ok {
		return "", fmt.Errorf("resume data not found for llm node %s", llmNodeKey)
	}
	delete(s.ToolInterruptEvents[llmNodeKey], toolCallID)
	delete(s.LLMToResumeData, llmNodeKey)
	return resumeData, nil
}

func (s *State) NodeExecuted(key vo.NodeKey) bool {
	if key == compose.START {
		return true
	}
	_, ok := s.ExecutedNodes[key]
	return ok
}

func GenState() compose.GenLocalState[*State] {
	return func(ctx context.Context) (state *State) {
		return &State{
			Answers:              make(map[vo.NodeKey][]string),
			Questions:            make(map[vo.NodeKey][]*qa.Question),
			Inputs:               make(map[vo.NodeKey]map[string]any),
			NodeExeContexts:      make(map[vo.NodeKey]*execute.Context),
			InterruptEvents:      make(map[vo.NodeKey]*entity.InterruptEvent),
			NestedWorkflowStates: make(map[vo.NodeKey]*nodes.NestedWorkflowState),
			ExecutedNodes:        make(map[vo.NodeKey]bool),
			SourceInfos:          make(map[vo.NodeKey]map[string]*schema2.SourceInfo),
			GroupChoices:         make(map[vo.NodeKey]map[string]int),
			ToolInterruptEvents:  make(map[vo.NodeKey]map[string]*entity.ToolInterruptEvent),
			LLMToResumeData:      make(map[vo.NodeKey]string),
		}
	}
}

func statePreHandler(s *schema2.NodeSchema, stream bool) compose.GraphAddNodeOpt {
	var (
		handlers       []compose.StatePreHandler[map[string]any, *State]
		streamHandlers []compose.StreamStatePreHandler[map[string]any, *State]
	)

	if s.Type == entity.NodeTypeQuestionAnswer {
		handlers = append(handlers, func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			// even on first execution before any interruption, the input could be empty
			// so we need to check if we have stored any questions in state, to decide whether this is the first execution
			isFirst := false
			if _, ok := state.Questions[s.Key]; !ok {
				isFirst = true
			}

			if isFirst {
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
	} else if s.Type == entity.NodeTypeInputReceiver {
		// InputReceiver node's only input is set by StateModifier when resuming
		handlers = append(handlers, func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			if userInput, ok := state.Inputs[s.Key]; ok && len(userInput) > 0 {
				return userInput, nil
			}
			return in, nil
		})
	} else if entity.NodeMetaByNodeType(s.Type).IsComposite {
		handlers = append(handlers, func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			if _, ok := state.Inputs[s.Key]; !ok { // first execution, store input for potential resume later
				state.Inputs[s.Key] = in
				return in, nil
			}
			out := make(map[string]any)
			for k, v := range state.Inputs[s.Key] {
				out[k] = v
			}
			return out, nil
		})
	}

	if len(handlers) > 0 || !stream {
		handlerForVars := statePreHandlerForVars(s)
		if handlerForVars != nil {
			handlers = append(handlers, handlerForVars)
		}
		stateHandler := func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			var err error
			for _, h := range handlers {
				in, err = h(ctx, in, state)
				if err != nil {
					return nil, err
				}
			}

			return in, nil
		}
		return compose.WithStatePreHandler(stateHandler)
	}

	if s.Type == entity.NodeTypeVariableAggregator {
		streamHandlers = append(streamHandlers, func(ctx context.Context, in *schema.StreamReader[map[string]any], state *State) (*schema.StreamReader[map[string]any], error) {
			state.SourceInfos[s.Key] = s.FullSources
			return in, nil
		})
	}

	handlerForVars := streamStatePreHandlerForVars(s)
	if handlerForVars != nil {
		streamHandlers = append(streamHandlers, handlerForVars)
	}

	/*handlerForStreamSource := s.streamStatePreHandlerForStreamSources()
	if handlerForStreamSource != nil {
		streamHandlers = append(streamHandlers, handlerForStreamSource)
	}*/

	if len(streamHandlers) > 0 {
		streamHandler := func(ctx context.Context, in *schema.StreamReader[map[string]any], state *State) (*schema.StreamReader[map[string]any], error) {
			var err error
			for _, h := range streamHandlers {
				in, err = h(ctx, in, state)
				if err != nil {
					return nil, err
				}
			}
			return in, nil
		}
		return compose.WithStreamStatePreHandler(streamHandler)
	}

	return nil
}

func statePreHandlerForVars(s *schema2.NodeSchema) compose.StatePreHandler[map[string]any, *State] {
	// checkout the node's inputs, if it has any variable, use the state's variableHandler to get the variables and set them to the input
	var vars []*vo.FieldInfo
	for _, input := range s.InputSources {
		if input.Source.Ref != nil && input.Source.Ref.VariableType != nil {
			vars = append(vars, input)
		}
	}

	if len(vars) == 0 {
		return nil
	}

	varStoreHandler := variable.GetVariableHandler()
	intermediateVarStore := &nodes.ParentIntermediateStore{}

	return func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
		opts := make([]variable.OptionFn, 0, 1)
		var exeCtx *execute.Context
		if exeCtx = execute.GetExeCtx(ctx); exeCtx != nil {
			exeCfg := execute.GetExeCtx(ctx).RootCtx.ExeCfg
			opts = append(opts, variable.WithStoreInfo(variable.StoreInfo{
				AgentID:      exeCfg.AgentID,
				AppID:        exeCfg.AppID,
				ConnectorID:  exeCfg.ConnectorID,
				ConnectorUID: exeCfg.ConnectorUID,
			}))
		}
		out := make(map[string]any)
		for k, v := range in {
			out[k] = v
		}
		for _, input := range vars {
			if input == nil {
				continue
			}
			var v any
			var err error
			switch *input.Source.Ref.VariableType {
			case vo.ParentIntermediate:
				v, err = intermediateVarStore.Get(ctx, input.Source.Ref.FromPath, opts...)
			case vo.GlobalSystem, vo.GlobalUser:
				v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
			case vo.GlobalAPP:
				var ok bool
				path := strings.Join(input.Source.Ref.FromPath, ".")
				if exeCtx == nil || exeCtx.AppVarStore == nil {
					v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
					if err != nil {
						return nil, err
					}
				} else {
					if v, ok = exeCtx.AppVarStore.Get(path); !ok {
						v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
						if err != nil {
							return nil, err
						}

						exeCtx.AppVarStore.Set(path, v)
					}
				}
			default:
				return nil, fmt.Errorf("invalid variable type: %v", *input.Source.Ref.VariableType)
			}
			if err != nil {
				return nil, err
			}

			nodes.SetMapValue(out, input.Path, v)
		}

		return out, nil
	}
}

func streamStatePreHandlerForVars(s *schema2.NodeSchema) compose.StreamStatePreHandler[map[string]any, *State] {
	// checkout the node's inputs, if it has any variables, get the variables and merge them with the input
	var vars []*vo.FieldInfo
	for _, input := range s.InputSources {
		if input.Source.Ref != nil && input.Source.Ref.VariableType != nil {
			vars = append(vars, input)
		}
	}

	if len(vars) == 0 {
		return nil
	}

	varStoreHandler := variable.GetVariableHandler()
	intermediateVarStore := &nodes.ParentIntermediateStore{}

	return func(ctx context.Context, in *schema.StreamReader[map[string]any], state *State) (*schema.StreamReader[map[string]any], error) {
		var (
			variables = make(map[string]any)
			opts      = make([]variable.OptionFn, 0, 1)
			exeCtx    *execute.Context
		)

		if exeCtx = execute.GetExeCtx(ctx); exeCtx != nil {
			exeCfg := exeCtx.RootCtx.ExeCfg
			opts = append(opts, variable.WithStoreInfo(variable.StoreInfo{
				AgentID:      exeCfg.AgentID,
				AppID:        exeCfg.AppID,
				ConnectorID:  exeCfg.ConnectorID,
				ConnectorUID: exeCfg.ConnectorUID,
			}))
		}

		for _, input := range vars {
			if input == nil {
				continue
			}
			var v any
			var err error
			switch *input.Source.Ref.VariableType {
			case vo.ParentIntermediate:
				v, err = intermediateVarStore.Get(ctx, input.Source.Ref.FromPath, opts...)
			case vo.GlobalSystem, vo.GlobalUser:
				v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
			case vo.GlobalAPP:
				var ok bool
				path := strings.Join(input.Source.Ref.FromPath, ".")
				if exeCtx == nil || exeCtx.AppVarStore == nil {
					v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
					if err != nil {
						return nil, err
					}
				} else {
					if v, ok = exeCtx.AppVarStore.Get(path); !ok {
						v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
						if err != nil {
							return nil, err
						}

						exeCtx.AppVarStore.Set(path, v)
					}
				}
			default:
				return nil, fmt.Errorf("invalid variable type: %v", *input.Source.Ref.VariableType)
			}
			if err != nil {
				return nil, err
			}
			nodes.SetMapValue(variables, input.Path, v)
		}

		variablesStream := schema.StreamReaderFromArray([]map[string]any{variables})

		return schema.MergeStreamReaders([]*schema.StreamReader[map[string]any]{in, variablesStream}), nil
	}
}

func streamStatePreHandlerForStreamSources(s *schema2.NodeSchema) compose.StreamStatePreHandler[map[string]any, *State] {
	// if it does not have source info, do not add this pre handler
	if s.Configs == nil {
		return nil
	}

	switch s.Type {
	case entity.NodeTypeVariableAggregator, entity.NodeTypeOutputEmitter:
		return nil
	case entity.NodeTypeExit:
		terminatePlan := s.Configs.(*exit.Config).TerminatePlan
		if terminatePlan != vo.ReturnVariables {
			return nil
		}
	default:
		// all other node can only accept non-stream inputs, relying on Eino's automatically stream concatenation.
	}

	sourceInfo := s.FullSources
	if len(sourceInfo) == 0 {
		return nil
	}
	// check the node's input sources, if it does not have any streaming sources, no need to add pre handler
	// if one input is a stream, then in the pre handler, will trim the KeyIsFinished suffix.
	// if one input may be a stream, then in the pre handler, will resolve it first, then handle it.
	type resolvedStreamSource struct {
		intermediate     bool
		mustBeStream     bool
		subStreamSources map[string]resolvedStreamSource
	}

	var (
		anyStream bool
		checker   func(source *schema2.SourceInfo) bool
	)
	checker = func(source *schema2.SourceInfo) bool {
		if source.FieldType != schema2.FieldNotStream {
			return true
		}
		for _, subSource := range source.SubSources {
			if subAnyStream := checker(subSource); subAnyStream {
				return true
			}
		}

		return false
	}
	for _, source := range sourceInfo {
		if hasStream := checker(source); hasStream {
			anyStream = true
			break
		}
	}

	if !anyStream {
		return nil
	}

	return func(ctx context.Context, in *schema.StreamReader[map[string]any], state *State) (*schema.StreamReader[map[string]any], error) {
		resolved := map[string]resolvedStreamSource{}

		var resolver func(source schema2.SourceInfo) (result *resolvedStreamSource, err error)
		resolver = func(source schema2.SourceInfo) (result *resolvedStreamSource, err error) {
			if source.IsIntermediate {
				result = &resolvedStreamSource{
					intermediate:     true,
					subStreamSources: map[string]resolvedStreamSource{},
				}
				for key, subSource := range source.SubSources {
					subResult, subE := resolver(*subSource)
					if subE != nil {
						return nil, subE
					}
					if subResult != nil {
						result.subStreamSources[key] = *subResult
					}
				}

				return result, nil
			}

			streamType := source.FieldType
			if streamType == schema2.FieldMaybeStream {
				streamType, err = state.GetDynamicStreamType(source.FromNodeKey, source.FromPath[0])
				if err != nil {
					return nil, err
				}
			}

			if streamType == schema2.FieldNotStream {
				return nil, nil
			}

			result = &resolvedStreamSource{
				mustBeStream: true,
			}
			return result, nil
		}

		for key, source := range sourceInfo {
			result, err := resolver(*source)
			if err != nil {
				return nil, err
			}
			if result != nil {
				resolved[key] = *result
			}
		}

		var converter func(v any, resolvedSource resolvedStreamSource) any
		converter = func(v any, resolvedSource resolvedStreamSource) any {
			if resolvedSource.intermediate {
				vMap, ok := v.(map[string]any)
				if !ok {
					panic("intermediate value is not map[string]any")
				}
				outMap := make(map[string]any, len(vMap))
				for k := range vMap {
					subResolvedSource, ok := resolvedSource.subStreamSources[k]
					if !ok { // not a stream field
						outMap[k] = vMap[k]
						continue
					}

					subV := converter(vMap[k], subResolvedSource)
					outMap[k] = subV
				}

				return outMap
			}

			vStr, ok := v.(string)
			if !ok {
				panic("stream field is not string")
			}

			return strings.TrimSuffix(vStr, nodes.KeyIsFinished)
		}

		streamConverter := func(inChunk map[string]any) (outChunk map[string]any, chunkErr error) {
			outChunk = make(map[string]any, len(inChunk))
			for k, v := range inChunk {
				if resolvedSource, ok := resolved[k]; !ok {
					outChunk[k] = v // not a stream field
				} else {
					vOut := converter(v, resolvedSource)
					outChunk[k] = vOut
				}
			}

			return outChunk, nil
		}

		return schema.StreamReaderWithConvert(in, streamConverter), nil
	}
}

func statePostHandler(s *schema2.NodeSchema, stream bool) compose.GraphAddNodeOpt {
	var (
		handlers       []compose.StatePostHandler[map[string]any, *State]
		streamHandlers []compose.StreamStatePostHandler[map[string]any, *State]
	)

	if stream {
		streamHandlers = append(streamHandlers, func(ctx context.Context, out *schema.StreamReader[map[string]any], state *State) (*schema.StreamReader[map[string]any], error) {
			state.ExecutedNodes[s.Key] = true
			return out, nil
		})

		forVars := streamStatePostHandlerForVars(s)
		if forVars != nil {
			streamHandlers = append(streamHandlers, forVars)
		}

		streamHandler := func(ctx context.Context, in *schema.StreamReader[map[string]any], state *State) (*schema.StreamReader[map[string]any], error) {
			var err error
			for _, h := range streamHandlers {
				in, err = h(ctx, in, state)
				if err != nil {
					return nil, err
				}
			}
			return in, nil
		}
		return compose.WithStreamStatePostHandler(streamHandler)
	}

	handlers = append(handlers, func(ctx context.Context, out map[string]any, state *State) (map[string]any, error) {
		state.ExecutedNodes[s.Key] = true
		return out, nil
	})

	forVars := statePostHandlerForVars(s)
	if forVars != nil {
		handlers = append(handlers, forVars)
	}

	handler := func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
		var err error
		for _, h := range handlers {
			in, err = h(ctx, in, state)
			if err != nil {
				return nil, err
			}
		}

		return in, nil
	}

	return compose.WithStatePostHandler(handler)
}

func statePostHandlerForVars(s *schema2.NodeSchema) compose.StatePostHandler[map[string]any, *State] {
	// checkout the node's output sources, if it has any variable,
	// use the state's variableHandler to get the variables and set them to the output
	var vars []*vo.FieldInfo
	for _, output := range s.OutputSources {
		if output.Source.Ref != nil && output.Source.Ref.VariableType != nil {
			// intermediate vars are handled within nodes themselves
			if *output.Source.Ref.VariableType == vo.ParentIntermediate {
				continue
			}
			vars = append(vars, output)
		}
	}

	if len(vars) == 0 {
		return nil
	}

	varStoreHandler := variable.GetVariableHandler()

	return func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
		opts := make([]variable.OptionFn, 0, 1)

		var exeCtx *execute.Context
		if exeCtx = execute.GetExeCtx(ctx); exeCtx != nil {
			exeCfg := execute.GetExeCtx(ctx).RootCtx.ExeCfg
			opts = append(opts, variable.WithStoreInfo(variable.StoreInfo{
				AgentID:      exeCfg.AgentID,
				AppID:        exeCfg.AppID,
				ConnectorID:  exeCfg.ConnectorID,
				ConnectorUID: exeCfg.ConnectorUID,
			}))
		}
		out := make(map[string]any)
		for k, v := range in {
			out[k] = v
		}
		for _, input := range vars {
			if input == nil {
				continue
			}
			var v any
			var err error
			switch *input.Source.Ref.VariableType {
			case vo.GlobalSystem, vo.GlobalUser:
				v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
			case vo.GlobalAPP:
				var ok bool
				path := strings.Join(input.Source.Ref.FromPath, ".")
				if exeCtx == nil || exeCtx.AppVarStore == nil {
					v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
					if err != nil {
						return nil, err
					}
				} else {
					if v, ok = exeCtx.AppVarStore.Get(path); !ok {
						v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
						if err != nil {
							return nil, err
						}

						exeCtx.AppVarStore.Set(path, v)
					}
				}
			default:
				return nil, fmt.Errorf("invalid variable type: %v", *input.Source.Ref.VariableType)
			}
			if err != nil {
				return nil, err
			}

			nodes.SetMapValue(out, input.Path, v)
		}

		return out, nil
	}
}

func streamStatePostHandlerForVars(s *schema2.NodeSchema) compose.StreamStatePostHandler[map[string]any, *State] {
	// checkout the node's output sources, if it has any variables, get the variables and merge them with the output
	var vars []*vo.FieldInfo
	for _, output := range s.OutputSources {
		if output.Source.Ref != nil && output.Source.Ref.VariableType != nil {
			// intermediate vars are handled within nodes themselves
			if *output.Source.Ref.VariableType == vo.ParentIntermediate {
				continue
			}
			vars = append(vars, output)
		}
	}

	if len(vars) == 0 {
		return nil
	}

	varStoreHandler := variable.GetVariableHandler()
	return func(ctx context.Context, in *schema.StreamReader[map[string]any], state *State) (*schema.StreamReader[map[string]any], error) {
		var (
			variables = make(map[string]any)
			opts      = make([]variable.OptionFn, 0, 1)
			exeCtx    *execute.Context
		)

		if exeCtx = execute.GetExeCtx(ctx); exeCtx != nil {
			exeCfg := execute.GetExeCtx(ctx).RootCtx.ExeCfg
			opts = append(opts, variable.WithStoreInfo(variable.StoreInfo{
				AgentID:      exeCfg.AgentID,
				AppID:        exeCfg.AppID,
				ConnectorID:  exeCfg.ConnectorID,
				ConnectorUID: exeCfg.ConnectorUID,
			}))
		}

		for _, input := range vars {
			if input == nil {
				continue
			}
			var v any
			var err error
			switch *input.Source.Ref.VariableType {
			case vo.GlobalSystem, vo.GlobalUser:
				v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
			case vo.GlobalAPP:
				var ok bool
				path := strings.Join(input.Source.Ref.FromPath, ".")
				if exeCtx == nil || exeCtx.AppVarStore == nil {
					v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
					if err != nil {
						return nil, err
					}
				} else {
					if v, ok = exeCtx.AppVarStore.Get(path); !ok {
						v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath, opts...)
						if err != nil {
							return nil, err
						}

						exeCtx.AppVarStore.Set(path, v)
					}
				}
			default:
				return nil, fmt.Errorf("invalid variable type: %v", *input.Source.Ref.VariableType)
			}
			if err != nil {
				return nil, err
			}
			nodes.SetMapValue(variables, input.Path, v)
		}

		variablesStream := schema.StreamReaderFromArray([]map[string]any{variables})

		return schema.MergeStreamReaders([]*schema.StreamReader[map[string]any]{in, variablesStream}), nil
	}
}

func GenStateModifierByEventType(e entity.InterruptEventType,
	nodeKey vo.NodeKey,
	resumeData string,
	exeCfg vo.ExecuteConfig) (stateModifier compose.StateModifier) {
	// TODO: can we unify them all to a map[NodeKey]resumeData?
	switch e {
	case entity.InterruptEventInput:
		stateModifier = func(ctx context.Context, path compose.NodePath, state any) (err error) {
			if exeCfg.BizType == vo.BizTypeAgent {
				m := make(map[string]any)
				sList := strings.Split(resumeData, "\n")
				for _, s := range sList {
					firstColon := strings.Index(s, ":")
					k := s[:firstColon]
					v := s[firstColon+1:]
					m[k] = v
				}
				resumeData, err = sonic.MarshalString(m)
				if err != nil {
					return err
				}
			}

			input := map[string]any{
				receiver.ReceivedDataKey: resumeData,
			}
			state.(*State).Inputs[nodeKey] = input
			return nil
		}
	case entity.InterruptEventQuestion:
		stateModifier = func(ctx context.Context, path compose.NodePath, state any) error {
			state.(*State).AddAnswer(nodeKey, resumeData)
			return nil
		}
	case entity.InterruptEventLLM:
		stateModifier = func(ctx context.Context, path compose.NodePath, state any) error {
			state.(*State).LLMToResumeData[nodeKey] = resumeData
			return nil
		}
	default:
		panic(fmt.Sprintf("unimplemented interrupt event type: %v", e))
	}

	return stateModifier
}
