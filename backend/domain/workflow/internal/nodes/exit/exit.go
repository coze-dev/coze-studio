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

package exit

import (
	"context"
	"fmt"

	"github.com/bytedance/sonic"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/emitter"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type Config struct {
	Template      string
	TerminatePlan vo.TerminatePlan
}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	if n.Parent() != nil {
		return nil, fmt.Errorf("exit node cannot have parent: %s", n.Parent().ID)
	}

	if n.ID != entity.ExitNodeKey {
		return nil, fmt.Errorf("exit node id must be %s, got %s", entity.ExitNodeKey, n.ID)
	}

	ns := &schema.NodeSchema{
		Key:     entity.ExitNodeKey,
		Type:    entity.NodeTypeExit,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	var (
		content         *vo.BlockInput
		streamingOutput bool
	)
	if n.Data.Inputs.OutputEmitter != nil {
		content = n.Data.Inputs.Content
		streamingOutput = n.Data.Inputs.StreamingOutput
	}

	if streamingOutput {
		ns.StreamConfigs = &schema.StreamConfig{
			RequireStreamingInput: true,
		}
	} else {
		ns.StreamConfigs = &schema.StreamConfig{
			RequireStreamingInput: false,
		}
	}

	if content != nil {
		if content.Type != vo.VariableTypeString {
			return nil, fmt.Errorf("exit node's content type must be %s, got %s", vo.VariableTypeString, content.Type)
		}

		if content.Value.Type != vo.BlockInputValueTypeLiteral {
			return nil, fmt.Errorf("exit node's content value type must be %s, got %s", vo.BlockInputValueTypeLiteral, content.Value.Type)
		}

		if content.Value.Content != nil {
			c.Template = content.Value.Content.(string)
		}
	}

	if n.Data.Inputs.TerminatePlan == nil {
		return nil, fmt.Errorf("exit node requires a TerminatePlan")
	}
	c.TerminatePlan = *n.Data.Inputs.TerminatePlan

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (c *Config) Build(_ context.Context, ns *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	if c.TerminatePlan == vo.ReturnVariables {
		return &Exit{}, nil
	}

	return &emitter.OutputEmitter{
		Template:    c.Template,
		FullSources: ns.FullSources,
		NodeKey:     ns.Key,
	}, nil
}

type Exit struct{}

func (e *Exit) Invoke(_ context.Context, in map[string]any) (map[string]any, error) {
	if in == nil {
		return map[string]any{}, nil
	}
	return in, nil
}

func (e *Exit) ToCallbackOutput(ctx context.Context, out map[string]any) (
	*nodes.StructuredCallbackOutput, error) {
	c := execute.GetExeCtx(ctx)
	if c == nil {
		return &nodes.StructuredCallbackOutput{Output: out}, nil
	}
	if c.SubWorkflowCtx != nil {
		return &nodes.StructuredCallbackOutput{
			Output: out,
		}, nil
	}

	m, err := sonic.ConfigStd.MarshalToString(out)
	if err != nil {
		return nil, vo.WrapError(errno.ErrSerializationDeserializationFail, err)
	}

	return &nodes.StructuredCallbackOutput{
		Output: out,
		Answer: ptr.Of(m),
	}, nil
}
