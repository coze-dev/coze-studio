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

package schema

import (
	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

// NodeSchema is the universal description and configuration for a workflow Node.
// It should contain EVERYTHING a node needs to instantiate.
type NodeSchema struct {
	// Key is the node key within the Eino graph.
	// A node may need this information during execution,
	// e.g.
	// - using this Key to query workflow State for data belonging to current node.
	Key vo.NodeKey `json:"key"`

	// Name is the name for this node as specified on Canvas.
	// A node may show this name on Canvas as part of this node's input/output.
	Name string `json:"name"`

	// Type is the NodeType for the node.
	Type entity.NodeType `json:"type"`

	// Configs are node specific configurations, with actual struct type defined by each Node Type.
	// Will not hold information relating to field mappings, nor as node's static values.
	// In a word, these Configs are INTERNAL to node's implementation, NOT related to workflow orchestration.
	// Actual type of these Configs should implement two interfaces:
	// - NodeAdaptor: to provide conversion from vo.Node to NodeSchema
	// - NodeBuilder: to provide instantiation from NodeSchema to actual node instance.
	Configs any `json:"configs,omitempty"`

	// InputTypes are type information about the node's input fields.
	InputTypes map[string]*vo.TypeInfo `json:"input_types,omitempty"`
	// InputSources are field mapping information about the node's input fields.
	InputSources []*vo.FieldInfo `json:"input_sources,omitempty"`

	// OutputTypes are type information about the node's output fields.
	OutputTypes map[string]*vo.TypeInfo `json:"output_types,omitempty"`
	// OutputSources are field mapping information about the node's output fields.
	// NOTE: only applicable to composite nodes such as NodeTypeBatch or NodeTypeLoop.
	OutputSources []*vo.FieldInfo `json:"output_sources,omitempty"`

	// ExceptionConfigs are about exception handling strategy of the node.
	ExceptionConfigs *ExceptionConfig `json:"exception_configs,omitempty"`
	// StreamConfigs are streaming characteristics of the node.
	StreamConfigs *StreamConfig `json:"stream_configs,omitempty"`

	// SubWorkflowBasic is basic information of the sub workflow if this node is NodeTypeSubWorkflow.
	SubWorkflowBasic *entity.WorkflowBasic `json:"sub_workflow_basic,omitempty"`
	// SubWorkflowSchema is WorkflowSchema of the sub workflow if this node is NodeTypeSubWorkflow.
	SubWorkflowSchema *WorkflowSchema `json:"sub_workflow_schema,omitempty"`

	// FullSources contains more complete information about a node's input fields' mapping sources,
	// such as whether a field's source is a 'streaming field',
	// or whether the field is an object that contains sub-fields with real mappings.
	// Used for those nodes that need to process streaming input.
	// Set InputSourceAware = true in NodeMeta to enable.
	FullSources map[string]*SourceInfo

	// Lambda directly sets the node to be an Eino Lambda.
	// NOTE: not serializable, used ONLY for internal test.
	Lambda *compose.Lambda
}

type RequireCheckpoint interface {
	RequireCheckpoint() bool
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

func (s *NodeSchema) SetConfigKV(key string, value any) {
	if s.Configs == nil {
		s.Configs = make(map[string]any)
	}

	s.Configs.(map[string]any)[key] = value
}

func (s *NodeSchema) SetInputType(key string, t *vo.TypeInfo) {
	if s.InputTypes == nil {
		s.InputTypes = make(map[string]*vo.TypeInfo)
	}
	s.InputTypes[key] = t
}

func (s *NodeSchema) AddInputSource(info ...*vo.FieldInfo) {
	s.InputSources = append(s.InputSources, info...)
}

func (s *NodeSchema) SetOutputType(key string, t *vo.TypeInfo) {
	if s.OutputTypes == nil {
		s.OutputTypes = make(map[string]*vo.TypeInfo)
	}
	s.OutputTypes[key] = t
}

func (s *NodeSchema) AddOutputSource(info ...*vo.FieldInfo) {
	s.OutputSources = append(s.OutputSources, info...)
}

type ChatHistoryAware interface {
	ChatHistoryEnabled() bool
	ChatHistoryRounds() int64
}
