package compose

import (
	"context"
	"fmt"
	"strconv"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	workflow2 "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/qa"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/receiver"
)

type State struct {
	Answers              map[vo.NodeKey][]string                   `json:"answers,omitempty"`
	Questions            map[vo.NodeKey][]*qa.Question             `json:"questions,omitempty"`
	Inputs               map[vo.NodeKey]map[string]any             `json:"inputs,omitempty"`
	NodeExeContexts      map[vo.NodeKey]*execute.Context           `json:"-"`
	WorkflowExeContext   *execute.Context                          `json:"-"`
	InterruptEvents      map[vo.NodeKey]*entity.InterruptEvent     `json:"interrupt_events,omitempty"`
	NestedWorkflowStates map[vo.NodeKey]*nodes.NestedWorkflowState `json:"nested_workflow_states,omitempty"`

	// TODO: also needs to record parent workflow's executed nodes if this workflow is inner workflow under composite nodes
	ExecutedNodes map[vo.NodeKey]bool                         `json:"executed_nodes,omitempty"`
	SourceInfos   map[vo.NodeKey]map[string]*nodes.SourceInfo `json:"source_infos,omitempty"`
	GroupChoices  map[vo.NodeKey]map[string]int               `json:"group_choices,omitempty"`
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
	_ = compose.RegisterSerializableType[*nodes.SourceInfo]("source_info")
	_ = compose.RegisterSerializableType[nodes.FieldStreamType]("field_stream_type")
	_ = compose.RegisterSerializableType[compose.FieldPath]("field_path")
}

func (s *State) AddQuestion(nodeKey vo.NodeKey, question *qa.Question) {
	s.Questions[nodeKey] = append(s.Questions[nodeKey], question)
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

func (s *State) GetDynamicStreamType(nodeKey vo.NodeKey, group string) (nodes.FieldStreamType, error) {
	choices, ok := s.GroupChoices[nodeKey]
	if !ok {
		return nodes.FieldMaybeStream, fmt.Errorf("choice not found for node %s", nodeKey)
	}

	choice, ok := choices[group]
	if !ok {
		return nodes.FieldMaybeStream, fmt.Errorf("choice not found for node %s and group %s", nodeKey, group)
	}

	if choice == -1 { // this group picks none of the elements
		return nodes.FieldNotStream, nil
	}

	sInfos, ok := s.SourceInfos[nodeKey]
	if !ok {
		return nodes.FieldMaybeStream, fmt.Errorf("source infos not found for node %s", nodeKey)
	}

	groupInfo, ok := sInfos[group]
	if !ok {
		return nodes.FieldMaybeStream, fmt.Errorf("source infos not found for node %s and group %s", nodeKey, group)
	}

	if groupInfo.SubSources == nil {
		return nodes.FieldNotStream, fmt.Errorf("dynamic group %s of node %s does not contain any sub sources", group, nodeKey)
	}

	subInfo, ok := groupInfo.SubSources[strconv.Itoa(choice)]
	if !ok {
		return nodes.FieldNotStream, fmt.Errorf("dynamic group %s of node %s does not contain sub source for choice %d", group, nodeKey, choice)
	}

	if subInfo.FieldIsStream != nodes.FieldMaybeStream {
		return subInfo.FieldIsStream, nil
	}

	if len(subInfo.FromNodeKey) == 0 {
		panic("subInfo is maybe stream, but from node key is empty")
	}

	if len(subInfo.FromPath) > 1 || len(subInfo.FromPath) == 0 {
		panic("subInfo is maybe stream, but from path is more than 1 segments or is empty")
	}

	return s.GetDynamicStreamType(subInfo.FromNodeKey, subInfo.FromPath[0])
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
			SourceInfos:          make(map[vo.NodeKey]map[string]*nodes.SourceInfo),
			GroupChoices:         make(map[vo.NodeKey]map[string]int),
		}
	}
}

