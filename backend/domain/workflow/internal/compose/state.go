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
	"strings"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	workflow2 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/variable"
)

type State struct {
	NodeExeContexts      map[vo.NodeKey]*execute.Context               `json:"-"`
	WorkflowExeContext   *execute.Context                              `json:"-"`
	ExecutedNodes        map[vo.NodeKey]bool                           `json:"executed_nodes,omitempty"`
	SourceInfos          map[vo.NodeKey]map[string]*schema2.SourceInfo `json:"source_infos,omitempty"`
	Inputs               map[vo.NodeKey]map[string]any                 `json:"inputs,omitempty"`
	NestedWorkflowStates map[vo.NodeKey]*nodes.NestedWorkflowState     `json:"nested_workflow_states,omitempty"`

	ResumeData         map[vo.NodeKey]string         `json:"resume_data,omitempty"`
	IntermediateResult map[vo.NodeKey]map[string]any `json:"intermediate_result,omitempty"`
}

func init() {
	_ = compose.RegisterSerializableType[*State]("schema_state")
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
	_ = compose.RegisterSerializableType[workflowModel.ExecuteConfig]("execute_config")
	_ = compose.RegisterSerializableType[workflowModel.ExecuteMode]("execute_mode")
	_ = compose.RegisterSerializableType[workflowModel.TaskType]("task_type")
	_ = compose.RegisterSerializableType[workflowModel.SyncPattern]("sync_pattern")
	_ = compose.RegisterSerializableType[workflowModel.Locator]("wf_locator")
	_ = compose.RegisterSerializableType[workflowModel.BizType]("biz_type")
	_ = compose.RegisterSerializableType[*execute.AppVariables]("app_variables")
	_ = compose.RegisterSerializableType[workflow2.WorkflowMode]("workflow_mode")
	_ = compose.RegisterSerializableType[*schema.Message]("schema_message")
	_ = compose.RegisterSerializableType[*crossmessage.WfMessage]("history_messages")
	_ = compose.RegisterSerializableType[*crossmessage.Content]("content")
	_ = compose.RegisterSerializableType[*model.PromptTokenDetails]("prompt_token_details")

	_ = compose.RegisterSerializableType[*vo.TypeInfo]("type_info")
	_ = compose.RegisterSerializableType[vo.DataType]("data_type")
	_ = compose.RegisterSerializableType[vo.FileSubType]("file_sub_type")
	_ = compose.RegisterSerializableType[*workflowModel.FileInfo]("file_info")
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

func (s *State) GetDynamicStreamType(nodeKey vo.NodeKey, group string) (schema2.FieldStreamType, error) {
	choices, ok := s.IntermediateResult[nodeKey]
	if !ok {
		return schema2.FieldMaybeStream, fmt.Errorf("choice not found for node %s", nodeKey)
	}

	choice, ok := choices[group]
	if !ok {
		return schema2.FieldMaybeStream, fmt.Errorf("choice not found for node %s and group %s", nodeKey, group)
	}

	if choice == int64(-1) { // this group picks none of the elements
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

	subInfo, ok := groupInfo.SubSources[fmt.Sprintf("%v", choice)]
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
	choices, ok := s.IntermediateResult[nodeKey]
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

func (s *State) GetSourceForPath(nodeKey vo.NodeKey, path compose.FieldPath) *schema2.SourceInfo {
	if len(s.SourceInfos) == 0 {
		return nil
	}

	sources, ok := s.SourceInfos[nodeKey]
	if !ok || sources == nil {
		return nil
	}

	var source *schema2.SourceInfo
	for _, p := range path {
		source, ok = sources[p]
		if !ok {
			return nil
		}
	}

	return source
}

func (s *State) GetFullSources(nodeKey vo.NodeKey) map[string]*schema2.SourceInfo {
	if len(s.SourceInfos) == 0 {
		return nil
	}

	return s.SourceInfos[nodeKey]
}

func (s *State) NodeExecuted(key vo.NodeKey) bool {
	if key == compose.START {
		return true
	}
	_, ok := s.ExecutedNodes[key]
	return ok
}

func (s *State) GetAndClearResumeData(nodeKey vo.NodeKey) (string, bool) {
	rd, ok := s.ResumeData[nodeKey]
	if !ok {
		return "", false
	}

	delete(s.ResumeData, nodeKey)
	return rd, true
}

func (s *State) SetIntermediateResult(nodeKey vo.NodeKey, r map[string]any) {
	s.IntermediateResult[nodeKey] = r
}

func (s *State) GetIntermediateResult(nodeKey vo.NodeKey) map[string]any {
	return s.IntermediateResult[nodeKey]
}

func GenState() compose.GenLocalState[*State] {
	return func(ctx context.Context) (state *State) {
		return &State{
			Inputs:               make(map[vo.NodeKey]map[string]any),
			NodeExeContexts:      make(map[vo.NodeKey]*execute.Context),
			NestedWorkflowStates: make(map[vo.NodeKey]*nodes.NestedWorkflowState),
			ExecutedNodes:        make(map[vo.NodeKey]bool),
			SourceInfos:          make(map[vo.NodeKey]map[string]*schema2.SourceInfo),
			ResumeData:           make(map[vo.NodeKey]string),
			IntermediateResult:   make(map[vo.NodeKey]map[string]any),
		}
	}
}

func statePreHandler(s *schema2.NodeSchema, stream bool) compose.GraphAddNodeOpt {
	var (
		handlers       []compose.StatePreHandler[map[string]any, *State]
		streamHandlers []compose.StreamStatePreHandler[map[string]any, *State]
	)

	if entity.NodeMetaByNodeType(s.Type).PersistInputOnInterrupt {
		handlers = append(handlers, func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			if _, ok := state.Inputs[s.Key]; !ok {
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

	if s.FullSources != nil && !stream {
		handlers = append(handlers, func(ctx context.Context, in map[string]any, state *State) (map[string]any, error) {
			resolved, err := nodes.ResolveStreamSources(ctx, s.FullSources, state, state)
			if err != nil {
				return nil, err
			}

			state.SourceInfos[s.Key] = resolved
			return in, nil
		})
	}

	if len(handlers) > 0 || !stream {
		handlerForVars := statePreHandlerForVars(s)
		if handlerForVars != nil {
			handlers = append(handlers, handlerForVars)
		}

		if len(handlers) == 0 {
			return nil
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

	if s.FullSources != nil {
		streamHandlers = append(streamHandlers, func(ctx context.Context, in *schema.StreamReader[map[string]any], state *State) (*schema.StreamReader[map[string]any], error) {
			resolved, err := nodes.ResolveStreamSources(ctx, s.FullSources, state, state)
			if err != nil {
				return nil, err
			}

			state.SourceInfos[s.Key] = resolved
			return in, nil
		})
	}

	handlerForVars := streamStatePreHandlerForVars(s)
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

func GenStateModifierByEventType(_ entity.InterruptEventType,
	nodeKey vo.NodeKey,
	resumeData string,
	_ workflowModel.ExecuteConfig) (stateModifier compose.StateModifier) {
	stateModifier = func(ctx context.Context, path compose.NodePath, state any) (err error) {
		state.(*State).ResumeData[nodeKey] = resumeData
		return nil
	}

	return stateModifier
}
