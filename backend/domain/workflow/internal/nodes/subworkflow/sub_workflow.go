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

package subworkflow

import (
	"context"
	"fmt"
	"strconv"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/exit"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

type Config struct {
	WorkflowID      int64
	WorkflowVersion string
}

func (c *Config) FieldStreamType(path compose.FieldPath, ns *schema2.NodeSchema,
	sc *schema2.WorkflowSchema) (schema2.FieldStreamType, error) {
	if !sc.RequireStreaming() {
		return schema2.FieldNotStream, nil
	}

	innerWF := ns.SubWorkflowSchema

	if !innerWF.RequireStreaming() {
		return schema2.FieldNotStream, nil
	}

	innerExit := innerWF.GetNode(entity.ExitNodeKey)

	if innerExit.Configs.(*exit.Config).TerminatePlan == vo.ReturnVariables {
		return schema2.FieldNotStream, nil
	}

	if !innerExit.StreamConfigs.RequireStreamingInput {
		return schema2.FieldNotStream, nil
	}

	if len(path) > 1 || path[0] != "output" {
		return schema2.FieldNotStream, fmt.Errorf(
			"streaming answering sub-workflow node can only have out field 'output'")
	}

	return schema2.FieldIsStream, nil
}

type SubWorkflow struct {
	Runner compose.Runnable[map[string]any, map[string]any]
}

func (s *SubWorkflow) Invoke(ctx context.Context, in map[string]any, opts ...nodes.NodeOption) (map[string]any, error) {
	nestedOpts, nodeKey, err := prepareOptions(ctx, opts...)
	if err != nil {
		return nil, err
	}

	out, err := s.Runner.Invoke(ctx, in, nestedOpts...)
	if err != nil {
		interruptInfo, ok := compose.ExtractInterruptInfo(err)
		if !ok {
			return nil, err
		}

		iEvent := &entity.InterruptEvent{
			NodeKey:                  nodeKey,
			NodeType:                 entity.NodeTypeSubWorkflow,
			SubWorkflowInterruptInfo: interruptInfo,
		}

		err = compose.ProcessState(ctx, func(ctx context.Context, setter nodes.InterruptEventStore) error {
			return setter.SetInterruptEvent(nodeKey, iEvent)
		})
		if err != nil {
			return nil, err
		}

		return nil, compose.InterruptAndRerun
	}
	return out, nil
}

func (s *SubWorkflow) Stream(ctx context.Context, in map[string]any, opts ...nodes.NodeOption) (*schema.StreamReader[map[string]any], error) {
	nestedOpts, nodeKey, err := prepareOptions(ctx, opts...)
	if err != nil {
		return nil, err
	}

	out, err := s.Runner.Stream(ctx, in, nestedOpts...)
	if err != nil {
		interruptInfo, ok := compose.ExtractInterruptInfo(err)
		if !ok {
			return nil, err
		}

		iEvent := &entity.InterruptEvent{
			NodeKey:                  nodeKey,
			NodeType:                 entity.NodeTypeSubWorkflow,
			SubWorkflowInterruptInfo: interruptInfo,
		}

		err = compose.ProcessState(ctx, func(ctx context.Context, setter nodes.InterruptEventStore) error {
			return setter.SetInterruptEvent(nodeKey, iEvent)
		})
		if err != nil {
			return nil, err
		}

		return nil, compose.InterruptAndRerun
	}

	return out, nil
}

func prepareOptions(ctx context.Context, opts ...nodes.NodeOption) ([]compose.Option, vo.NodeKey, error) {
	options := nodes.GetCommonOptions(&nodes.NodeOptions{}, opts...)

	nestedOpts := options.GetOptsForNested()

	exeCtx := execute.GetExeCtx(ctx)
	if exeCtx == nil {
		panic("impossible. exeCtx in sub workflow is nil")
	}

	checkPointID := exeCtx.CheckPointID
	if len(checkPointID) > 0 {
		newCheckpointID := checkPointID
		if exeCtx.SubWorkflowCtx != nil {
			newCheckpointID += "_" + strconv.Itoa(int(exeCtx.SubWorkflowCtx.SubExecuteID))
		}
		newCheckpointID += "_" + strconv.Itoa(int(exeCtx.NodeCtx.NodeExecuteID))
		nestedOpts = append(nestedOpts, compose.WithCheckPointID(newCheckpointID))
	}

	if len(options.GetResumeIndexes()) > 0 {
		if len(options.GetResumeIndexes()) != 1 {
			return nil, "", fmt.Errorf("resume indexes for sub workflow length must be 1")
		}
		if _, ok := options.GetResumeIndexes()[0]; !ok {
			return nil, "", fmt.Errorf("resume indexes for sub workflow must resume index 0")
		}
		stateModifier, ok := options.GetResumeIndexes()[0]
		if ok {
			nestedOpts = append(nestedOpts, compose.WithStateModifier(stateModifier))
		}
	}

	return nestedOpts, exeCtx.NodeKey, nil
}