func (s *NodeSchema) StatePreHandler() compose.GraphAddNodeOpt {
	var (
		handlers       []compose.StatePreHandler[map[string]any, *State]
		streamHandlers []compose.StreamStatePreHandler[map[string]any, *State]
	)

	if s.Type == entity.NodeTypeQuestionAnswer {
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
	} else if s.Type == entity.NodeTypeInputReceiver { // if state has this node's input, use it
		handlers = append(handlers, func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			if userInput, ok := state.Inputs[s.Key]; ok && len(userInput) > 0 {
				return userInput, nil
			}
			return in, nil
		})
	} else if s.Type == entity.NodeTypeBatch || s.Type == entity.NodeTypeLoop {
		handlers = append(handlers, func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			if len(in) > 0 {
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

	if len(handlers) > 0 {
		handlerForVars := s.statePreHandlerForVars()
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
			state.SourceInfos[s.Key] = mustGetKey[map[string]*nodes.SourceInfo]("FullSources", s.Configs)
			return in, nil
		})
	}

	handlerForVars := s.streamStatePreHandlerForVars()
	if handlerForVars != nil {
		streamHandlers = append(streamHandlers, handlerForVars)
	}
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

func (s *NodeSchema) statePreHandlerForVars() compose.StatePreHandler[map[string]any, *State] {
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
			if *input.Source.Ref.VariableType == variable.ParentIntermediate {
				v, err = intermediateVarStore.Get(ctx, input.Source.Ref.FromPath)
			} else {
				v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath)
			}
			if err != nil {
				return nil, err
			}

			nodes.SetMapValue(out, input.Path, v)
		}

		return out, nil
	}
}

func (s *NodeSchema) streamStatePreHandlerForVars() compose.StreamStatePreHandler[map[string]any, *State] {
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
		variables := make(map[string]any)

		for _, input := range vars {
			if input == nil {
				continue
			}
			var v any
			var err error
			if *input.Source.Ref.VariableType == variable.ParentIntermediate {
				v, err = intermediateVarStore.Get(ctx, input.Source.Ref.FromPath)
			} else {
				v, err = varStoreHandler.Get(ctx, *input.Source.Ref.VariableType, input.Source.Ref.FromPath)
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

func (s *NodeSchema) StatePostHandler() compose.GraphAddNodeOpt {
	if s.Type == entity.NodeTypeSelector {
		handler := func(ctx context.Context, out *schema.StreamReader[int], state *State) (*schema.StreamReader[int], error) {
			state.ExecutedNodes[s.Key] = true
			return out, nil
		}
		return compose.WithStreamStatePostHandler(handler)
	}

	handler := func(ctx context.Context, out *schema.StreamReader[map[string]any], state *State) (*schema.StreamReader[map[string]any], error) {
		state.ExecutedNodes[s.Key] = true
		return out, nil
	}
	return compose.WithStreamStatePostHandler(handler)
}

func GenStateModifierByEventType(e entity.InterruptEventType,
	nodeKey vo.NodeKey,
	resumeData string) (stateModifier compose.StateModifier) {
	switch e {
	case entity.InterruptEventInput:
		stateModifier = func(ctx context.Context, path compose.NodePath, state any) error {
			fmt.Println("state modifier for input node happens. Path: ", path)

			input := map[string]any{
				receiver.ReceivedDataKey: resumeData,
			}
			state.(*State).Inputs[nodeKey] = input
			return nil
		}
	case entity.InterruptEventQuestion:
		stateModifier = func(ctx context.Context, path compose.NodePath, state any) error {
			fmt.Println("state modifier for QA node happens. Path: ", path)

			state.(*State).Answers[nodeKey] = append(state.(*State).Answers[nodeKey], resumeData)
			return nil
		}
	default:
		panic(fmt.Sprintf("unimplemented interrupt event type: %v", e))
	}

	return stateModifier
}
