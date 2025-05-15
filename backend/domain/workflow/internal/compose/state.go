package compose

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"

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
	CompositeExeContexts map[vo.NodeKey]map[int]*execute.Context   `json:"-"`
	InterruptEvents      map[vo.NodeKey]*entity.InterruptEvent     `json:"interrupt_events,omitempty"`
	NestedWorkflowStates map[vo.NodeKey]*nodes.NestedWorkflowState `json:"nested_workflow_states,omitempty"`
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

func GenState() compose.GenLocalState[*State] {
	return func(ctx context.Context) (state *State) {
		return &State{
			Answers:              make(map[vo.NodeKey][]string),
			Questions:            make(map[vo.NodeKey][]*qa.Question),
			Inputs:               make(map[vo.NodeKey]map[string]any),
			NodeExeContexts:      make(map[vo.NodeKey]*execute.Context),
			CompositeExeContexts: make(map[vo.NodeKey]map[int]*execute.Context),
			InterruptEvents:      make(map[vo.NodeKey]*entity.InterruptEvent),
			NestedWorkflowStates: make(map[vo.NodeKey]*nodes.NestedWorkflowState),
		}
	}
}

func (s *NodeSchema) StatePreHandler() compose.StatePreHandler[map[string]any, *State] {
	var handlers []compose.StatePreHandler[map[string]any, *State]

	handlerForVars := s.statePreHandlerForVars()
	if handlerForVars != nil {
		handlers = append(handlers, handlerForVars)
	}

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
