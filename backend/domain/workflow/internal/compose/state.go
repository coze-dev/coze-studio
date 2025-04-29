package compose

import (
	"context"

	"github.com/cloudwego/eino/compose"

	workflow2 "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/execute"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/qa"
)

type State struct {
	VarHandler           *variable.Handler
	Answers              map[vo.NodeKey][]string
	Questions            map[vo.NodeKey][]*qa.Question
	Inputs               map[vo.NodeKey]map[string]any
	NodeExeContexts      map[vo.NodeKey]*execute.Context
	WorkflowExeContext   *execute.Context
	CompositeExeContexts map[vo.NodeKey]map[int]*execute.Context
	InterruptEvents      map[int64]*nodes.InterruptEvent
}

func init() {
	_ = compose.RegisterSerializableType[*State]("schema_state")
	_ = compose.RegisterSerializableType[*variable.Handler]("variable_handler")
	_ = compose.RegisterSerializableType[*nodes.ParentIntermediateStore]("parent_intermediate_store")
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
	_ = compose.RegisterSerializableType[*nodes.InterruptEvent]("interrupt_event")
	_ = compose.RegisterSerializableType[workflow2.EventType]("workflow_event_type")

	variable.SetVariableHandler(&variable.Handler{
		ParentIntermediateVarStore: &nodes.ParentIntermediateStore{},
	})
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

func (s *State) GetCompositeCtx(key vo.NodeKey, index int) (*execute.Context, bool, error) {
	if index2C, ok := s.CompositeExeContexts[key]; ok {
		if c, ok := index2C[index]; ok {
			return c, true, nil
		}
	}

	return nil, false, nil
}

func (s *State) SetCompositeCtx(key vo.NodeKey, index int, value *execute.Context) error {
	if _, ok := s.CompositeExeContexts[key]; !ok {
		s.CompositeExeContexts[key] = make(map[int]*execute.Context)
	}

	s.CompositeExeContexts[key][index] = value
	return nil
}

func (s *State) GetInterruptEvent(eventID int64) (*nodes.InterruptEvent, bool, error) {
	if v, ok := s.InterruptEvents[eventID]; ok {
		return v, true, nil
	}

	return nil, false, nil
}

func (s *State) SetInterruptEvent(eventID int64, value *nodes.InterruptEvent) error {
	s.InterruptEvents[eventID] = value
	return nil
}

func GenState() compose.GenLocalState[*State] {
	return func(ctx context.Context) (state *State) {
		return &State{
			VarHandler:           variable.GetVariableHandler(),
			Answers:              make(map[vo.NodeKey][]string),
			Questions:            make(map[vo.NodeKey][]*qa.Question),
			Inputs:               make(map[vo.NodeKey]map[string]any),
			NodeExeContexts:      make(map[vo.NodeKey]*execute.Context),
			CompositeExeContexts: make(map[vo.NodeKey]map[int]*execute.Context),
			InterruptEvents:      make(map[int64]*nodes.InterruptEvent),
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
