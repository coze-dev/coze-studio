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

package agent

import (
	"context"
	"fmt"
	"strings"

	"github.com/cloudwego/eino/compose"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

const (
	defaultTimeoutMS = 30_000
	defaultRetry     = 3
)

type Config struct {
	Platform   string            `json:"platform"`
	AgentURL   string            `json:"agent_url"`
	AgentKey   string            `json:"agent_key"`
	Query      string            `json:"query"`
	Inputs     map[string]string `json:"inputs"`
	TimeoutMS  int               `json:"timeout"`
	RetryCount int               `json:"retry_count"`

	AssociateStartNodeUserInputFields map[string]struct{} `json:"-"`
}

func NewConfig() *Config {
	return &Config{
		TimeoutMS:                         defaultTimeoutMS,
		RetryCount:                        defaultRetry,
		Inputs:                            map[string]string{},
		AssociateStartNodeUserInputFields: map[string]struct{}{},
	}
}

func (c *Config) Adapt(ctx context.Context, n *vo.Node, opts ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	if entity.IDStrToNodeType(n.Type) != entity.NodeTypeAgent {
		return nil, fmt.Errorf("invalid node type for Agent: %s", n.Type)
	}

	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeAgent,
		Name:    "",
		Configs: c,
	}

	if n.Data != nil && n.Data.Meta != nil {
		ns.Name = n.Data.Meta.Title
	}

	// Extract agent specific configuration from node inputs when available.
	if n.Data != nil && n.Data.Inputs != nil && n.Data.Inputs.InputParameters != nil {
		var names []string
		for _, param := range n.Data.Inputs.InputParameters {
			if param != nil {
				names = append(names, param.Name)
			}
		}
		logs.Infof("[agent.adapt] input parameter names=%v", names)
	}

	if n.Data != nil && n.Data.Inputs != nil && n.Data.Inputs.Agent != nil {
		agentCfg := n.Data.Inputs.Agent
		if agentCfg.Platform != "" {
			c.Platform = strings.ToLower(agentCfg.Platform)
		}
		if agentCfg.AgentURL != "" {
			c.AgentURL = agentCfg.AgentURL
		}
		if agentCfg.AgentKey != "" {
			c.AgentKey = agentCfg.AgentKey
		}
		if agentCfg.Timeout > 0 {
			c.TimeoutMS = agentCfg.Timeout
		}
		if agentCfg.RetryCount > 0 {
			c.RetryCount = agentCfg.RetryCount
		}
		if agentCfg.Query != nil && agentCfg.Query.Value != nil &&
			agentCfg.Query.Value.Type == vo.BlockInputValueTypeLiteral {
			if str, ok := agentCfg.Query.Value.Content.(string); ok {
				c.Query = str
			}
		}
		if len(agentCfg.Inputs) > 0 {
			c.Inputs = make(map[string]string, len(agentCfg.Inputs))
			for k, v := range agentCfg.Inputs {
				c.Inputs[k] = v
			}
		}
	}

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}
	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if _, exists := ns.InputTypes["query"]; !exists {
		if n.Data != nil && n.Data.Inputs != nil && n.Data.Inputs.Agent != nil && n.Data.Inputs.Agent.Query != nil {
			tInfo, err := convert.CanvasBlockInputToTypeInfo(n.Data.Inputs.Agent.Query)
			if err != nil {
				return nil, err
			}

			sources, err := convert.CanvasBlockInputToFieldInfo(n.Data.Inputs.Agent.Query, compose.FieldPath{"query"}, n.Parent())
			if err != nil {
				return nil, err
			}

			ns.SetInputType("query", tInfo)
			ns.AddInputSource(sources...)
		}
	}

	if len(ns.InputSources) > 0 {
		if c.AssociateStartNodeUserInputFields == nil {
			c.AssociateStartNodeUserInputFields = make(map[string]struct{})
		}
		for _, info := range ns.InputSources {
			if len(info.Path) != 1 || info.Source.Ref == nil {
				continue
			}
			if info.Source.Ref.FromNodeKey != entity.EntryNodeKey {
				continue
			}
			if !compose.FromFieldPath(info.Source.Ref.FromPath).Equals(compose.FromField("USER_INPUT")) {
				continue
			}
			c.AssociateStartNodeUserInputFields[info.Path[0]] = struct{}{}
		}
	}

	ensureAgentOutputTypes(ns)

	return ns, nil
}

func (c *Config) Build(ctx context.Context, ns *schema.NodeSchema, opts ...schema.BuildOption) (any, error) {
	cfg := c.clone()
	builder := &Agent{
		baseConfig: cfg,
	}
	return builder, nil
}

func (c *Config) clone() *Config {
	cp := *c
	if c.Inputs != nil {
		cp.Inputs = make(map[string]string, len(c.Inputs))
		for k, v := range c.Inputs {
			cp.Inputs[k] = v
		}
	}
	if c.AssociateStartNodeUserInputFields != nil {
		cp.AssociateStartNodeUserInputFields = make(map[string]struct{}, len(c.AssociateStartNodeUserInputFields))
		for k := range c.AssociateStartNodeUserInputFields {
			cp.AssociateStartNodeUserInputFields[k] = struct{}{}
		}
	}
	return &cp
}

func ensureAgentOutputTypes(ns *schema.NodeSchema) {
	if ns.OutputTypes == nil {
		ns.OutputTypes = map[string]*vo.TypeInfo{}
	}
	if _, ok := ns.OutputTypes["answer"]; !ok {
		ns.SetOutputType("answer", &vo.TypeInfo{Type: vo.DataTypeString})
	}
	if _, ok := ns.OutputTypes["platform"]; !ok {
		ns.SetOutputType("platform", &vo.TypeInfo{Type: vo.DataTypeString})
	}
	if _, ok := ns.OutputTypes["metadata"]; !ok {
		ns.SetOutputType("metadata", &vo.TypeInfo{Type: vo.DataTypeObject})
	}
}
